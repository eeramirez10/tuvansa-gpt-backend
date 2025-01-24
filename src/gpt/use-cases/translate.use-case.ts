import OpenAI from 'openai';

interface Options {
  prompt: string;
  lang: string;
}

export const translateUseCase = async (openai: OpenAI, options: Options) => {
  const { prompt, lang } = options;

  return await openai.chat.completions.create({
    stream: true,
    messages: [
      {
        role: 'system',
        content: `
          Traduce el s texto al idioma ${lang}
        `,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'gpt-4o-mini',
    max_tokens: 1000,
    temperature: 0.2,
  });
};
