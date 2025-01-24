/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { ProsConsDuscusserDto } from './dtos/pros-cons-discusser.dto';
import { prosConsDisscuser } from './use-cases/prosConsDisscuser.use-case';
import { prosConsDisscuserStreamUseCase } from './use-cases/prosConsDisscuserStream.use-case';
import { TranslateDto } from './dtos/translate.dto';
import { translateUseCase } from './use-cases/translate.use-case';
import { TextToAudioDto } from './dtos/text-to-audio.dto';
import { textToAudioUseCase } from './use-cases/text-to-audio.use-case';

import * as fs from 'fs';
import * as path from 'path';
import { MulterFile, Product } from 'src/interfaces';
import { extractTextFromExcel, extractTextFromPdf } from 'src/common/utils/file-utils';
import { analyzeQuoteUseCase, AnalyzeQuoteUseCaseReturnProps } from './use-cases/analyze-quote.use-case';
import { indSimilarProducts } from 'src/common/utils/embeddings-utils';



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

  async prosConsDiscusser(body: ProsConsDuscusserDto) {
    return await prosConsDisscuser(this.openai, { prompt: body.prompt })
  }

  async prosConsDiscusserStream(body: ProsConsDuscusserDto) {
    return await prosConsDisscuserStreamUseCase(this.openai, { prompt: body.prompt })
  }

  async translate(body: TranslateDto) {

    return await translateUseCase(this.openai, body)

  }

  async textToAudio(body: TextToAudioDto) {

    return await textToAudioUseCase(this.openai, body)

  }

  async getAudioMp3(idFile: string) {

    const filePath = path.resolve(__dirname, '../../generated/audios', `${idFile}.mp3`);

    const wasFound = fs.existsSync(filePath);

    if (!wasFound) throw new NotFoundException(`File ${idFile} not found`)

    return filePath;

  }

  async analyzeQuote(file: MulterFile) {

    let textContent: string

    if (file.mimetype !== 'application/pdf' && file.mimetype !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
      file.mimetype !== 'application/vnd.ms-excel') {
      throw new BadRequestException('format not supported')
    }

    if (file.mimetype === 'application/pdf') {
      textContent = await extractTextFromPdf(file.buffer)
    }

    

    if (file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      textContent = extractTextFromExcel(file.buffer)
    }
   

    const itemsQuote = await analyzeQuoteUseCase(this.openai, textContent)

    // return itemsQuote

    let foundProducts = []

    for await (const item of itemsQuote) {

      const results = await indSimilarProducts(this.openai, item)

      const newProduct = {
        originalProduct: item,
        productFound: results.exactMatch,
        similarities: results.similaritiesProducts
      }

      foundProducts = [...foundProducts, newProduct]

    }

    return this.prepareProductsData(foundProducts)

    // let findedProducts = []

    // for await (const product of response){

    // const results =  await indSimilarProducts(this.openai, product.description)

    //   findedProducts = [...findedProducts, ...results ]
    // }


    //   return findedProducts



    // const results = await indSimilarProducts(this.openai, `Tubo a.c. sin costura, Cédula 40, Mca. TAMSA 1 1/2"`)

    // return results

    // return await this.generateProductDescription(this.openai, `Reducc. Concéntrica a.c. A-234, Ced.40, 1 1/2" x 1"`)

    // return await this.generateEanFromDescription(this.openai, 'TUBO DE ACERO AL CARBON CON COSTURA DE 114.3 X 06.0 MM. GALV. LISO (4" CED. 40)')

  }




  prepareProductsData = (products: { originalProduct: AnalyzeQuoteUseCaseReturnProps,productFound: Product, similarities: Product[]} []) => {

    const data = [];
    products.forEach((item) => {

      const original = item.originalProduct;
      const found = item.productFound || null;
      const similarities = item.similarities || [];

      // Agregar el originalProduct como la fila principal
      data.push({
        Description: original.description,
        Cantidad: original.cantidad,
        Unidad: original.unidad,
        "Tipo de Registro": "Original Product",
      });

      // Agregar el productFound, si existe
      if (found) {
        data.push({
          Description: found.descripcion,
          Cantidad: "",
          Unidad: "",
          "Tipo de Registro": "Product Found",
          Code: found.codigo,
          EAN: found.ean,
          Similarity: found.similarity,
        });
      }

      // Agregar los similarities, si existen
      similarities.forEach((sim) => {
        data.push({
          Description: sim.descripcion,
          Cantidad: "",
          Unidad: "",
          "Tipo de Registro": "Similarity",
          Code: sim.codigo,
          EAN: sim.ean,
          Similarity: sim.similarity,
        });
      });

      // Agregar una fila vacía para separar los grupos
      data.push({});


      

    })

    return data
  }

  


  generateProductDescription = async (openai: OpenAI, description: string) => {


        // Instrucción para OpenAI que maneja múltiples tipos de productos y descripciones
        const resp = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente que ayuda a extraer datos clave de descripciones de productos industriales como tubos, codos, tees, y reducciones.',
            },
            {
              role: 'user',
              content: `Extrae la siguiente información de la descripción del producto:
                  - Tipo de producto (Tubo, Tee, Reducción, etc.) si viene tuberia entonces TUBO o similares
                  - Cédula (busca variantes como C, ced, cedula, Sch, STD) solo extrae el valor numerico
                  - Diámetro Nominal (pulgadas) pon el simbolo de " en vez de pulgadas
                  - Tipo de costura (con costura o sin costura, busca variantes como cc, c.c, sc, s.c)
                  - Material (acero al carbón o sus variantes como ac, a.c, AC)
                  - Si no se encuentra pon null a la propiedad
                  - Pon todo en mayusculas
                  - Quita acentos 
                  Descripción: "${description}"




                  dame la informacion en un objeto json de la siguiente manera 

                  {
                    product: Tipo de producto
                    ced: cedula / si no encuentra cedula entonces null
                    diameter: Diametro
                    costura: tipo de costura
                    material: Material
                  }
          `
              ,

            },
          ],
          temperature: 0.2,
        });

        // Procesar la respuesta para obtener la información clave
        const extractedInfo = resp.choices[0].message.content as any;



        const extractedInfoToJson = JSON.parse(extractedInfo)

        const cedula = extractedInfoToJson.ced ? `CED ${extractedInfoToJson.ced}` : ''

        const diameter = extractedInfoToJson.diameter ?? ''

        const descriptiongenerate = `${diameter} ${cedula}`



        return { ...extractedInfoToJson, toSearch: descriptiongenerate }


      }


  generateEanFromDescription = async (openai: OpenAI, description: string) => {
        if (!description || typeof description !== 'string') {
          throw new Error('La descripción debe ser una cadena de texto válida.');
        }

        const prompt = `
      Genera el código EAN para una descripción de tubería siguiendo estas reglas:
      - El orden del EAN debe ser el siguiente:
        1. Tipo de tubo:
           - "TSC" para tubería sin costura.
           - "TCC" para tubería con costura.
        2. Diámetro nominal: Extraído del contenido entre paréntesis. asi tal cual sin redondear ni nada,incluye las diagonales si vienen y quita los espacios
        3. Cédula: Solo el valor numérico del cédula sin incluir la palabra "CED.".
        4. Características adicionales:
           - "RA" para ranurado.
           - "G" para galvanizado.
           - "L" para liso.
           - "R" para roscado.
      - Ejemplos:
        Descripción: "TUBO DE ACERO AL CARBON SIN COSTURA RANURADO 273.1 X 06.4 MM. (10\" CED. 20)"
        EAN: TSC1020RA
        Descripción: "TUBO DE ACERO GALVANIZADO LISO CON COSTURA 323.8 X 12.7 MM. (12\" CED. 40)"
        EAN: TCC1240GL
        Descripción: "TUBO DE ACERO ROSCADO SIN COSTURA 273.1 X 06.4 MM. (10\" CED. 20)"
        EAN: TSC1020R
        Recuerda poner siempre la diagonal porque veo que en algunas las quitas 
  
      Ahora, genera el EAN para esta descripción:
      ${description.trim()}

      ahora solo retorna el EAN generado
    `;

        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Eres un asistente experto en generación de códigos EAN.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1000,
            temperature: 0.2
          });

          const ean = response.choices[0]?.message?.content?.trim();
          if (!ean) {
            throw new Error('No se pudo generar un EAN válido. Revisa las reglas o la descripción proporcionada.');
          }

          return ean;
        } catch (error) {
          console.error('Error al generar el EAN:', error);
          throw new Error('Hubo un problema al intentar generar el EAN.');
        }
      }





}
