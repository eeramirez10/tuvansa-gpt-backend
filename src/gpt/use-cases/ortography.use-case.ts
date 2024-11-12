import OpenAI from 'openai';

export interface Options {
  prompt: string;
  maxTokens?: number;
}

export const orthographyCheckUseCase = async (
  openai: OpenAI,
  options: Options,
) => {
  const { prompt } = options;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
          Te seran proveidos textos con posibles errores ortograficos y gramaticales,
          Debes de responder en formato JSON,
          tu tarea es corregirlos y retornar informacion soluciones,
          tambien debes de dar un porcentaje de acierto por el usuario,

          Si no hay errores, debes de retornar un mensaje de felicitaciones.

          Ejemplo de salida:

          {
            userScore: number,
            errors: string[ ] //['error -> solucion']
            message:string // usa emojis y tesxto para felicitar al usuario
          }
        
        `,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'gpt-4o-mini',
    max_tokens: 150,
  });

  return JSON.parse(completion.choices[0].message.content);
};
