import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthographyDto } from './dtos';
import { DataAnalysisDto } from './dtos/dataAnalysis.dto';
import { ProsConsDuscusserDto } from './dtos/pros-cons-discusser.dto';
import { Response } from 'express';
import { TranslateDto } from './dtos/translate.dto';
import { TextToAudioDto } from './dtos/text-to-audio.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from 'src/interfaces';
import { generateExcelFileUseCase } from './use-cases/generate-excel-file-use-case';

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

  @Post('text-to-audio')
  async textToAudio(@Body() body: TextToAudioDto, @Res() res: Response) {
    const filePath = await this.gptService.textToAudio(body);
    res.setHeader('Content-type', 'audio/mp3');
    res.status(200);
    res.sendFile(filePath);
  }

  @Get('text-to-audio/:id')
  async textToAudioGetter(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.gptService.getAudioMp3(id);
    res.setHeader('Content-type', 'audio/mp3');
    res.status(200);
    res.sendFile(filePath);
  }

  @Post('analyze-quote')
  @UseInterceptors(FileInterceptor('quote'))
  async analyzeQuote(@UploadedFile() file: MulterFile, @Res() res: Response) {
    if (!file) throw new BadGatewayException('No file in request');

    const products = await this.gptService.analyzeQuote(file);

    // return res.json(products);

    const filePath = generateExcelFileUseCase({
      data: products as any[],
      filename: 'alma-quote2',
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.status(200);
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
      }
      // Eliminar el archivo después de enviarlo
      // fs.unlinkSync(filePath);
    });

    // return res.json(products);

    // res.setHeader(
    //   'Content-Disposition',
    //   'attachment; filename=organized_nested_products.xlsx',
    // );
    // res.setHeader(
    //   'Content-Type',
    //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // );
    // res.send(fileBuffer);
  }

  @Post('/proscai/data-analysis')
  dataAnalysis(@Body() body: DataAnalysisDto) {
    return this.gptService.dataAnalysis(body);
  }
}
