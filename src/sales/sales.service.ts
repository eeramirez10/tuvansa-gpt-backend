import { Injectable } from '@nestjs/common';
import { AnalyzeDescriptionDto } from './dtos/analyze-description-dto';
import { analyzeProductDescriptionUseCase } from './use-cases/analyze-product-description.use-case';
import OpenAI from 'openai';

@Injectable()
export class SalesService {
  private openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
  async analyzeDescription(analyzeDescriptionDto: AnalyzeDescriptionDto) {
    return await analyzeProductDescriptionUseCase(
      this.openai,
      analyzeDescriptionDto.description,
    );
  }
}
