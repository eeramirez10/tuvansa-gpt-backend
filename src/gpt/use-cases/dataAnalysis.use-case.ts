import { QueryResult } from 'mysql2';
import OpenAI from 'openai';
import { schema } from 'src/data/schema';

interface Options {
  prompt: string;
}

export interface DataAnalysisUseCaseResponse {
  query?: string;
  queryResults?: QueryResult;
  error?: string;
  originalPrompt: string;
  responseToHuman: string;
}

export const dataAnalysisUseCase = async (
  openai: OpenAI,
  options: Options,
): Promise<DataAnalysisUseCaseResponse> => {
  const { prompt } = options;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
          Dado los siguientes esquemas escritos en sql que te voy a pasar como ejemplo, 
          quiero que hagas la consulta en base a lo que te pida el usuario y quiero que me des 
          de la siguiete manera: 

          no me lo pongas de esta manera:

          


          {
            "query": "El query que vas a generar",
            "error": null,
            "originalPrompt": "Lo que te escribio el usuario"
          }

          schemas: 

          ${schema}
          

          si hay un error retornalo de esta forma

          ejemplo

          {
            "query": null,
            error:" el error"
            "originalPrompt": "Lo que te escribio el usuario"
          }
        
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

  console.log(completion.choices[0].message.content);

  const content = JSON.parse(
    completion.choices[0].message.content.replace(/```json|```/g, ''),
  );

  return { ...content, queryResults: '' };
};
