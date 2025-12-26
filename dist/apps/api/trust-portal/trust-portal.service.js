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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TrustPortalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustPortalService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let TrustPortalService = TrustPortalService_1 = class TrustPortalService {
    logger = new common_1.Logger(TrustPortalService_1.name);
    vercelApi;
    constructor() {
        const bearerToken = process.env.VERCEL_ACCESS_TOKEN;
        if (!bearerToken) {
            this.logger.warn('VERCEL_ACCESS_TOKEN is not set');
        }
        // Initialize axios instance for Vercel API
        this.vercelApi = axios_1.default.create({
            baseURL: 'https://api.vercel.com',
            headers: {
                Authorization: `Bearer ${bearerToken || ''}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async getDomainStatus(dto) {
        const { domain } = dto;
        if (!process.env.TRUST_PORTAL_PROJECT_ID) {
            throw new common_1.InternalServerErrorException('TRUST_PORTAL_PROJECT_ID is not configured');
        }
        if (!process.env.VERCEL_TEAM_ID) {
            throw new common_1.InternalServerErrorException('VERCEL_TEAM_ID is not configured');
        }
        if (!domain) {
            throw new common_1.BadRequestException('Domain is required');
        }
        try {
            this.logger.log(`Fetching domain status for: ${domain}`);
            // Get domain information including verification status
            // Vercel API endpoint: GET /v9/projects/{projectId}/domains/{domain}
            const response = await this.vercelApi.get(`/v9/projects/${process.env.TRUST_PORTAL_PROJECT_ID}/domains/${domain}`, {
                params: {
                    teamId: process.env.VERCEL_TEAM_ID,
                },
            });
            const domainInfo = response.data;
            const verification = domainInfo.verification?.map((v) => ({
                type: v.type,
                domain: v.domain,
                value: v.value,
                reason: v.reason,
            }));
            return {
                domain: domainInfo.name,
                verified: domainInfo.verified ?? false,
                verification,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get domain status for ${domain}:`, error instanceof Error ? error.stack : error);
            // Handle axios errors with more detail
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const message = error.response?.data?.error?.message || error.message;
                this.logger.error(`Vercel API error (${statusCode}): ${message}`);
            }
            throw new common_1.InternalServerErrorException('Failed to get domain status from Vercel');
        }
    }
};
exports.TrustPortalService = TrustPortalService;
exports.TrustPortalService = TrustPortalService = TrustPortalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TrustPortalService);
