"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsApiKeyAuth = exports.UserId = exports.OrganizationId = exports.AuthContext = void 0;
const common_1 = require("@nestjs/common");
/**
 * Parameter decorator to extract the full authentication context
 * Works with both API key and session authentication
 */
exports.AuthContext = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const { organizationId, authType, isApiKey, userId, userEmail } = request;
    if (!organizationId || !authType) {
        throw new Error('Authentication context not found. Ensure HybridAuthGuard is applied.');
    }
    return {
        organizationId,
        authType,
        isApiKey,
        userId,
        userEmail,
    };
});
/**
 * Parameter decorator to extract just the organization ID
 */
exports.OrganizationId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const { organizationId } = request;
    if (!organizationId) {
        throw new Error('Organization ID not found. Ensure HybridAuthGuard is applied.');
    }
    return organizationId;
});
/**
 * Parameter decorator to extract the user ID (only available for session auth)
 */
exports.UserId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const { userId, authType } = request;
    if (authType === 'api-key') {
        throw new Error('User ID is not available for API key authentication');
    }
    if (!userId) {
        throw new Error('User ID not found. Ensure HybridAuthGuard is applied and using session auth.');
    }
    return userId;
});
/**
 * Parameter decorator to check if the request is authenticated via API key
 */
exports.IsApiKeyAuth = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.isApiKey;
});
