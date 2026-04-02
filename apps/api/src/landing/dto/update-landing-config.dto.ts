import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateLandingConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featuredVenueIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featuredEventIds?: string[];

  @IsOptional()
  @IsBoolean()
  showFeaturedVenues?: boolean;

  @IsOptional()
  @IsBoolean()
  showFeaturedEvents?: boolean;
}
