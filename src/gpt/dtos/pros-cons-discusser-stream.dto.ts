import { IsString } from 'class-validator';

export class ProsConsDuscusserDtoStream {
  @IsString()
  readonly prompt: string;
}
