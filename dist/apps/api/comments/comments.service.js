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
exports.CommentsService = void 0;
const _db_1 = require("../../../../packages/db/dist/index.js");
const common_1 = require("@nestjs/common");
const db_1 = require("@trycompai/db");
const attachments_service_1 = require("../attachments/attachments.service");
let CommentsService = class CommentsService {
    attachmentsService;
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    /**
     * Validate that the target entity exists and belongs to the organization
     */
    async validateEntityAccess(organizationId, entityId, entityType) {
        let entityExists = false;
        switch (entityType) {
            case _db_1.CommentEntityType.task: {
                const task = await db_1.db.task.findFirst({
                    where: { id: entityId, organizationId },
                });
                entityExists = !!task;
                break;
            }
            case _db_1.CommentEntityType.policy: {
                const policy = await db_1.db.policy.findFirst({
                    where: { id: entityId, organizationId },
                });
                entityExists = !!policy;
                break;
            }
            case _db_1.CommentEntityType.vendor: {
                const vendor = await db_1.db.vendor.findFirst({
                    where: { id: entityId, organizationId },
                });
                entityExists = !!vendor;
                break;
            }
            case _db_1.CommentEntityType.risk: {
                const risk = await db_1.db.risk.findFirst({
                    where: { id: entityId, organizationId },
                });
                entityExists = !!risk;
                break;
            }
            default:
                throw new common_1.BadRequestException(`Unsupported entity type: ${entityType}`);
        }
        if (!entityExists) {
            throw new common_1.BadRequestException(`${entityType} not found or access denied`);
        }
    }
    /**
     * Get all comments for an entity
     */
    async getComments(organizationId, entityId, entityType) {
        try {
            // Validate entity access
            await this.validateEntityAccess(organizationId, entityId, entityType);
            const comments = await db_1.db.comment.findMany({
                where: {
                    organizationId,
                    entityId,
                    entityType,
                },
                include: {
                    author: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            // Get attachment metadata for each comment (WITHOUT signed URLs for on-demand generation)
            const commentsWithAttachments = await Promise.all(comments.map(async (comment) => {
                const attachments = await this.attachmentsService.getAttachmentMetadata(organizationId, comment.id, _db_1.AttachmentEntityType.comment);
                return {
                    id: comment.id,
                    content: comment.content,
                    author: {
                        id: comment.author.user.id,
                        name: comment.author.user.name,
                        email: comment.author.user.email,
                        image: comment.author.user.image,
                        deactivated: comment.author.deactivated,
                    },
                    attachments,
                    createdAt: comment.createdAt,
                };
            }));
            return commentsWithAttachments;
        }
        catch (error) {
            console.error('Error fetching comments:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch comments');
        }
    }
    /**
     * Create a new comment with optional attachments
     */
    async createComment(organizationId, userId, createCommentDto) {
        try {
            // Validate entity access
            await this.validateEntityAccess(organizationId, createCommentDto.entityId, createCommentDto.entityType);
            // Get user and member info
            const member = await db_1.db.member.findFirst({
                where: {
                    userId,
                    organizationId,
                    deactivated: false,
                },
                include: {
                    user: true,
                },
            });
            if (!member) {
                throw new common_1.BadRequestException('User is not a member of this organization');
            }
            // Use transaction to ensure data consistency
            const result = await db_1.db.$transaction(async (tx) => {
                // Create comment
                const comment = await tx.comment.create({
                    data: {
                        content: createCommentDto.content,
                        entityId: createCommentDto.entityId,
                        entityType: createCommentDto.entityType,
                        organizationId,
                        authorId: member.id,
                    },
                });
                // Upload attachments if provided
                const attachments = [];
                if (createCommentDto.attachments &&
                    createCommentDto.attachments.length > 0) {
                    for (const attachmentDto of createCommentDto.attachments) {
                        const attachment = await this.attachmentsService.uploadAttachment(organizationId, comment.id, _db_1.AttachmentEntityType.comment, attachmentDto, userId);
                        attachments.push(attachment);
                    }
                }
                return {
                    comment,
                    attachments,
                };
            });
            return {
                id: result.comment.id,
                content: result.comment.content,
                author: {
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    image: member.user.image,
                    deactivated: member.deactivated,
                },
                attachments: result.attachments,
                createdAt: result.comment.createdAt,
            };
        }
        catch (error) {
            console.error('Error creating comment:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create comment');
        }
    }
    /**
     * Update a comment
     */
    async updateComment(organizationId, commentId, userId, content) {
        try {
            // Get comment and verify ownership/permissions
            const existingComment = await db_1.db.comment.findFirst({
                where: {
                    id: commentId,
                    organizationId,
                },
                include: {
                    author: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            if (!existingComment) {
                throw new common_1.BadRequestException('Comment not found or access denied');
            }
            // Verify user is the author or has admin privileges
            if (existingComment.author.userId !== userId) {
                throw new common_1.BadRequestException('You can only edit your own comments');
            }
            // Update comment
            const updatedComment = await db_1.db.comment.update({
                where: {
                    id: commentId,
                    organizationId,
                },
                data: {
                    content,
                },
            });
            // Get attachments
            const attachments = await this.attachmentsService.getAttachments(organizationId, commentId, _db_1.AttachmentEntityType.comment);
            return {
                id: updatedComment.id,
                content: updatedComment.content,
                author: {
                    id: existingComment.author.user.id,
                    name: existingComment.author.user.name,
                    email: existingComment.author.user.email,
                    image: existingComment.author.user.image,
                    deactivated: existingComment.author.deactivated,
                },
                attachments,
                createdAt: updatedComment.createdAt,
            };
        }
        catch (error) {
            console.error('Error updating comment:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update comment');
        }
    }
    /**
     * Delete a comment and its attachments
     */
    async deleteComment(organizationId, commentId, userId) {
        try {
            // Get comment and verify ownership/permissions
            const existingComment = await db_1.db.comment.findFirst({
                where: {
                    id: commentId,
                    organizationId,
                },
                include: {
                    author: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            if (!existingComment) {
                throw new common_1.BadRequestException('Comment not found or access denied');
            }
            // Verify user is the author or has admin privileges
            if (existingComment.author.userId !== userId) {
                throw new common_1.BadRequestException('You can only delete your own comments');
            }
            // Use transaction to ensure data consistency
            await db_1.db.$transaction(async (tx) => {
                // Get all attachments for this comment
                const attachments = await tx.attachment.findMany({
                    where: {
                        organizationId,
                        entityId: commentId,
                        entityType: _db_1.AttachmentEntityType.comment,
                    },
                });
                // Delete attachments from S3 and database
                for (const attachment of attachments) {
                    await this.attachmentsService.deleteAttachment(organizationId, attachment.id);
                }
                // Delete the comment
                await tx.comment.delete({
                    where: {
                        id: commentId,
                        organizationId,
                    },
                });
            });
        }
        catch (error) {
            console.error('Error deleting comment:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete comment');
        }
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], CommentsService);
