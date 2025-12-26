import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

/**
 * API-layer enums
 * ❗ Do NOT import from @trycompai/db
 */

export enum VendorCategory {
  technology = 'technology',
  compliance = 'compliance',
  operational = 'operational',
  financial = 'financial',
  legal = 'legal',
  other = 'other',
}

export enum VendorStatus {
  active = 'active',
  inactive = 'inactive',
  archived = 'archived',
}

export enum Likelihood {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

export enum Impact {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

export class CreateVendorDto {
  @ApiProperty({
    description: 'Vendor name',
    example: 'AWS',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Vendor category',
    enum: VendorCategory,
    example: VendorCategory.technology,
    default: VendorCategory.other,
  })
  @IsEnum(VendorCategory)
  category: VendorCategory;

  @ApiProperty({
    description: 'Vendor status',
    enum: VendorStatus,
    example: VendorStatus.active,
  })
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @ApiProperty({
    description: 'Risk likelihood',
    enum: Likelihood,
    example: Likelihood.medium,
    required: false,
  })
  @IsOptional()
  @IsEnum(Likelihood)
  likelihood?: Likelihood;

  @ApiProperty({
    description: 'Risk impact',
    enum: Impact,
    example: Impact.high,
    required: false,
  })
  @IsOptional()
  @IsEnum(Impact)
  impact?: Impact;

  @ApiProperty({
    description: 'Whether vendor is critical',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;
}
