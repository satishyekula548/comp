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
exports.CreateCommentDto = exports.CommentEntityType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const upload_attachment_dto_1 = require("../../attachments/upload-attachment.dto");
/**
 * ❗ BUSINESS ENUM (NOT PRISMA)
 * Must be defined manually
 */
var CommentEntityType;
(function (CommentEntityType) {
    CommentEntityType["task"] = "task";
    CommentEntityType["policy"] = "policy";
    CommentEntityType["risk"] = "risk";
    CommentEntityType["vendor"] = "vendor";
})(CommentEntityType || (exports.CommentEntityType = CommentEntityType = {}));
class CreateCommentDto {
    content;
    entityId;
    entityType;
    attachments;
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Content of the comment',
        example: 'This task needs to be completed by end of week',
        maxLength: 2000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the entity to comment on',
        example: 'tsk_abc123def456',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of entity being commented on',
        enum: CommentEntityType,
        example: CommentEntityType.task,
    }),
    (0, class_validator_1.IsEnum)(CommentEntityType),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional attachments to include with the comment',
        type: [upload_attachment_dto_1.UploadAttachmentDto],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => upload_attachment_dto_1.UploadAttachmentDto),
    __metadata("design:type", Array)
], CreateCommentDto.prototype, "attachments", void 0);
