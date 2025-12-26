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
exports.CreateVendorDto = exports.Impact = exports.Likelihood = exports.VendorStatus = exports.VendorCategory = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
/**
 * API-layer enums
 * ❗ Do NOT import from @trycompai/db
 */
var VendorCategory;
(function (VendorCategory) {
    VendorCategory["technology"] = "technology";
    VendorCategory["compliance"] = "compliance";
    VendorCategory["operational"] = "operational";
    VendorCategory["financial"] = "financial";
    VendorCategory["legal"] = "legal";
    VendorCategory["other"] = "other";
})(VendorCategory || (exports.VendorCategory = VendorCategory = {}));
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["active"] = "active";
    VendorStatus["inactive"] = "inactive";
    VendorStatus["archived"] = "archived";
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
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
class CreateVendorDto {
    name;
    category;
    status;
    likelihood;
    impact;
    isCritical;
}
exports.CreateVendorDto = CreateVendorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vendor name',
        example: 'AWS',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vendor category',
        enum: VendorCategory,
        example: VendorCategory.technology,
        default: VendorCategory.other,
    }),
    (0, class_validator_1.IsEnum)(VendorCategory),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vendor status',
        enum: VendorStatus,
        example: VendorStatus.active,
    }),
    (0, class_validator_1.IsEnum)(VendorStatus),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Risk likelihood',
        enum: Likelihood,
        example: Likelihood.medium,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Likelihood),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "likelihood", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Risk impact',
        enum: Impact,
        example: Impact.high,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Impact),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "impact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether vendor is critical',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVendorDto.prototype, "isCritical", void 0);
