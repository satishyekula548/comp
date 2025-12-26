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
var DeviceAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceAgentService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
let DeviceAgentService = DeviceAgentService_1 = class DeviceAgentService {
    logger = new common_1.Logger(DeviceAgentService_1.name);
    s3Client;
    fleetBucketName;
    constructor() {
        // AWS configuration is validated at startup via ConfigModule
        // For device agents, we use the FLEET_AGENT_BUCKET_NAME if available,
        // otherwise fall back to the main bucket
        this.fleetBucketName =
            process.env.FLEET_AGENT_BUCKET_NAME || process.env.APP_AWS_BUCKET_NAME;
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.APP_AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async downloadMacAgent() {
        try {
            const macosPackageFilename = 'Comp AI Agent-1.0.0-arm64.dmg';
            const packageKey = `macos/${macosPackageFilename}`;
            this.logger.log(`Downloading macOS agent from S3: ${packageKey}`);
            const getObjectCommand = new client_s3_1.GetObjectCommand({
                Bucket: this.fleetBucketName,
                Key: packageKey,
            });
            const s3Response = await this.s3Client.send(getObjectCommand);
            if (!s3Response.Body) {
                throw new common_1.NotFoundException('macOS agent DMG file not found in S3');
            }
            // Use S3 stream directly as Node.js Readable
            const s3Stream = s3Response.Body;
            this.logger.log(`Successfully retrieved macOS agent: ${macosPackageFilename}`);
            return {
                stream: s3Stream,
                filename: macosPackageFilename,
                contentType: 'application/x-apple-diskimage',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to download macOS agent from S3:', error);
            throw error;
        }
    }
    async downloadWindowsAgent() {
        try {
            const windowsPackageFilename = 'Comp AI Agent 1.0.0.exe';
            const packageKey = `windows/${windowsPackageFilename}`;
            this.logger.log(`Downloading Windows agent from S3: ${packageKey}`);
            const getObjectCommand = new client_s3_1.GetObjectCommand({
                Bucket: this.fleetBucketName,
                Key: packageKey,
            });
            const s3Response = await this.s3Client.send(getObjectCommand);
            if (!s3Response.Body) {
                throw new common_1.NotFoundException('Windows agent executable file not found in S3');
            }
            // Use S3 stream directly as Node.js Readable
            const s3Stream = s3Response.Body;
            this.logger.log(`Successfully retrieved Windows agent: ${windowsPackageFilename}`);
            return {
                stream: s3Stream,
                filename: windowsPackageFilename,
                contentType: 'application/octet-stream',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to download Windows agent from S3:', error);
            throw error;
        }
    }
};
exports.DeviceAgentService = DeviceAgentService;
exports.DeviceAgentService = DeviceAgentService = DeviceAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DeviceAgentService);
