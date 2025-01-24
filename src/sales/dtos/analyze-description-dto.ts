import { IsString } from 'class-validator';

export class AnalyzeDescriptionDto {
  @IsString()
  readonly description: string;
}
