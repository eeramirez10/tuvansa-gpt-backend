/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { executeSqlQueryUseCase, orthographyCheckUseCase } from './use-cases';
import { OrthographyDto } from './dtos';
import OpenAI from 'openai';
import { DataAnalysisDto } from './dtos/dataAnalysis.dto';
import {
  dataAnalysisUseCase,
} from './use-cases/dataAnalysis.use-case';
import { MysqlService } from 'nest-mysql2';
// import { transformSqlToUserText } from './use-cases/transformSqltoUsertext.use-case';
import { CustomError } from 'src/errors/custom.error';
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

  async dataAnalysis(body: DataAnalysisDto) {
    const [error, data] = await dataAnalysisUseCase(this.openai, {
      prompt: body.prompt,
    });

    if (error) throw CustomError.badRequest(error);


    const results = await executeSqlQueryUseCase(this.db, data.query);

    const [tranformError, result] = await transformSqlToUserText(this.openai, {
      userQuestion: body.prompt,
      sqlResult: results,
      humanQuery: data.query,
    });

    if (tranformError) throw CustomError.badRequest(error);



    return {
      result: result.result,
      originalPrompt: body.prompt
    }

  }
}
