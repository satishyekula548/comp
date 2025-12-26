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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const _db_1 = require("../../../../packages/db/dist/index.js");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let AttachmentsService = class AttachmentsService {
    s3Client;
    bucketName;
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    SIGNED_URL_EXPIRY = 900; // 15 minutes
    constructor() {
        // AWS configuration is validated at startup via ConfigModule
        // Safe to access environment variables directly since they're validated
        this.bucketName = process.env.APP_AWS_BUCKET_NAME;
        if (!process.env.APP_AWS_ACCESS_KEY_ID || !process.env.APP_AWS_SECRET_ACCESS_KEY) {
            console.warn('AWS credentials are missing, S3 client may fail');
        }
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.APP_AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    /**
     * Upload attachment to S3 and create database record
     */
    async uploadAttachment(organizationId, entityId, entityType, uploadDto, userId) {
        try {
            // Blocked file extensions for security
            const BLOCKED_EXTENSIONS = [
                'exe',
                'bat',
                'cmd',
                'com',
                'scr',
                'msi', // Windows executables
                'js',
                'vbs',
                'vbe',
                'wsf',
                'wsh',
                'ps1', // Scripts
                'sh',
                'bash',
                'zsh', // Shell scripts
                'dll',
                'sys',
                'drv', // System files
                'app',
                'deb',
                'rpm', // Application packages
                'jar', // Java archives (can execute)
                'pif',
                'lnk',
                'cpl', // Shortcuts and control panel
                'hta',
                'reg', // HTML apps and registry
            ];
            // Blocked MIME types for security
            const BLOCKED_MIME_TYPES = [
                'application/x-msdownload', // .exe
                'application/x-msdos-program',
                'application/x-executable',
                'application/x-sh', // Shell scripts
                'application/x-bat', // Batch files
                'text/x-sh',
                'text/x-python',
                'text/x-perl',
                'text/x-ruby',
                'application/x-httpd-php', // PHP files
                'application/x-javascript', // Executable JS (not JSON)
                'application/javascript',
                'text/javascript',
            ];
            // Validate file extension
            const fileExt = uploadDto.fileName.split('.').pop()?.toLowerCase();
            if (fileExt && BLOCKED_EXTENSIONS.includes(fileExt)) {
                throw new common_1.BadRequestException(`File extension '.${fileExt}' is not allowed for security reasons`);
            }
            // Validate MIME type
            if (BLOCKED_MIME_TYPES.includes(uploadDto.fileType.toLowerCase())) {
                throw new common_1.BadRequestException(`File type '${uploadDto.fileType}' is not allowed for security reasons`);
            }
            // Validate file size
            const fileBuffer = Buffer.from(uploadDto.fileData, 'base64');
            if (fileBuffer.length > this.MAX_FILE_SIZE_BYTES) {
                throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`);
            }
            // Generate unique file key
            const fileId = (0, crypto_1.randomBytes)(16).toString('hex');
            const sanitizedFileName = this.sanitizeFileName(uploadDto.fileName);
            const timestamp = Date.now();
            const s3Key = `${organizationId}/attachments/${entityType}/${entityId}/${timestamp}-${fileId}-${sanitizedFileName}`;
            // Upload to S3
            const putCommand = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: uploadDto.fileType,
                Metadata: {
                    // S3 metadata becomes HTTP headers (x-amz-meta-*) and must be ASCII without control chars
                    originalFileName: this.sanitizeHeaderValue(uploadDto.fileName),
                    organizationId,
                    entityId,
                    entityType,
                    ...(userId && { uploadedBy: userId }),
                },
            });
            await this.s3Client.send(putCommand);
            // Create database record
            const attachment = await _db_1.db.attachment.create({
                data: {
                    name: uploadDto.fileName,
                    url: s3Key,
                    type: this.mapFileTypeToAttachmentType(uploadDto.fileType),
                    entityId,
                    entityType,
                    organizationId,
                },
            });
            // Generate signed URL for immediate access
            const downloadUrl = await this.generateSignedUrl(s3Key);
            return {
                id: attachment.id,
                name: attachment.name,
                type: attachment.type,
                downloadUrl,
                createdAt: attachment.createdAt,
                size: fileBuffer.length,
            };
        }
        catch (error) {
            console.error('Error uploading attachment:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to upload attachment');
        }
    }
    /**
     * Get all attachments for an entity WITH signed URLs (for backward compatibility)
     */
    async getAttachments(organizationId, entityId, entityType) {
        const attachments = await _db_1.db.attachment.findMany({
            where: {
                organizationId,
                entityId,
                entityType,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        // Generate signed URLs for all attachments
        const attachmentsWithUrls = await Promise.all(attachments.map(async (attachment) => {
            const downloadUrl = await this.generateSignedUrl(attachment.url);
            return {
                id: attachment.id,
                name: attachment.name,
                type: attachment.type,
                downloadUrl,
                createdAt: attachment.createdAt,
            };
        }));
        return attachmentsWithUrls;
    }
    /**
     * Get attachment metadata WITHOUT signed URLs (for on-demand URL generation)
     */
    async getAttachmentMetadata(organizationId, entityId, entityType) {
        const attachments = await _db_1.db.attachment.findMany({
            where: {
                organizationId,
                entityId,
                entityType,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            type: attachment.type,
            createdAt: attachment.createdAt,
        }));
    }
    /**
     * Get download URL for an attachment
     */
    async getAttachmentDownloadUrl(organizationId, attachmentId) {
        try {
            // Get attachment record
            const attachment = await _db_1.db.attachment.findFirst({
                where: {
                    id: attachmentId,
                    organizationId,
                },
            });
            if (!attachment) {
                throw new common_1.BadRequestException('Attachment not found');
            }
            // Generate signed URL
            const downloadUrl = await this.generateSignedUrl(attachment.url);
            return {
                downloadUrl,
                expiresIn: this.SIGNED_URL_EXPIRY,
            };
        }
        catch (error) {
            console.error('Error generating download URL:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to generate download URL');
        }
    }
    /**
     * Delete attachment from S3 and database
     */
    async deleteAttachment(organizationId, attachmentId) {
        try {
            // Get attachment record
            const attachment = await _db_1.db.attachment.findFirst({
                where: {
                    id: attachmentId,
                    organizationId,
                },
            });
            if (!attachment) {
                throw new common_1.BadRequestException('Attachment not found');
            }
            // Delete from S3
            const deleteCommand = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: attachment.url,
            });
            await this.s3Client.send(deleteCommand);
            // Delete from database
            await _db_1.db.attachment.delete({
                where: {
                    id: attachmentId,
                    organizationId,
                },
            });
        }
        catch (error) {
            console.error('Error deleting attachment:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete attachment');
        }
    }
    /**
     * Generate signed URL for file download
     */
    async generateSignedUrl(s3Key) {
        const getCommand = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, getCommand, {
            expiresIn: this.SIGNED_URL_EXPIRY,
        });
    }
    async uploadToS3(fileBuffer, fileName, contentType, organizationId, entityType, entityId) {
        const fileId = (0, crypto_1.randomBytes)(16).toString('hex');
        const sanitizedFileName = this.sanitizeFileName(fileName);
        const timestamp = Date.now();
        const s3Key = `${organizationId}/attachments/${entityType}/${entityId}/${timestamp}-${fileId}-${sanitizedFileName}`;
        const putCommand = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: contentType,
            Metadata: {
                originalFileName: this.sanitizeHeaderValue(fileName),
                organizationId,
                entityId,
                entityType,
            },
        });
        await this.s3Client.send(putCommand);
        return s3Key;
    }
    async getPresignedDownloadUrl(s3Key) {
        return this.generateSignedUrl(s3Key);
    }
    async getObjectBuffer(s3Key) {
        const getCommand = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
        });
        const response = await this.s3Client.send(getCommand);
        const chunks = [];
        if (!response.Body) {
            throw new common_1.InternalServerErrorException('No file data received from S3');
        }
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }
    sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
    /**
     * Sanitize header value for S3 user metadata (x-amz-meta-*) to avoid invalid characters
     * - Remove control characters (\x00-\x1F, \x7F)
     * - Replace non-ASCII with '_'
     * - Trim whitespace
     */
    sanitizeHeaderValue(value) {
        // eslint-disable-next-line no-control-regex
        const withoutControls = value.replace(/[\x00-\x1F\x7F]/g, '');
        const asciiOnly = withoutControls.replace(/[^\x20-\x7E]/g, '_');
        return asciiOnly.trim();
    }
    /**
     * Map MIME type to AttachmentType enum
     */
    mapFileTypeToAttachmentType(fileType) {
        const type = fileType.split('/')[0];
        switch (type) {
            case 'image':
                return _db_1.AttachmentType.image;
            case 'video':
                return _db_1.AttachmentType.video;
            case 'audio':
                return _db_1.AttachmentType.audio;
            case 'application':
            case 'text':
                return _db_1.AttachmentType.document;
            default:
                return _db_1.AttachmentType.other;
        }
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AttachmentsService);
