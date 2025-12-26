"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const common_1 = require("@nestjs/common");
/**
 * Parameter decorator to extract the organization ID from the request
 * This should be used with the ApiKeyGuard which attaches the organizationId to the request
 */
exports.Organization = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const organizationId = request.organizationId;
    if (!organizationId) {
        throw new Error('Organization ID not found in request. Make sure ApiKeyGuard is applied.');
    }
    return organizationId;
});
