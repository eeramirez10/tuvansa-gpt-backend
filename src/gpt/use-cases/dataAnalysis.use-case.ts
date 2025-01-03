/* eslint-disable prettier/prettier */
import OpenAI from 'openai';
import { schema } from 'src/data/schema';
import { CustomError } from 'src/errors/custom.error';

interface Options {
  prompt: string;
}

export interface DataAnalysisUseCaseResponse {
  query: string;
  originalPrompt: string;

}

export const dataAnalysisUseCase = async (openai: OpenAI, options: Options): Promise<[string?, DataAnalysisUseCaseResponse?]> => {
  const { prompt } = options;


  try {

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
  
            te dejo el esquema de la base de datos, haz el query correspondiente como te lo piden
  
            schemas: 
  
            ${schema}
  
            No quiero que me des explicaiones de como lo hiciste solo quiero el json
            si todo sale bien retornamelo en json de la siguente manera:
  
            {
              "query": aqui va el sql que generaste,
              "ok": true o false en caso de que haya un error,
              "error": aqui el error en caso de que exista si no existe entonces null
            }
  
            schemas: 
  
            ${schema}
            
          
          `,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      temperature: 0.1,
    });

    const content = JSON.parse(
      completion.choices[0].message.content.replace(/```json|```/g, ''),
    );

    if (content.error) return [content.error]

    return [undefined, {
      originalPrompt: prompt,
      query: content.query
    }];


  } catch (error) {
    console.log(error)
    if(error instanceof CustomError){
      
      throw CustomError.badRequest(error.message)
    }

    throw CustomError.internalServer(error.message)
  }



};
