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
exports.CreateRiskDto = exports.RiskTreatmentType = exports.Impact = exports.Likelihood = exports.RiskStatus = exports.RiskCategory = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
/**
 * API-layer enums
 * ❗ Do NOT import from @trycompai/db
 */
var RiskCategory;
(function (RiskCategory) {
    RiskCategory["technology"] = "technology";
    RiskCategory["operational"] = "operational";
    RiskCategory["compliance"] = "compliance";
    RiskCategory["financial"] = "financial";
    RiskCategory["reputational"] = "reputational";
})(RiskCategory || (exports.RiskCategory = RiskCategory = {}));
var RiskStatus;
(function (RiskStatus) {
    RiskStatus["open"] = "open";
    RiskStatus["in_progress"] = "in_progress";
    RiskStatus["mitigated"] = "mitigated";
    RiskStatus["accepted"] = "accepted";
    RiskStatus["closed"] = "closed";
})(RiskStatus || (exports.RiskStatus = RiskStatus = {}));
var Likelihood;
(function (Likelihood) {
    Likelihood["low"] = "low";
    Likelihood["medium"] = "medium";
    Likelihood["high"] = "high";
})(Likelihood || (exports.Likelihood = Likelihood = {}));
var Impact;
(function (Impact) {
    Impact["low"] = "low";
    Impact["medium"] = "medium";
    Impact["high"] = "high";
})(Impact || (exports.Impact = Impact = {}));
var RiskTreatmentType;
(function (RiskTreatmentType) {
    RiskTreatmentType["mitigate"] = "mitigate";
    RiskTreatmentType["accept"] = "accept";
    RiskTreatmentType["transfer"] = "transfer";
    RiskTreatmentType["avoid"] = "avoid";
})(RiskTreatmentType || (exports.RiskTreatmentType = RiskTreatmentType = {}));
class CreateRiskDto {
    title;
    description;
    category;
    status;
    likelihood;
    impact;
    treatment;
}
exports.CreateRiskDto = CreateRiskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Risk title',
        example: 'Unauthorized access to production systems',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRiskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed risk description',
        example: 'Attackers may gain access due to weak credentials',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRiskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Risk category',
        enum: RiskCategory,
        example: RiskCategory.technology,
    }),
    (0, class_validator_1.IsEnum)(RiskCategory),
    __metadata("design:type", String)
], CreateRiskDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current risk status',
        enum: RiskStatus,
        example: RiskStatus.open,
    }),
    (0, class_validator_1.IsEnum)(RiskStatus),
    __metadata("design:type", String)
], CreateRiskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Likelihood of risk occurring',
        enum: Likelihood,
        example: Likelihood.medium,
    }),
    (0, class_validator_1.IsEnum)(Likelihood),
    __metadata("design:type", String)
], CreateRiskDto.prototype, "likelihood", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Impact if risk occurs',
        enum: Impact,
        example: Impact.high,
    }),
    (0, class_validator_1.IsEnum)(Impact),
    __metadata("design:type", String)
], CreateRiskDto.prototype, "impact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Risk treatment strategy',
        enum: RiskTreatmentType,
        example: RiskTreatmentType.mitigate,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RiskTreatmentType),
    __metadata("design:type", String)
], CreateRiskDto.prototype, "treatment", void 0);
