import { openai } from '@ai-sdk/openai';
import {
  CommentEntityType,
  db,
  Departments,
  FrameworkEditorFramework,
  Impact,
  Likelihood,
  Risk,
  RiskCategory,
  RiskStatus,
  RiskTreatmentType,
  VendorCategory,
} from '@db';
import { logger, tasks } from '@trigger.dev/sdk';
import { generateObject, generateText, jsonSchema } from 'ai';
import type { researchVendor } from '../scrape/research';
import { RISK_MITIGATION_PROMPT } from './prompts/risk-mitigation';
import { VENDOR_RISK_ASSESSMENT_PROMPT } from './prompts/vendor-risk-assessment';
import { updatePolicy } from './update-policy';

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

export type ContextItem = {
  question: string;
  answer: string;
};

export type PolicyContext = {
  name: string;
  description: string | null;
};

export type VendorData = {
  vendor_name: string;
  vendor_website: string;
  vendor_description: string;
  category: VendorCategory;
  inherent_probability: Likelihood;
  inherent_impact: Impact;
  residual_probability: Likelihood;
  residual_impact: Impact;
};

export type RiskData = {
  risk_name: string;
  risk_description: string;
  risk_treatment_strategy: RiskTreatmentType;
  risk_treatment_strategy_description: string;
  risk_residual_probability: Likelihood;
  risk_residual_impact: Impact;
  category: RiskCategory;
  department: Departments;
};

type OrganizationRecord = NonNullable<
  Awaited<ReturnType<typeof db.organization.findUnique>>
>;

type OrganizationContextResult = {
  organization: OrganizationRecord;
  questionsAndAnswers: ContextItem[];
  policies: { id: string; name: string; description: string | null }[];
};

/* ------------------------------------------------------------------ */
/* BASELINE RISKS */
/* ------------------------------------------------------------------ */

const BASELINE_RISKS = [
  {
    title: 'Intentional Fraud and Misuse',
    description:
      'Intentional misrepresentation or deception by an internal actor or the organization.',
    category: 'governance' as RiskCategory,
    department: 'gov' as Departments,
    status: 'closed' as RiskStatus,
  },
];

/* ------------------------------------------------------------------ */
/* ORGANIZATION CONTEXT */
/* ------------------------------------------------------------------ */

export async function getOrganizationContext(
  organizationId: string,
): Promise<OrganizationContextResult> {
  const [organization, contextHub, policies] = await Promise.all([
    db.organization.findUnique({ where: { id: organizationId } }),
    db.context.findMany({ where: { organizationId } }),
    db.policy.findMany({
      where: { organizationId },
      select: { id: true, name: true, description: true },
    }),
  ]);

  if (!organization) {
    throw new Error(`Organization ${organizationId} not found`);
  }

  return {
    organization,
    questionsAndAnswers: contextHub.map((c) => ({
      question: c.question,
      answer: c.answer,
    })),
    policies,
  };
}

/* ------------------------------------------------------------------ */
/* AI VENDOR EXTRACTION */
/* ------------------------------------------------------------------ */

export async function extractVendorsFromContext(
  questionsAndAnswers: ContextItem[],
): Promise<VendorData[]> {
  const { object } = await generateObject({
    model: openai('gpt-4.1-mini'),
    mode: 'json',
    schema: jsonSchema({
      type: 'object',
      properties: {
        vendors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              vendor_name: { type: 'string' },
              vendor_website: { type: 'string' },
              vendor_description: { type: 'string' },
              category: { type: 'string', enum: Object.values(VendorCategory) },
              inherent_probability: { type: 'string', enum: Object.values(Likelihood) },
              inherent_impact: { type: 'string', enum: Object.values(Impact) },
              residual_probability: { type: 'string', enum: Object.values(Likelihood) },
              residual_impact: { type: 'string', enum: Object.values(Impact) },
            },
            required: [
              'vendor_name',
              'vendor_website',
              'vendor_description',
              'category',
              'inherent_probability',
              'inherent_impact',
              'residual_probability',
              'residual_impact',
            ],
          },
        },
      },
      required: ['vendors'],
    }),
    prompt: questionsAndAnswers.map((q) => q.answer).join('\n'),
  });

  return (object as any).vendors ?? [];
}

/* ------------------------------------------------------------------ */
/* COMMENTS */
/* ------------------------------------------------------------------ */

export async function findCommentAuthor(organizationId: string) {
  return db.member.findFirst({
    where: {
      organizationId,
      OR: [{ role: { contains: 'owner' } }, { role: { contains: 'admin' } }],
      deactivated: false,
    },
    orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
  });
}

export async function createVendorRiskComment(
  vendor: any,
  policies: PolicyContext[],
  organizationId: string,
  authorId: string,
) {
  const result = await generateText({
    model: openai('gpt-5-mini'),
    system: VENDOR_RISK_ASSESSMENT_PROMPT,
    prompt: `Vendor: ${vendor.name}`,
  });

  await db.comment.create({
    data: {
      content: result.text,
      entityId: vendor.id,
      entityType: CommentEntityType.vendor,
      authorId,
      organizationId,
    },
  });
}

export async function createRiskMitigationComment(
  risk: Risk,
  policies: PolicyContext[],
  organizationId: string,
  authorId: string,
) {
  const result = await generateText({
    model: openai('gpt-5-mini'),
    system: RISK_MITIGATION_PROMPT,
    prompt: `Risk: ${risk.title}`,
  });

  await db.comment.create({
    data: {
      content: result.text,
      entityId: risk.id,
      entityType: CommentEntityType.risk,
      authorId,
      organizationId,
    },
  });
}

/* ------------------------------------------------------------------ */
/* VENDORS & RISKS (✅ FIXED) */
/* ------------------------------------------------------------------ */

export async function createVendors(
  questionsAndAnswers: ContextItem[],
  organizationId: string,
) {
  const vendors = await extractVendorsFromContext(questionsAndAnswers);

  const created = await Promise.all(
    vendors.map((v) =>
      db.vendor.create({
        data: {
          organizationId,

          // Prisma required
          name: v.vendor_name,
          description: v.vendor_description,

          // Optional fields
          website: v.vendor_website,
          category: v.category,

          // ✅ Correct camelCase Prisma fields
          inherentProbability: v.inherent_probability,
          inherentImpact: v.inherent_impact,
          residualProbability: v.residual_probability,
          residualImpact: v.residual_impact,
        },
      }),
    ),
  );

  for (const vendor of created) {
    await tasks.trigger<typeof researchVendor>('research-vendor', {
      website: vendor.website ?? '',
    });
  }

  return created;
}

export async function createRisks(
  questionsAndAnswers: ContextItem[],
  organizationId: string,
): Promise<Risk[]> {
  const created: Risk[] = [];

  for (const base of BASELINE_RISKS) {
    const exists = await db.risk.findFirst({
      where: { organizationId, title: base.title },
    });

    if (!exists) {
      created.push(
        await db.risk.create({
          data: { ...base, organizationId },
        }),
      );
    }
  }

  return created;
}

/* ------------------------------------------------------------------ */
/* POLICY UPDATES */
/* ------------------------------------------------------------------ */

export async function updateOrganizationPolicies(
  organizationId: string,
  questionsAndAnswers: ContextItem[],
  frameworks: FrameworkEditorFramework[] = [],
): Promise<void> {
  const safeFrameworks = frameworks.filter(
    (f: any) => f && typeof f === 'object' && f.governance,
  );

  if (!safeFrameworks.length) {
    logger.warn('[updateOrganizationPolicies] No governance frameworks');
    return;
  }

  const policies = await db.policy.findMany({
    where: { organizationId },
  });

  if (!policies.length) return;

  await updatePolicy.batchTriggerAndWait(
    policies.map((policy) => ({
      payload: {
        organizationId,
        policyId: policy.id,
        contextHub: questionsAndAnswers
          .map((c) => `${c.question}\n${c.answer}`)
          .join('\n'),
        frameworks: safeFrameworks,
      },
      concurrencyKey: organizationId,
    })),
  );
}

// Backward-compatible export
export const triggerPolicyUpdates = updateOrganizationPolicies;
