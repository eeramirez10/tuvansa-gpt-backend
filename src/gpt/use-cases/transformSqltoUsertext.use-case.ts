import OpenAI from 'openai';
import { schema } from 'src/data/schema';

export const transformSqlToUserText = async (
  openai: OpenAI,
  {
    sqlResult,
    humanQuery,
  }: { userQuestion: string; sqlResult: string; humanQuery: string },
) => {
  console.log(`${JSON.stringify(sqlResult)}`);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
          Given a users question and the SQL rows response from the database from which the user wants to get the answer,
          write a response to the user's question.
          <user_question> 
          ${humanQuery}
          </user_question>
          <sql_response>
          ${JSON.stringify(sqlResult)}
          </sql_response>

          y este el el schema de la base de datos en base la resultado del objeto:
          <schema_db>
          ${schema}
          </schema_db>
          
          dame la respuesta en español

        `,
      },
    ],
    model: 'gpt-4o-mini',
    max_tokens: 500,
    temperature: 0.8,
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
};
