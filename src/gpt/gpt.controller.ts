import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthographyDto } from './dtos';
import { DataAnalysisDto } from './dtos/dataAnalysis.dto';
import { ProsConsDuscusserDto } from './dtos/pros-cons-discusser.dto';
import { Response } from 'express';
import { TranslateDto } from './dtos/translate.dto';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('/ortography-check')
  ortographyCheck(@Body() body: OrthographyDto) {
    return this.gptService.ortographyCheck(body);
  }

  @Post('pros-cons-discusser')
  prosConsDicusser(@Body() body: ProsConsDuscusserDto) {
    return this.gptService.prosConsDiscusser(body);
  }

  @Post('pros-cons-discusser-stream')
  async prosConsDicusserStream(
    @Body() body: ProsConsDuscusserDto,
    @Res() res: Response,
  ) {
    const stream = await this.gptService.prosConsDiscusserStream(body);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content;

      res.write(piece || '');
    }

    res.end();
  }

  @Post('/translate')
  async translate(@Body() translateDto: TranslateDto, @Res() res: Response) {
    const stream = await this.gptService.translate(translateDto);
    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content;
      res.write(piece || '');
    }
    res.end();
  }

  @Post('/proscai/data-analysis')
  dataAnalysis(@Body() body: DataAnalysisDto) {
    return this.gptService.dataAnalysis(body);
  }
}
