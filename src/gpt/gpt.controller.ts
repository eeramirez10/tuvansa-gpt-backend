import { Body, Controller, Post } from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthographyDto } from './dtos';
import { DataAnalysisDto } from './dtos/dataAnalysis.dto';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('ortography-check')
  ortographyCheck(@Body() body: OrthographyDto) {
    return this.gptService.ortographyCheck(body);
  }

  @Post('/proscai/data-analysis')
  dataAnalysis(@Body() body: DataAnalysisDto) {
    return this.gptService.dataAnalysis(body);
  }
}
