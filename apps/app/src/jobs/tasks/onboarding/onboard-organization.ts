import { db } from '@db';
import { logger, metadata, queue, task, tasks } from '@trigger.dev/sdk';
import axios from 'axios';
import { generateAuditorContentTask } from '../auditor/generate-auditor-content';
import { generateRiskMitigationsForOrg } from './generate-risk-mitigation';
import { generateVendorMitigationsForOrg } from './generate-vendor-mitigation';
import {
  createRisks,
  createVendors,
  extractVendorsFromContext,
  getOrganizationContext,
  updateOrganizationPolicies,
} from './onboard-organization-helpers';

// v4 queues must be declared in advance
const onboardOrgQueue = queue({
  name: 'onboard-organization',
  concurrencyLimit: 50,
});

export const onboardOrganization = task({
  id: 'onboard-organization',
  queue: onboardOrgQueue,
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { organizationId: string }) => {
    logger.info(`Start onboarding organization ${payload.organizationId}`);

    // Initialize metadata
    metadata.set('currentStep', 'Researching Vendors...');
    metadata.set('vendors', false);
    metadata.set('risk', false);
    metadata.set('policies', false);

    try {
      const {
        organization,
        questionsAndAnswers,
        policies,
      } = await getOrganizationContext(payload.organizationId);

      const policyList = policies ?? [];

      // Policy metadata
      if (policyList.length > 0) {
        metadata.set('policiesTotal', policyList.length);
        metadata.set('policiesCompleted', 0);
        metadata.set('policiesRemaining', policyList.length);
        metadata.set(
          'policiesInfo',
          policyList.map((p) => ({ id: p.id, name: p.name })),
        );
        policyList.forEach((p) => {
          metadata.set(`policy_${p.id}_status`, 'queued');
        });
      } else {
        metadata.set('policiesTotal', 0);
        metadata.set('policiesCompleted', 0);
        metadata.set('policiesRemaining', 0);
        metadata.set('policiesInfo', []);
      }

      // Load frameworks
      const frameworkInstances = await db.frameworkInstance.findMany({
        where: { organizationId: payload.organizationId },
      });

      const frameworks = await db.frameworkEditorFramework.findMany({
        where: {
          id: {
            in: frameworkInstances.map((i) => i.frameworkId),
          },
        },
      });

      // Get owner
      const owner = await db.member.findFirst({
        where: {
          organizationId: payload.organizationId,
          role: { contains: 'owner' },
          deactivated: false,
        },
      });

      if (!owner) {
        throw new Error(`Owner not found for organization ${payload.organizationId}`);
      }

      // Ensure owner roles
      await db.member.update({
        where: { id: owner.id },
        data: { role: 'owner,employee' },
      });

      // Assign tasks
      await db.task.updateMany({
        where: { organizationId: payload.organizationId },
        data: { assigneeId: owner.id, frequency: 'quarterly' },
      });

      // Extract vendors
      const vendorData = await extractVendorsFromContext(questionsAndAnswers);

      if (vendorData.length > 0) {
        metadata.set('vendorsTotal', vendorData.length);
        metadata.set('vendorsCompleted', 0);
        metadata.set('vendorsRemaining', vendorData.length);
        metadata.set(
          'vendorsInfo',
          vendorData.map((v, i) => ({ id: `temp_${i}`, name: v.vendor_name })),
        );
        vendorData.forEach((_, i) => {
          metadata.set(`vendor_temp_${i}_status`, 'pending');
        });
      }

      // ✅ FIX: createVendors only takes (questionsAndAnswers, organizationId)
      const vendors = await createVendors(
        questionsAndAnswers,
        payload.organizationId,
      );

      if (vendors.length > 0) {
        metadata.set(
          'vendorsInfo',
          vendors.map((v) => ({ id: v.id, name: v.name })),
        );
        vendors.forEach((v) => {
          metadata.set(`vendor_${v.id}_status`, 'assessing');
        });
      }

      metadata.set('vendors', true);
      metadata.set('currentStep', 'Creating Risks...');

      // Vendor mitigations
      await tasks.trigger<typeof generateVendorMitigationsForOrg>(
        'generate-vendor-mitigations-for-org',
        { organizationId: payload.organizationId },
      );

      const risks = await createRisks(
        questionsAndAnswers,
        payload.organizationId,
      );

      risks.forEach((r) => {
        metadata.set(`risk_${r.id}_status`, 'assessing');
      });

      metadata.set('risk', true);

      const policyCount = policyList.length;
      metadata.set('currentStep', `Tailoring Policies... (0/${policyCount})`);

      // Risk mitigations
      await tasks.trigger<typeof generateRiskMitigationsForOrg>(
        'generate-risk-mitigations-for-org',
        { organizationId: payload.organizationId },
      );

      // ✅ FIX: protect frameworks argument
      await updateOrganizationPolicies(
        payload.organizationId,
        questionsAndAnswers,
        Array.isArray(frameworks) ? frameworks : [],
      );

      metadata.set('policies', true);
      metadata.set('currentStep', 'Finalizing...');
      metadata.set('completed', true);

      await db.onboarding.update({
        where: { organizationId: payload.organizationId },
        data: { triggerJobCompleted: true },
      });

      logger.info(`Onboarding completed for organization ${payload.organizationId}`);
    } catch (error) {
      logger.error(`Onboarding failed for ${payload.organizationId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    const organizationId = payload.organizationId;

    // Revalidate UI
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/revalidate/path`,
        {
          path: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${organizationId}`,
          secret: process.env.REVALIDATION_SECRET,
          type: 'layout',
        },
      );
    } catch (err) {
      logger.error('Error revalidating path', { err });
    }

    // Auditor content
    await tasks.trigger<typeof generateAuditorContentTask>(
      'generate-auditor-content',
      { organizationId },
    );
  },
});
