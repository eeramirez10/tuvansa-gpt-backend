import OpenAI from 'openai';

export interface AnalyzeQuoteUseCaseReturnProps {
  description: string;
  cantidad: string;
  unidad: string;
}

export const analyzeQuoteUseCase = async (
  openai: OpenAI,
  textContent: string,
): Promise<AnalyzeQuoteUseCaseReturnProps[]> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Eres un asistente que organiza solicitudes de cotización de materiales en un formato uniforme.',
      },
      // {
      //   role: 'user',
      //   content: `Extrae y organiza la información clave de esta cotización:\n${textContent}`,
      // },
      // {
      //   role: 'system',
      //   content: `Eres un asistente que organiza solicitudes de cotización de materiales en un formato uniforme.`,
      // },
      {
        role: 'user',
        content: `
          Extrae y organiza la información clave de esta cotización solo dame la informacion de los productos, quiero que me lo regreses asi:
          {
            description: la descripcion del producto o la informacion del producto concatenando otras columnas si viene info de relacionada a la descripcion,
            cantidad: la cantidad de piezas o metros del producto que pide el cliente,
            unidad: la unidad de medida del producto (pza, m, cm, pieza, metro, tramo, etc...),

          }
           y regresamela en json el puro json sin explicaciones ni nada con los valores de cada uno:\n${textContent}
        
          `,
        //   content: `
        //   Analiza la informacion de la cotizacion:\n${textContent}

        //   ahora de la informacion que analizaste busca los productos en esta otra lista ${products} y solo dame los que encontraste
        //   `,
      },
    ],
    temperature: 0.2,
    max_tokens: 10000,
  });

  console.log(response.choices[0].message.content);

  let extractedInfo = response.choices[0].message.content;

  if (
    extractedInfo.startsWith('```json\n') &&
    extractedInfo.endsWith('\n```')
  ) {
    extractedInfo = extractedInfo
      .replace(/```json\n/, '') // Elimina el inicio ```json
      .replace(/\n```$/, ''); // Elimina el final ```
  }

  return JSON.parse(extractedInfo);
};
