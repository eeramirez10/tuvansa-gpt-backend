import { IsString } from 'class-validator';

export class DataAnalysisDto {
  @IsString()
  readonly prompt: string;
}
