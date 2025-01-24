import { IsString } from 'class-validator';

export class ProsConsDuscusserDto {
  @IsString()
  readonly prompt: string;
}
