import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

/**
 * API-layer enums
 * ❗ Do NOT import from @trycompai/db
 */

export enum RiskCategory {
  technology = 'technology',
  operational = 'operational',
  compliance = 'compliance',
  financial = 'financial',
  reputational = 'reputational',
}

export enum RiskStatus {
  open = 'open',
  in_progress = 'in_progress',
  mitigated = 'mitigated',
  accepted = 'accepted',
  closed = 'closed',
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

export enum RiskTreatmentType {
  mitigate = 'mitigate',
  accept = 'accept',
  transfer = 'transfer',
  avoid = 'avoid',
}

export class CreateRiskDto {
  @ApiProperty({
    description: 'Risk title',
    example: 'Unauthorized access to production systems',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed risk description',
    example: 'Attackers may gain access due to weak credentials',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Risk category',
    enum: RiskCategory,
    example: RiskCategory.technology,
  })
  @IsEnum(RiskCategory)
  category: RiskCategory;

  @ApiProperty({
    description: 'Current risk status',
    enum: RiskStatus,
    example: RiskStatus.open,
  })
  @IsEnum(RiskStatus)
  status: RiskStatus;

  @ApiProperty({
    description: 'Likelihood of risk occurring',
    enum: Likelihood,
    example: Likelihood.medium,
  })
  @IsEnum(Likelihood)
  likelihood: Likelihood;

  @ApiProperty({
    description: 'Impact if risk occurs',
    enum: Impact,
    example: Impact.high,
  })
  @IsEnum(Impact)
  impact: Impact;

  @ApiProperty({
    description: 'Risk treatment strategy',
    enum: RiskTreatmentType,
    example: RiskTreatmentType.mitigate,
    required: false,
  })
  @IsOptional()
  @IsEnum(RiskTreatmentType)
  treatment?: RiskTreatmentType;
}
