"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const openai_1 = require("@ai-sdk/openai");
const ai_1 = require("ai");
const auth_context_decorator_1 = require("../auth/auth-context.decorator");
const hybrid_auth_guard_1 = require("../auth/hybrid-auth.guard");
const create_policy_dto_1 = require("./dto/create-policy.dto");
const update_policy_dto_1 = require("./dto/update-policy.dto");
const ai_suggest_policy_dto_1 = require("./dto/ai-suggest-policy.dto");
const policies_service_1 = require("./policies.service");
const get_all_policies_responses_1 = require("./schemas/get-all-policies.responses");
const get_policy_by_id_responses_1 = require("./schemas/get-policy-by-id.responses");
const create_policy_responses_1 = require("./schemas/create-policy.responses");
const update_policy_responses_1 = require("./schemas/update-policy.responses");
const delete_policy_responses_1 = require("./schemas/delete-policy.responses");
const policy_operations_1 = require("./schemas/policy-operations");
const policy_params_1 = require("./schemas/policy-params");
const policy_bodies_1 = require("./schemas/policy-bodies");
const policy_responses_dto_1 = require("./dto/policy-responses.dto");
let PoliciesController = class PoliciesController {
    policiesService;
    constructor(policiesService) {
        this.policiesService = policiesService;
    }
    async getAllPolicies(organizationId, authContext) {
        const policies = await this.policiesService.findAll(organizationId);
        return {
            data: policies,
            authType: authContext.authType,
            ...(authContext.userId && {
                authenticatedUser: {
                    id: authContext.userId,
                    email: authContext.userEmail,
                },
            }),
        };
    }
    async getPolicy(id, organizationId, authContext) {
        const policy = await this.policiesService.findById(id, organizationId);
        return {
            ...policy,
            authType: authContext.authType,
            ...(authContext.userId && {
                authenticatedUser: {
                    id: authContext.userId,
                    email: authContext.userEmail,
                },
            }),
        };
    }
    async createPolicy(createData, organizationId, authContext) {
        const policy = await this.policiesService.create(organizationId, createData);
        return {
            ...policy,
            authType: authContext.authType,
            ...(authContext.userId && {
                authenticatedUser: {
                    id: authContext.userId,
                    email: authContext.userEmail,
                },
            }),
        };
    }
    async updatePolicy(id, updateData, organizationId, authContext) {
        const updatedPolicy = await this.policiesService.updateById(id, organizationId, updateData);
        return {
            ...updatedPolicy,
            authType: authContext.authType,
            ...(authContext.userId && {
                authenticatedUser: {
                    id: authContext.userId,
                    email: authContext.userEmail,
                },
            }),
        };
    }
    async deletePolicy(id, organizationId, authContext) {
        const result = await this.policiesService.deleteById(id, organizationId);
        return {
            ...result,
            authType: authContext.authType,
            ...(authContext.userId && {
                authenticatedUser: {
                    id: authContext.userId,
                    email: authContext.userEmail,
                },
            }),
        };
    }
    async aiChatPolicy(id, organizationId, body, res) {
        if (!process.env.OPENAI_API_KEY) {
            throw new common_1.HttpException('AI service not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        const policy = await this.policiesService.findById(id, organizationId);
        const policyContentText = this.convertPolicyContentToText(policy.content);
        const systemPrompt = `You are an expert GRC (Governance, Risk, and Compliance) policy editor. You help users edit and improve their organizational policies to meet compliance requirements like SOC 2, ISO 27001, and GDPR.

Current Policy Name: ${policy.name}
${policy.description ? `Policy Description: ${policy.description}` : ''}

Current Policy Content:
---
${policyContentText}
---

Your role:
1. Help users understand and improve their policies
2. Suggest specific changes when asked
3. Ensure policies remain compliant with relevant frameworks
4. Maintain professional, clear language appropriate for official documentation

When the user asks you to make changes to the policy:
1. First explain what changes you'll make and why
2. Then provide the COMPLETE updated policy content in a code block with the label \`\`\`policy
3. The policy content inside the code block should be in markdown format

IMPORTANT: When providing updated policy content, you MUST include the ENTIRE policy, not just the changed sections. The content in the \`\`\`policy code block will replace the entire current policy.

Keep responses helpful and focused on the policy editing task.`;
        const messages = [
            ...(body.chatHistory || []).map((msg) => ({
                id: crypto.randomUUID(),
                role: msg.role,
                content: msg.content,
                parts: [{ type: 'text', text: msg.content }],
            })),
            {
                id: crypto.randomUUID(),
                role: 'user',
                content: body.instructions,
                parts: [{ type: 'text', text: body.instructions }],
            },
        ];
        const result = (0, ai_1.streamText)({
            model: (0, openai_1.openai)('gpt-5.1'),
            system: systemPrompt,
            messages: (0, ai_1.convertToModelMessages)(messages),
        });
        return result.pipeTextStreamToResponse(res);
    }
    convertPolicyContentToText(content) {
        if (!content)
            return '';
        const contentArray = Array.isArray(content) ? content : [content];
        const extractText = (node) => {
            if (!node || typeof node !== 'object')
                return '';
            const n = node;
            if (n.type === 'text' && typeof n.text === 'string') {
                return n.text;
            }
            if (Array.isArray(n.content)) {
                const texts = n.content.map(extractText).filter(Boolean);
                switch (n.type) {
                    case 'heading': {
                        const level = n.attrs?.level || 1;
                        return ('\n' + '#'.repeat(Number(level)) + ' ' + texts.join('') + '\n');
                    }
                    case 'paragraph':
                        return texts.join('') + '\n';
                    case 'bulletList':
                    case 'orderedList':
                        return '\n' + texts.join('');
                    case 'listItem':
                        return '- ' + texts.join('') + '\n';
                    case 'blockquote':
                        return '\n> ' + texts.join('\n> ') + '\n';
                    default:
                        return texts.join('');
                }
            }
            return '';
        };
        return contentArray.map(extractText).join('\n').trim();
    }
};
exports.PoliciesController = PoliciesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)(policy_operations_1.POLICY_OPERATIONS.getAllPolicies),
    (0, swagger_1.ApiResponse)(get_all_policies_responses_1.GET_ALL_POLICIES_RESPONSES[200]),
    (0, swagger_1.ApiResponse)(get_all_policies_responses_1.GET_ALL_POLICIES_RESPONSES[401]),
    __param(0, (0, auth_context_decorator_1.OrganizationId)()),
    __param(1, (0, auth_context_decorator_1.AuthContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "getAllPolicies", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)(policy_operations_1.POLICY_OPERATIONS.getPolicyById),
    (0, swagger_1.ApiParam)(policy_params_1.POLICY_PARAMS.policyId),
    (0, swagger_1.ApiResponse)(get_policy_by_id_responses_1.GET_POLICY_BY_ID_RESPONSES[200]),
    (0, swagger_1.ApiResponse)(get_policy_by_id_responses_1.GET_POLICY_BY_ID_RESPONSES[401]),
    (0, swagger_1.ApiResponse)(get_policy_by_id_responses_1.GET_POLICY_BY_ID_RESPONSES[404]),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_context_decorator_1.OrganizationId)()),
    __param(2, (0, auth_context_decorator_1.AuthContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "getPolicy", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)(policy_operations_1.POLICY_OPERATIONS.createPolicy),
    (0, swagger_1.ApiBody)(policy_bodies_1.POLICY_BODIES.createPolicy),
    (0, swagger_1.ApiResponse)(create_policy_responses_1.CREATE_POLICY_RESPONSES[201]),
    (0, swagger_1.ApiResponse)(create_policy_responses_1.CREATE_POLICY_RESPONSES[400]),
    (0, swagger_1.ApiResponse)(create_policy_responses_1.CREATE_POLICY_RESPONSES[401]),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_context_decorator_1.OrganizationId)()),
    __param(2, (0, auth_context_decorator_1.AuthContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_policy_dto_1.CreatePolicyDto, String, Object]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)(policy_operations_1.POLICY_OPERATIONS.updatePolicy),
    (0, swagger_1.ApiParam)(policy_params_1.POLICY_PARAMS.policyId),
    (0, swagger_1.ApiBody)(policy_bodies_1.POLICY_BODIES.updatePolicy),
    (0, swagger_1.ApiResponse)(update_policy_responses_1.UPDATE_POLICY_RESPONSES[200]),
    (0, swagger_1.ApiResponse)(update_policy_responses_1.UPDATE_POLICY_RESPONSES[400]),
    (0, swagger_1.ApiResponse)(update_policy_responses_1.UPDATE_POLICY_RESPONSES[401]),
    (0, swagger_1.ApiResponse)(update_policy_responses_1.UPDATE_POLICY_RESPONSES[404]),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_context_decorator_1.OrganizationId)()),
    __param(3, (0, auth_context_decorator_1.AuthContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_policy_dto_1.UpdatePolicyDto, String, Object]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)(policy_operations_1.POLICY_OPERATIONS.deletePolicy),
    (0, swagger_1.ApiParam)(policy_params_1.POLICY_PARAMS.policyId),
    (0, swagger_1.ApiResponse)(delete_policy_responses_1.DELETE_POLICY_RESPONSES[200]),
    (0, swagger_1.ApiResponse)(delete_policy_responses_1.DELETE_POLICY_RESPONSES[401]),
    (0, swagger_1.ApiResponse)(delete_policy_responses_1.DELETE_POLICY_RESPONSES[404]),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_context_decorator_1.OrganizationId)()),
    __param(2, (0, auth_context_decorator_1.AuthContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "deletePolicy", null);
__decorate([
    (0, common_1.Post)(':id/ai-chat'),
    (0, swagger_1.ApiOperation)({
        summary: 'Chat with AI about a policy',
        description: 'Stream AI responses for policy editing assistance. Returns a text/event-stream with AI-generated suggestions.',
    }),
    (0, swagger_1.ApiParam)(policy_params_1.POLICY_PARAMS.policyId),
    (0, swagger_1.ApiBody)({ type: ai_suggest_policy_dto_1.AISuggestPolicyRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Streaming AI response',
        content: {
            'text/event-stream': {
                schema: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_context_decorator_1.OrganizationId)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ai_suggest_policy_dto_1.AISuggestPolicyRequestDto, Object]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "aiChatPolicy", null);
exports.PoliciesController = PoliciesController = __decorate([
    (0, swagger_1.ApiTags)('Policies'),
    (0, swagger_1.ApiExtraModels)(policy_responses_dto_1.PolicyResponseDto),
    (0, common_1.Controller)({ path: 'policies', version: '1' }),
    (0, common_1.UseGuards)(hybrid_auth_guard_1.HybridAuthGuard),
    (0, swagger_1.ApiSecurity)('apikey'),
    (0, swagger_1.ApiHeader)({
        name: 'X-Organization-Id',
        description: 'Organization ID (required for session auth, optional for API key auth)',
        required: false,
    }),
    __metadata("design:paramtypes", [policies_service_1.PoliciesService])
], PoliciesController);
