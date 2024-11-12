import { Injectable } from '@nestjs/common';
import { executeSqlQueryUseCase, orthographyCheckUseCase } from './use-cases';
import { OrthographyDto } from './dtos';
import OpenAI from 'openai';
import { DataAnalysisDto } from './dtos/dataAnalysis.dto';
import {
  dataAnalysisUseCase,
  DataAnalysisUseCaseResponse,
} from './use-cases/dataAnalysis.use-case';
import { MysqlService } from 'nest-mysql2';
import { transformSqlToUserText } from './use-cases/transformSqltoUsertext.use-case';

@Injectable()
export class GptService {
  private openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
  private db = new MysqlService({
    host: process.env.URL_MYSQL,
    user: process.env.USER_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DB_MYSQL,
  });

  async ortographyCheck(body: OrthographyDto) {
    return await orthographyCheckUseCase(this.openai, {
      prompt: body.prompt,
      maxTokens: body.maxTokens,
    });
  }

  async dataAnalysis(
    body: DataAnalysisDto,
  ): Promise<DataAnalysisUseCaseResponse> {
    const data = await dataAnalysisUseCase(this.openai, {
      prompt: body.prompt,
    });

    if (data.error !== null) return data;

    const results = await executeSqlQueryUseCase(this.db, data.query);

    const responseToHuman = await transformSqlToUserText(this.openai, {
      userQuestion: body.prompt,
      sqlResult: results,
      humanQuery: data.query,
    });

    return {
      ...data,
      queryResults: results,
      responseToHuman,
    };
  }
}
