/* eslint-disable prettier/prettier */
import OpenAI from 'openai';
import { schema } from 'src/data/schema';

interface TransformSqlToUserTextResponse {
  result: string
}

export const transformSqlToUserText = async (openai: OpenAI, { sqlResult, userQuestion }: { userQuestion: string; sqlResult: string; humanQuery: string },
): Promise<[string?, TransformSqlToUserTextResponse?]> => {
  
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
          Given a users question and the SQL rows response from the database from which the user wants to get the answer,
          write a response to the user's question.
          <user_question> 
          ${userQuestion}
          </user_question>
          <sql_response>
          ${JSON.stringify(sqlResult)}
          </sql_response>

          y este el el schema de la base de datos en base la resultado del objeto:
          <schema_db>
          ${schema}
          </schema_db>
          
          dame la respuesta en español y mandamelo asi

          {
            "result": aqui va la respuesta,
            "ok": true o false en caso de que haya un error,
            "error": aqui el error en caso de que exista si no existe entonces null
          }

          

        `,
      },
    ],
    model: 'gpt-4o-mini',
    max_tokens: 1000,
    temperature: 0.8,
  });

  const content = JSON.parse(
    completion.choices[0].message.content.replace(/```json|```/g, ''),
  );

  if(content.error) return [content.error]

  // console.log(completion.choices[0].message.content);
  return [undefined, { result: content.result }]
};
