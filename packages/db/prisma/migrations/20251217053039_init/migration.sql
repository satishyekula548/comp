-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "AttachmentEntityType" AS ENUM ('task', 'vendor', 'risk', 'comment', 'trust_nda');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('image', 'video', 'audio', 'document', 'other');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'admin', 'auditor', 'employee', 'contractor');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('draft', 'published', 'needs_review');

-- CreateEnum
CREATE TYPE "EvidenceAutomationRunStatus" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "EvidenceAutomationTrigger" AS ENUM ('manual', 'scheduled', 'api');

-- CreateEnum
CREATE TYPE "EvidenceAutomationEvaluationStatus" AS ENUM ('pass', 'fail');

-- CreateEnum
CREATE TYPE "CommentEntityType" AS ENUM ('task', 'vendor', 'risk', 'policy');

-- CreateEnum
CREATE TYPE "KnowledgeBaseDocumentProcessingStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "PolicyDisplayFormat" AS ENUM ('EDITOR', 'PDF');

-- CreateEnum
CREATE TYPE "QuestionnaireStatus" AS ENUM ('parsing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "QuestionnaireAnswerStatus" AS ENUM ('untouched', 'generated', 'manual');

-- CreateEnum
CREATE TYPE "RiskTreatmentType" AS ENUM ('accept', 'avoid', 'mitigate', 'transfer');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('customer', 'fraud', 'governance', 'operations', 'other', 'people', 'regulatory', 'reporting', 'resilience', 'technology', 'vendor_management');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('open', 'pending', 'closed', 'archived');

-- CreateEnum
CREATE TYPE "AuditLogEntityType" AS ENUM ('organization', 'framework', 'requirement', 'control', 'policy', 'task', 'people', 'risk', 'vendor', 'tests', 'integration', 'trust');

-- CreateEnum
CREATE TYPE "Departments" AS ENUM ('none', 'admin', 'gov', 'hr', 'it', 'itsm', 'qms');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('monthly', 'quarterly', 'yearly');

-- CreateEnum
CREATE TYPE "Likelihood" AS ENUM ('very_unlikely', 'unlikely', 'possible', 'likely', 'very_likely');

-- CreateEnum
CREATE TYPE "Impact" AS ENUM ('insignificant', 'minor', 'moderate', 'major', 'severe');

-- CreateEnum
CREATE TYPE "SOADocumentStatus" AS ENUM ('draft', 'in_progress', 'needs_review', 'completed');

-- CreateEnum
CREATE TYPE "SOAAnswerStatus" AS ENUM ('untouched', 'generated', 'manual');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done', 'not_relevant', 'failed');

-- CreateEnum
CREATE TYPE "TaskFrequency" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- CreateEnum
CREATE TYPE "TrustStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "FrameworkStatus" AS ENUM ('started', 'in_progress', 'compliant');

-- CreateEnum
CREATE TYPE "TrustAccessRequestStatus" AS ENUM ('under_review', 'approved', 'denied', 'canceled');

-- CreateEnum
CREATE TYPE "TrustAccessGrantStatus" AS ENUM ('active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "TrustNDAStatus" AS ENUM ('pending', 'signed', 'void');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('cloud', 'infrastructure', 'software_as_a_service', 'finance', 'marketing', 'sales', 'hr', 'other');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('not_assessed', 'in_progress', 'assessed');

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('att'::text),
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "AttachmentEntityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "commentId" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('usr'::text),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "emailNotificationsUnsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "emailPreferences" JSONB DEFAULT '{"policyNotifications":true,"taskReminders":true,"weeklyTaskDigest":true,"unassignedItemsNotifications":true}',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeTrainingVideoCompletion" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('evc'::text),
    "completedAt" TIMESTAMP(3),
    "videoId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "EmployeeTrainingVideoCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('ses'::text),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeOrganizationId" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('acc'::text),
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('ver'::text),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jwks" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('jwk'::text),
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jwks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('mem'::text),
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Departments" NOT NULL DEFAULT 'none',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivated" BOOLEAN NOT NULL DEFAULT false,
    "fleetDmLabelId" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('inv'::text),
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAutomationRun" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('ear'::text),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "evidenceAutomationId" TEXT NOT NULL,
    "status" "EvidenceAutomationRunStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "success" BOOLEAN,
    "error" TEXT,
    "logs" JSONB,
    "output" JSONB,
    "evaluationStatus" "EvidenceAutomationEvaluationStatus",
    "evaluationReason" TEXT,
    "triggeredBy" "EvidenceAutomationTrigger" NOT NULL DEFAULT 'scheduled',
    "runDuration" INTEGER,
    "version" INTEGER,
    "taskId" TEXT,

    CONSTRAINT "EvidenceAutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAutomationVersion" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('eav'::text),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "evidenceAutomationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "scriptKey" TEXT NOT NULL,
    "publishedBy" TEXT,
    "changelog" TEXT,

    CONSTRAINT "EvidenceAutomationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAutomation" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('aut'::text),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "chatHistory" TEXT,
    "evaluationCriteria" TEXT,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "EvidenceAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('cmt'::text),
    "content" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "CommentEntityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Context" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('ctx'::text),
    "organizationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('ctl'::text),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lastReviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "controlTemplateId" TEXT,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkEditorVideo" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('frk_vi'::text),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkEditorVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkEditorFramework" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('frk'::text),
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkEditorFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkEditorRequirement" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('frk_rq'::text),
    "frameworkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkEditorRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkEditorPolicyTemplate" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('frk_pt'::text),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "department" "Departments" NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkEditorPolicyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkEditorTaskTemplate" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('frk_tt'::text),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "department" "Departments" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkEditorTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkEditorControlTemplate" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('frk_ct'::text),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkEditorControlTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkInstance" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('frm'::text),
    "organizationId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,

    CONSTRAINT "FrameworkInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('int'::text),
    "name" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "userSettings" JSONB NOT NULL,
    "organizationId" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationResult" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('itr'::text),
    "title" TEXT,
    "description" TEXT,
    "remediation" TEXT,
    "status" TEXT,
    "severity" TEXT,
    "resultDetails" JSONB,
    "completedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignedUserId" TEXT,

    CONSTRAINT "IntegrationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseDocument" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('kbd'::text),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "s3Key" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "processingStatus" "KnowledgeBaseDocumentProcessingStatus" NOT NULL DEFAULT 'pending',
    "processedAt" TIMESTAMP(3),
    "triggerRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Onboarding" (
    "organizationId" TEXT NOT NULL,
    "policies" BOOLEAN NOT NULL DEFAULT false,
    "employees" BOOLEAN NOT NULL DEFAULT false,
    "vendors" BOOLEAN NOT NULL DEFAULT false,
    "integrations" BOOLEAN NOT NULL DEFAULT false,
    "risk" BOOLEAN NOT NULL DEFAULT false,
    "team" BOOLEAN NOT NULL DEFAULT false,
    "tasks" BOOLEAN NOT NULL DEFAULT false,
    "callBooked" BOOLEAN NOT NULL DEFAULT false,
    "companyBookingDetails" JSONB,
    "companyDetails" JSONB,
    "triggerJobId" TEXT,
    "triggerJobCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('org'::text),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT generate_prefixed_cuid('slug'::text),
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    "website" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "hasAccess" BOOLEAN NOT NULL DEFAULT false,
    "advancedModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fleetDmLabelId" INTEGER,
    "isFleetSetupCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('pol'::text),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PolicyStatus" NOT NULL DEFAULT 'draft',
    "content" JSONB[],
    "frequency" "Frequency",
    "department" "Departments",
    "isRequiredToSign" BOOLEAN NOT NULL DEFAULT true,
    "signedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewDate" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "displayFormat" "PolicyDisplayFormat" NOT NULL DEFAULT 'EDITOR',
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastArchivedAt" TIMESTAMP(3),
    "lastPublishedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "approverId" TEXT,
    "policyTemplateId" TEXT,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('qst'::text),
    "filename" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "QuestionnaireStatus" NOT NULL DEFAULT 'parsing',
    "parsedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireQuestionAnswer" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('qqa'::text),
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" "QuestionnaireAnswerStatus" NOT NULL DEFAULT 'untouched',
    "questionIndex" INTEGER NOT NULL,
    "sources" JSONB,
    "generatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionnaireId" TEXT NOT NULL,

    CONSTRAINT "QuestionnaireQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementMap" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('req'::text),
    "requirementId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "frameworkInstanceId" TEXT NOT NULL,

    CONSTRAINT "RequirementMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('rsk'::text),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RiskCategory" NOT NULL,
    "department" "Departments",
    "status" "RiskStatus" NOT NULL DEFAULT 'open',
    "likelihood" "Likelihood" NOT NULL DEFAULT 'very_unlikely',
    "impact" "Impact" NOT NULL DEFAULT 'insignificant',
    "residualLikelihood" "Likelihood" NOT NULL DEFAULT 'very_unlikely',
    "residualImpact" "Impact" NOT NULL DEFAULT 'insignificant',
    "treatmentStrategyDescription" TEXT,
    "treatmentStrategy" "RiskTreatmentType" NOT NULL DEFAULT 'accept',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assigneeId" TEXT,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secrets" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('sec'::text),
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityQuestionnaireManualAnswer" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('sqma'::text),
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceQuestionnaireId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "SecurityQuestionnaireManualAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('apk'::text),
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "salt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('aud'::text),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memberId" TEXT,
    "data" JSONB NOT NULL,
    "description" TEXT,
    "entityId" TEXT,
    "entityType" "AuditLogEntityType",

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalVendors" (
    "website" TEXT NOT NULL,
    "company_name" TEXT,
    "legal_name" TEXT,
    "company_description" TEXT,
    "company_hq_address" TEXT,
    "privacy_policy_url" TEXT,
    "terms_of_service_url" TEXT,
    "service_level_agreement_url" TEXT,
    "security_page_url" TEXT,
    "trust_page_url" TEXT,
    "security_certifications" TEXT[],
    "subprocessors" TEXT[],
    "type_of_company" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalVendors_pkey" PRIMARY KEY ("website")
);

-- CreateTable
CREATE TABLE "SOAFrameworkConfiguration" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('soa_cfg'::text),
    "frameworkId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "columns" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOAFrameworkConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SOADocument" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('soa_doc'::text),
    "frameworkId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "status" "SOADocumentStatus" NOT NULL DEFAULT 'draft',
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
    "preparedBy" TEXT NOT NULL DEFAULT 'Comp AI',
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOADocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SOAAnswer" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('soa_ans'::text),
    "documentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT,
    "status" "SOAAnswerStatus" NOT NULL DEFAULT 'untouched',
    "sources" JSONB,
    "generatedAt" TIMESTAMP(3),
    "answerVersion" INTEGER NOT NULL DEFAULT 1,
    "isLatestAnswer" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOAAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('tsk'::text),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "frequency" "TaskFrequency",
    "department" "Departments" DEFAULT 'none',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastCompletedAt" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "organizationId" TEXT NOT NULL,
    "taskTemplateId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trust" (
    "organizationId" TEXT NOT NULL,
    "friendlyUrl" TEXT,
    "domain" TEXT,
    "domainVerified" BOOLEAN NOT NULL DEFAULT false,
    "isVercelDomain" BOOLEAN NOT NULL DEFAULT false,
    "vercelVerification" TEXT,
    "status" "TrustStatus" NOT NULL DEFAULT 'draft',
    "contactEmail" TEXT,
    "email" TEXT,
    "privacyPolicy" TEXT,
    "soc2" BOOLEAN NOT NULL DEFAULT false,
    "soc2type1" BOOLEAN NOT NULL DEFAULT false,
    "soc2type2" BOOLEAN NOT NULL DEFAULT false,
    "iso27001" BOOLEAN NOT NULL DEFAULT false,
    "iso42001" BOOLEAN NOT NULL DEFAULT false,
    "nen7510" BOOLEAN NOT NULL DEFAULT false,
    "gdpr" BOOLEAN NOT NULL DEFAULT false,
    "hipaa" BOOLEAN NOT NULL DEFAULT false,
    "pci_dss" BOOLEAN NOT NULL DEFAULT false,
    "iso9001" BOOLEAN NOT NULL DEFAULT false,
    "soc2_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "soc2type1_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "soc2type2_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "iso27001_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "iso42001_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "nen7510_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "gdpr_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "hipaa_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "pci_dss_status" "FrameworkStatus" NOT NULL DEFAULT 'started',
    "iso9001_status" "FrameworkStatus" NOT NULL DEFAULT 'started',

    CONSTRAINT "Trust_pkey" PRIMARY KEY ("status","organizationId")
);

-- CreateTable
CREATE TABLE "TrustAccessRequest" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('tar'::text),
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "jobTitle" TEXT,
    "purpose" TEXT,
    "requestedDurationDays" INTEGER,
    "status" "TrustAccessRequestStatus" NOT NULL DEFAULT 'under_review',
    "reviewerMemberId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "decisionReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustAccessGrant" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('tag'::text),
    "accessRequestId" TEXT NOT NULL,
    "subjectEmail" TEXT NOT NULL,
    "status" "TrustAccessGrantStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accessToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "issuedByMemberId" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedByMemberId" TEXT,
    "revokeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustNDAAgreement" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('tna'::text),
    "organizationId" TEXT NOT NULL,
    "accessRequestId" TEXT NOT NULL,
    "grantId" TEXT,
    "signerName" TEXT,
    "signerEmail" TEXT,
    "status" "TrustNDAStatus" NOT NULL DEFAULT 'pending',
    "signToken" TEXT NOT NULL,
    "signTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "pdfTemplateKey" TEXT,
    "pdfSignedKey" TEXT,
    "signedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustNDAAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustDocument" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('tdoc'::text),
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "s3Key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('vnd'::text),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "VendorCategory" NOT NULL DEFAULT 'other',
    "status" "VendorStatus" NOT NULL DEFAULT 'not_assessed',
    "inherentProbability" "Likelihood" NOT NULL DEFAULT 'very_unlikely',
    "inherentImpact" "Impact" NOT NULL DEFAULT 'insignificant',
    "residualProbability" "Likelihood" NOT NULL DEFAULT 'very_unlikely',
    "residualImpact" "Impact" NOT NULL DEFAULT 'insignificant',
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assigneeId" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorContact" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('vct'::text),
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ControlToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ControlToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ControlToPolicy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ControlToPolicy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FrameworkEditorControlTemplateToFrameworkEditorPolicyTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorPolicyT_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FrameworkEditorControlTemplateToFrameworkEditorRequirement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorRequire_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FrameworkEditorControlTemplateToFrameworkEditorTaskTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorTaskTem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RiskToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RiskToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TaskToVendor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskToVendor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Attachment_entityId_entityType_idx" ON "Attachment"("entityId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "EmployeeTrainingVideoCompletion_memberId_idx" ON "EmployeeTrainingVideoCompletion"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTrainingVideoCompletion_memberId_videoId_key" ON "EmployeeTrainingVideoCompletion"("memberId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "EvidenceAutomationRun_evidenceAutomationId_idx" ON "EvidenceAutomationRun"("evidenceAutomationId");

-- CreateIndex
CREATE INDEX "EvidenceAutomationRun_status_idx" ON "EvidenceAutomationRun"("status");

-- CreateIndex
CREATE INDEX "EvidenceAutomationRun_createdAt_idx" ON "EvidenceAutomationRun"("createdAt");

-- CreateIndex
CREATE INDEX "EvidenceAutomationRun_version_idx" ON "EvidenceAutomationRun"("version");

-- CreateIndex
CREATE INDEX "EvidenceAutomationVersion_evidenceAutomationId_idx" ON "EvidenceAutomationVersion"("evidenceAutomationId");

-- CreateIndex
CREATE INDEX "EvidenceAutomationVersion_createdAt_idx" ON "EvidenceAutomationVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceAutomationVersion_evidenceAutomationId_version_key" ON "EvidenceAutomationVersion"("evidenceAutomationId", "version");

-- CreateIndex
CREATE INDEX "EvidenceAutomation_taskId_idx" ON "EvidenceAutomation"("taskId");

-- CreateIndex
CREATE INDEX "Comment_entityId_idx" ON "Comment"("entityId");

-- CreateIndex
CREATE INDEX "Context_organizationId_idx" ON "Context"("organizationId");

-- CreateIndex
CREATE INDEX "Context_question_idx" ON "Context"("question");

-- CreateIndex
CREATE INDEX "Context_answer_idx" ON "Context"("answer");

-- CreateIndex
CREATE INDEX "Context_tags_idx" ON "Context"("tags");

-- CreateIndex
CREATE INDEX "Control_organizationId_idx" ON "Control"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkInstance_organizationId_frameworkId_key" ON "FrameworkInstance"("organizationId", "frameworkId");

-- CreateIndex
CREATE INDEX "Integration_organizationId_idx" ON "Integration"("organizationId");

-- CreateIndex
CREATE INDEX "IntegrationResult_integrationId_idx" ON "IntegrationResult"("integrationId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseDocument_organizationId_idx" ON "KnowledgeBaseDocument"("organizationId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseDocument_organizationId_processingStatus_idx" ON "KnowledgeBaseDocument"("organizationId", "processingStatus");

-- CreateIndex
CREATE INDEX "KnowledgeBaseDocument_s3Key_idx" ON "KnowledgeBaseDocument"("s3Key");

-- CreateIndex
CREATE INDEX "KnowledgeBaseDocument_triggerRunId_idx" ON "KnowledgeBaseDocument"("triggerRunId");

-- CreateIndex
CREATE INDEX "Onboarding_organizationId_idx" ON "Onboarding"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Policy_organizationId_idx" ON "Policy"("organizationId");

-- CreateIndex
CREATE INDEX "Questionnaire_organizationId_idx" ON "Questionnaire"("organizationId");

-- CreateIndex
CREATE INDEX "Questionnaire_organizationId_createdAt_idx" ON "Questionnaire"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Questionnaire_status_idx" ON "Questionnaire"("status");

-- CreateIndex
CREATE INDEX "QuestionnaireQuestionAnswer_questionnaireId_idx" ON "QuestionnaireQuestionAnswer"("questionnaireId");

-- CreateIndex
CREATE INDEX "QuestionnaireQuestionAnswer_questionnaireId_questionIndex_idx" ON "QuestionnaireQuestionAnswer"("questionnaireId", "questionIndex");

-- CreateIndex
CREATE INDEX "QuestionnaireQuestionAnswer_status_idx" ON "QuestionnaireQuestionAnswer"("status");

-- CreateIndex
CREATE INDEX "RequirementMap_requirementId_frameworkInstanceId_idx" ON "RequirementMap"("requirementId", "frameworkInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementMap_controlId_frameworkInstanceId_requirementId_key" ON "RequirementMap"("controlId", "frameworkInstanceId", "requirementId");

-- CreateIndex
CREATE INDEX "Risk_organizationId_idx" ON "Risk"("organizationId");

-- CreateIndex
CREATE INDEX "Risk_category_idx" ON "Risk"("category");

-- CreateIndex
CREATE INDEX "Risk_status_idx" ON "Risk"("status");

-- CreateIndex
CREATE UNIQUE INDEX "secrets_organization_id_name_key" ON "secrets"("organization_id", "name");

-- CreateIndex
CREATE INDEX "SecurityQuestionnaireManualAnswer_organizationId_idx" ON "SecurityQuestionnaireManualAnswer"("organizationId");

-- CreateIndex
CREATE INDEX "SecurityQuestionnaireManualAnswer_organizationId_question_idx" ON "SecurityQuestionnaireManualAnswer"("organizationId", "question");

-- CreateIndex
CREATE INDEX "SecurityQuestionnaireManualAnswer_tags_idx" ON "SecurityQuestionnaireManualAnswer"("tags");

-- CreateIndex
CREATE INDEX "SecurityQuestionnaireManualAnswer_createdAt_idx" ON "SecurityQuestionnaireManualAnswer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityQuestionnaireManualAnswer_organizationId_question_key" ON "SecurityQuestionnaireManualAnswer"("organizationId", "question");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_memberId_idx" ON "AuditLog"("memberId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalVendors_website_key" ON "GlobalVendors"("website");

-- CreateIndex
CREATE INDEX "GlobalVendors_website_idx" ON "GlobalVendors"("website");

-- CreateIndex
CREATE INDEX "SOAFrameworkConfiguration_frameworkId_idx" ON "SOAFrameworkConfiguration"("frameworkId");

-- CreateIndex
CREATE INDEX "SOAFrameworkConfiguration_frameworkId_version_idx" ON "SOAFrameworkConfiguration"("frameworkId", "version");

-- CreateIndex
CREATE INDEX "SOAFrameworkConfiguration_frameworkId_isLatest_idx" ON "SOAFrameworkConfiguration"("frameworkId", "isLatest");

-- CreateIndex
CREATE UNIQUE INDEX "SOAFrameworkConfiguration_frameworkId_version_key" ON "SOAFrameworkConfiguration"("frameworkId", "version");

-- CreateIndex
CREATE INDEX "SOADocument_frameworkId_organizationId_idx" ON "SOADocument"("frameworkId", "organizationId");

-- CreateIndex
CREATE INDEX "SOADocument_frameworkId_organizationId_version_idx" ON "SOADocument"("frameworkId", "organizationId", "version");

-- CreateIndex
CREATE INDEX "SOADocument_frameworkId_organizationId_isLatest_idx" ON "SOADocument"("frameworkId", "organizationId", "isLatest");

-- CreateIndex
CREATE INDEX "SOADocument_configurationId_idx" ON "SOADocument"("configurationId");

-- CreateIndex
CREATE INDEX "SOADocument_status_idx" ON "SOADocument"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SOADocument_frameworkId_organizationId_version_key" ON "SOADocument"("frameworkId", "organizationId", "version");

-- CreateIndex
CREATE INDEX "SOAAnswer_documentId_idx" ON "SOAAnswer"("documentId");

-- CreateIndex
CREATE INDEX "SOAAnswer_documentId_questionId_idx" ON "SOAAnswer"("documentId", "questionId");

-- CreateIndex
CREATE INDEX "SOAAnswer_documentId_questionId_isLatestAnswer_idx" ON "SOAAnswer"("documentId", "questionId", "isLatestAnswer");

-- CreateIndex
CREATE INDEX "SOAAnswer_status_idx" ON "SOAAnswer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SOAAnswer_documentId_questionId_answerVersion_key" ON "SOAAnswer"("documentId", "questionId", "answerVersion");

-- CreateIndex
CREATE UNIQUE INDEX "Trust_friendlyUrl_key" ON "Trust"("friendlyUrl");

-- CreateIndex
CREATE INDEX "Trust_organizationId_idx" ON "Trust"("organizationId");

-- CreateIndex
CREATE INDEX "Trust_friendlyUrl_idx" ON "Trust"("friendlyUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Trust_organizationId_key" ON "Trust"("organizationId");

-- CreateIndex
CREATE INDEX "TrustAccessRequest_organizationId_idx" ON "TrustAccessRequest"("organizationId");

-- CreateIndex
CREATE INDEX "TrustAccessRequest_email_idx" ON "TrustAccessRequest"("email");

-- CreateIndex
CREATE INDEX "TrustAccessRequest_status_idx" ON "TrustAccessRequest"("status");

-- CreateIndex
CREATE INDEX "TrustAccessRequest_organizationId_status_idx" ON "TrustAccessRequest"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TrustAccessGrant_accessRequestId_key" ON "TrustAccessGrant"("accessRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustAccessGrant_accessToken_key" ON "TrustAccessGrant"("accessToken");

-- CreateIndex
CREATE INDEX "TrustAccessGrant_accessRequestId_idx" ON "TrustAccessGrant"("accessRequestId");

-- CreateIndex
CREATE INDEX "TrustAccessGrant_subjectEmail_idx" ON "TrustAccessGrant"("subjectEmail");

-- CreateIndex
CREATE INDEX "TrustAccessGrant_status_idx" ON "TrustAccessGrant"("status");

-- CreateIndex
CREATE INDEX "TrustAccessGrant_expiresAt_idx" ON "TrustAccessGrant"("expiresAt");

-- CreateIndex
CREATE INDEX "TrustAccessGrant_status_expiresAt_idx" ON "TrustAccessGrant"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "TrustAccessGrant_accessToken_idx" ON "TrustAccessGrant"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "TrustNDAAgreement_grantId_key" ON "TrustNDAAgreement"("grantId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustNDAAgreement_signToken_key" ON "TrustNDAAgreement"("signToken");

-- CreateIndex
CREATE INDEX "TrustNDAAgreement_organizationId_idx" ON "TrustNDAAgreement"("organizationId");

-- CreateIndex
CREATE INDEX "TrustNDAAgreement_accessRequestId_idx" ON "TrustNDAAgreement"("accessRequestId");

-- CreateIndex
CREATE INDEX "TrustNDAAgreement_signToken_idx" ON "TrustNDAAgreement"("signToken");

-- CreateIndex
CREATE INDEX "TrustNDAAgreement_status_idx" ON "TrustNDAAgreement"("status");

-- CreateIndex
CREATE INDEX "TrustDocument_organizationId_idx" ON "TrustDocument"("organizationId");

-- CreateIndex
CREATE INDEX "TrustDocument_organizationId_isActive_idx" ON "TrustDocument"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Vendor_organizationId_idx" ON "Vendor"("organizationId");

-- CreateIndex
CREATE INDEX "Vendor_assigneeId_idx" ON "Vendor"("assigneeId");

-- CreateIndex
CREATE INDEX "Vendor_category_idx" ON "Vendor"("category");

-- CreateIndex
CREATE INDEX "VendorContact_vendorId_idx" ON "VendorContact"("vendorId");

-- CreateIndex
CREATE INDEX "_ControlToTask_B_index" ON "_ControlToTask"("B");

-- CreateIndex
CREATE INDEX "_ControlToPolicy_B_index" ON "_ControlToPolicy"("B");

-- CreateIndex
CREATE INDEX "_FrameworkEditorControlTemplateToFrameworkEditorPolicyT_B_index" ON "_FrameworkEditorControlTemplateToFrameworkEditorPolicyTemplate"("B");

-- CreateIndex
CREATE INDEX "_FrameworkEditorControlTemplateToFrameworkEditorRequire_B_index" ON "_FrameworkEditorControlTemplateToFrameworkEditorRequirement"("B");

-- CreateIndex
CREATE INDEX "_FrameworkEditorControlTemplateToFrameworkEditorTaskTem_B_index" ON "_FrameworkEditorControlTemplateToFrameworkEditorTaskTemplate"("B");

-- CreateIndex
CREATE INDEX "_RiskToTask_B_index" ON "_RiskToTask"("B");

-- CreateIndex
CREATE INDEX "_TaskToVendor_B_index" ON "_TaskToVendor"("B");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTrainingVideoCompletion" ADD CONSTRAINT "EmployeeTrainingVideoCompletion_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAutomationRun" ADD CONSTRAINT "EvidenceAutomationRun_evidenceAutomationId_fkey" FOREIGN KEY ("evidenceAutomationId") REFERENCES "EvidenceAutomation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAutomationRun" ADD CONSTRAINT "EvidenceAutomationRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAutomationVersion" ADD CONSTRAINT "EvidenceAutomationVersion_evidenceAutomationId_fkey" FOREIGN KEY ("evidenceAutomationId") REFERENCES "EvidenceAutomation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAutomation" ADD CONSTRAINT "EvidenceAutomation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Context" ADD CONSTRAINT "Context_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_controlTemplateId_fkey" FOREIGN KEY ("controlTemplateId") REFERENCES "FrameworkEditorControlTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkEditorRequirement" ADD CONSTRAINT "FrameworkEditorRequirement_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "FrameworkEditorFramework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkInstance" ADD CONSTRAINT "FrameworkInstance_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "FrameworkEditorFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkInstance" ADD CONSTRAINT "FrameworkInstance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationResult" ADD CONSTRAINT "IntegrationResult_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationResult" ADD CONSTRAINT "IntegrationResult_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseDocument" ADD CONSTRAINT "KnowledgeBaseDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_policyTemplateId_fkey" FOREIGN KEY ("policyTemplateId") REFERENCES "FrameworkEditorPolicyTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questionnaire" ADD CONSTRAINT "Questionnaire_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireQuestionAnswer" ADD CONSTRAINT "QuestionnaireQuestionAnswer_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementMap" ADD CONSTRAINT "RequirementMap_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "FrameworkEditorRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementMap" ADD CONSTRAINT "RequirementMap_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementMap" ADD CONSTRAINT "RequirementMap_frameworkInstanceId_fkey" FOREIGN KEY ("frameworkInstanceId") REFERENCES "FrameworkInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityQuestionnaireManualAnswer" ADD CONSTRAINT "SecurityQuestionnaireManualAnswer_sourceQuestionnaireId_fkey" FOREIGN KEY ("sourceQuestionnaireId") REFERENCES "Questionnaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityQuestionnaireManualAnswer" ADD CONSTRAINT "SecurityQuestionnaireManualAnswer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOAFrameworkConfiguration" ADD CONSTRAINT "SOAFrameworkConfiguration_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "FrameworkEditorFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOADocument" ADD CONSTRAINT "SOADocument_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "FrameworkEditorFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOADocument" ADD CONSTRAINT "SOADocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOADocument" ADD CONSTRAINT "SOADocument_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "SOAFrameworkConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOADocument" ADD CONSTRAINT "SOADocument_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOAAnswer" ADD CONSTRAINT "SOAAnswer_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SOADocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "FrameworkEditorTaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trust" ADD CONSTRAINT "Trust_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustAccessRequest" ADD CONSTRAINT "TrustAccessRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustAccessRequest" ADD CONSTRAINT "TrustAccessRequest_reviewerMemberId_fkey" FOREIGN KEY ("reviewerMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustAccessGrant" ADD CONSTRAINT "TrustAccessGrant_accessRequestId_fkey" FOREIGN KEY ("accessRequestId") REFERENCES "TrustAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustAccessGrant" ADD CONSTRAINT "TrustAccessGrant_issuedByMemberId_fkey" FOREIGN KEY ("issuedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustAccessGrant" ADD CONSTRAINT "TrustAccessGrant_revokedByMemberId_fkey" FOREIGN KEY ("revokedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustNDAAgreement" ADD CONSTRAINT "TrustNDAAgreement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustNDAAgreement" ADD CONSTRAINT "TrustNDAAgreement_accessRequestId_fkey" FOREIGN KEY ("accessRequestId") REFERENCES "TrustAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustNDAAgreement" ADD CONSTRAINT "TrustNDAAgreement_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "TrustAccessGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustDocument" ADD CONSTRAINT "TrustDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorContact" ADD CONSTRAINT "VendorContact_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControlToTask" ADD CONSTRAINT "_ControlToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControlToTask" ADD CONSTRAINT "_ControlToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControlToPolicy" ADD CONSTRAINT "_ControlToPolicy_A_fkey" FOREIGN KEY ("A") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControlToPolicy" ADD CONSTRAINT "_ControlToPolicy_B_fkey" FOREIGN KEY ("B") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrameworkEditorControlTemplateToFrameworkEditorPolicyTemplate" ADD CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorPolicyTe_A_fkey" FOREIGN KEY ("A") REFERENCES "FrameworkEditorControlTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrameworkEditorControlTemplateToFrameworkEditorPolicyTemplate" ADD CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorPolicyTe_B_fkey" FOREIGN KEY ("B") REFERENCES "FrameworkEditorPolicyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrameworkEditorControlTemplateToFrameworkEditorRequirement" ADD CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorRequirem_A_fkey" FOREIGN KEY ("A") REFERENCES "FrameworkEditorControlTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrameworkEditorControlTemplateToFrameworkEditorRequirement" ADD CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorRequirem_B_fkey" FOREIGN KEY ("B") REFERENCES "FrameworkEditorRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrameworkEditorControlTemplateToFrameworkEditorTaskTemplate" ADD CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorTaskTemp_A_fkey" FOREIGN KEY ("A") REFERENCES "FrameworkEditorControlTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrameworkEditorControlTemplateToFrameworkEditorTaskTemplate" ADD CONSTRAINT "_FrameworkEditorControlTemplateToFrameworkEditorTaskTemp_B_fkey" FOREIGN KEY ("B") REFERENCES "FrameworkEditorTaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RiskToTask" ADD CONSTRAINT "_RiskToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RiskToTask" ADD CONSTRAINT "_RiskToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToVendor" ADD CONSTRAINT "_TaskToVendor_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToVendor" ADD CONSTRAINT "_TaskToVendor_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
