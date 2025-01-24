import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GptModule } from './gpt/gpt.module';
import { ConfigModule } from '@nestjs/config';
import { MysqlModule } from 'nest-mysql2';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    GptModule,
    ConfigModule.forRoot(),
    MysqlModule.forRoot({
      host: process.env.URL_MYSQL,
      user: process.env.USER_MYSQL,
      password: process.env.PASSWORD_MYSQL,
      database: process.env.DB_MYSQL,
    }),
    SalesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
