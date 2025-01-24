import OpenAI from 'openai';
import { AnalyzeQuoteUseCaseReturnProps } from './analyze-quote.use-case';

interface ReturnProps {
  product: string;
  ced: string;
  diameter: string;
  costura?: string;
  material?: string;
  ranurado?: string;
  galvanizado?: string;
  roscado?: string;
  pulgada: string;
  liso: string;
  tramos?: string;
  negro?: string;
  toSearch: string;
}

export const generateProductDescriptionUseCase = async (
  openai: OpenAI,
  product: AnalyzeQuoteUseCaseReturnProps,
): Promise<ReturnProps> => {
  // Instrucción para OpenAI que maneja múltiples tipos de productos y descripciones

  console.log({ product });
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Eres un asistente que ayuda a extraer datos clave de descripciones de productos industriales como tubos, codos, tees, y reducciones.',
      },
      {
        role: 'user',
        content: `Extrae la siguiente información del producto:
                  - Tipo de producto (Tubo, Tee, Reducción, etc.) si viene tuberia entonces TUBO o similares
                  - Cédula (busca variantes como C, ced, cedula, Sch, STD) solo extrae el valor numerico
                  _ Si viene STD es STANDARD lo que significa que siempre va a ser 40
                  - Diámetro Nominal (pulgadas) pon el simbolo de " en vez de pulgadas
                  - Pulgada Aqui ponme el Diametro Nominal sin el simbolo " 
                  - Tipo de costura (con costura o sin costura, busca variantes como cc, c.c, sc, s.c) 
                    si es con costura entonces es TCC y si es sin ccostura TSC
                  - Material (acero al carbón o sus variantes como ac, a.c, AC)
                  - Ranurado (busca variantes como RAN, RANURADO, RAN., RAN-R y similares, si está presente pon RA )
                  - Galvanizado (busca variantes como GALV, GAL, GALVANIZADO, GALV. y similares, si está presente pon G )
                  - Roscado (busca variantes como ROSCADO, ROS., ROSC., y similares, si está presente R)
                  - Liso (busca variantes como LISO, LIS., LIS y similares, si está presente L)
                  - Tramos (busca variantes como TRAMOS, TM y variantes si esta presente pon TM )
                  - Negro (Busca Negro y si esta presente pon N)
                  - Si no se encuentra pon null a la propiedad
                  - Pon todo en mayusculas
                  - Quita acentos 
                  Descripción: "${JSON.stringify(product)}"




                  dame la informacion en un objeto json de la siguiente manera 

                  {
                    product: Tipo de producto,
                    ced: cedula / si no encuentra cedula entonces null,
                    diameter: Diametro,
                    costura: tipo de costura,
                    material: Material,
                    ranurado: Ranurado,
                    pulgada: diameter sin " y en string
                    roscado: Roscado
                    galvanizado: Galvanizado
                    liso: Liso
                    tramos: Tramos
                    negro:Negro
                  }
          `,
      },
    ],
    temperature: 0.2,
  });

  // Procesar la respuesta para obtener la información clave
  let extractedInfo = resp.choices[0].message.content as any;

  if (
    extractedInfo.startsWith('```json\n') &&
    extractedInfo.endsWith('\n```')
  ) {
    extractedInfo = extractedInfo
      .replace(/```json\n/, '') // Elimina el inicio ```json
      .replace(/\n```$/, ''); // Elimina el final ```
  }

  const extractedInfoToJson = JSON.parse(extractedInfo);

  console.log({ extractedInfoToJson });

  const cedula = extractedInfoToJson.ced
    ? `CED ${extractedInfoToJson.ced}`
    : '';

  const diameter = extractedInfoToJson.diameter ?? '';

  const descriptiongenerate = `${diameter} ${cedula}`;

  return { ...extractedInfoToJson, toSearch: descriptiongenerate };
};
