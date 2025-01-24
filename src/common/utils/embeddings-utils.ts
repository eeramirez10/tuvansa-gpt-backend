import { Product, ProductEmbedding } from 'src/interfaces';
import * as fs from 'fs';
import OpenAI from 'openai';
import * as path from 'path';
import { generateProductDescriptionUseCase } from 'src/gpt/use-cases/generate-product-description-use-case';
import { EmbeddingModel } from 'openai/resources';
import { AnalyzeQuoteUseCaseReturnProps } from 'src/gpt/use-cases/analyze-quote.use-case';

const foderPath = path.resolve(__dirname, '../../../generated/embeddings/');

export const generateProductsEmbeddings = async (
  openai: OpenAI,
  products: Product[],
  filename: string,
) => {
  // const embeddings = await Promise.all(
  //   products.map(async (product) => {
  //     console.log(product.descripcion);
  //     const response = await openai.embeddings.create({
  //       model: 'text-embedding-3-small',
  //       input: product.descripcion ?? 'non',
  //     });

  //     return {
  //       codigo: product.codigo,
  //       descripcion: product.descripcion,
  //       embedding: response.data[0].embedding,
  //     };
  //   }),
  // );

  const embeddings = [];

  for (const product of products) {
    if (
      !product.descripcion ||
      product.descripcion === '' ||
      product.descripcion === null ||
      product.descripcion === undefined
    ) {
      continue;
    }
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: product.descripcion,
      encoding_format: 'float',
    });

    embeddings.push({
      codigo: product.codigo,
      descripcion: product.descripcion,
      ean: product.ean,
      embedding: response.data[0].embedding,
    });
  }

  fs.mkdirSync(foderPath, { recursive: true });

  fs.writeFileSync(
    `${foderPath}/${filename}-embeddings.json`,
    JSON.stringify(embeddings, null, 2),
  );
};

export const embbedingText = async (
  openai: OpenAI,
  textToEmbedding: string,
  model: EmbeddingModel = 'text-embedding-3-large',
) => {
  const response = await openai.embeddings.create({
    model,
    input: textToEmbedding,
    encoding_format: 'float',
  });
  return response.data[0].embedding;
};

export const indSimilarProducts = async (
  openai: OpenAI,
  product: AnalyzeQuoteUseCaseReturnProps,
): Promise<{
  description: string;
  exactMatch: Product;
  similaritiesProducts: Product[];
}> => {
  const cleanDescription = product.description.trim().toUpperCase();

  const generatedDescription = await generateProductDescriptionUseCase(
    openai,
    product,
  );

  const {
    ranurado,
    galvanizado,
    costura,
    pulgada,
    ced,
    roscado,
    liso,
    tramos,
    negro,
  } = generatedDescription;

  const generatedEan = `${costura}${pulgada.replace(/\s+/g, '')}${ced}${negro ?? ''}${ranurado ?? ''}${galvanizado ?? ''}${liso ?? ''}${roscado ?? ''}${tramos ?? ''}`;

  const clientEmbedding = await embbedingText(openai, cleanDescription);

  const embeddings = JSON.parse(
    fs.readFileSync(`${foderPath}/tuberia-embeddings.json`, 'utf-8'),
  ) as ProductEmbedding[];

  const similarities = embeddings.map((product) => {
    const similarity = cosineSimilarity(clientEmbedding, product.embedding);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { embedding, ...rest } = product;
    return { ...rest, similarity };
  });

  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity,
  );

  const findProduct = findExactProductByEan(sortedSimilarities, generatedEan);

  const findSimilarities = filterProductsByRegex(
    generatedEan,
    sortedSimilarities,
  );

  const exactMatch = findProduct.length > 0 ? findProduct[0] : null;
  const similaritiesProducts = exactMatch
    ? findSimilarities.filter((product) => product.codigo !== exactMatch.codigo)
    : null;

  return {
    description: cleanDescription,
    exactMatch,
    similaritiesProducts, // Top 5
  };
};

export const filterProductsByRegex = (
  textToFind: string,
  products: Product[],
) => {
  const escaped = textToFind.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const reg = new RegExp(escaped);

  return products.filter((product) => reg.test(product.ean));
};

// export const filterSimilaritiesByRegex = async (
//   openai: OpenAI,
//   similarities: any[],
//   description: string,
// ): Promise<any[]> => {
//   const generatedDescription = await generateProductDescriptionUseCase(
//     openai,
//     description,
//   );

//   console.log({ generatedDescription });

//   const {
//     product,
//     ranurado,
//     galvanizado,
//     toSearch,
//     costura,
//     pulgada,
//     ced,
//     roscado,
//     liso,
//   } = generatedDescription;

//   // const escapedProduct = product.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

//   const escapedCostura = costura.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

//   const escapedRanurado = ranurado?.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

//   const escapedGalvanizado = galvanizado?.replace(
//     /[-\/\\^$*+?.()|[\]{}]/g,
//     '\\$&',
//   );

//   const adjustedPattern = toSearch.replace(/CED\.?/gi, 'CED\\.?');

//   const generatedEan = `${costura}${pulgada.replace(/\s+/g, '')}${ced}${ranurado ?? ''}${galvanizado ?? ''}${liso ?? ''}${roscado ?? ''}`;

//   console.log(generatedEan);

//   const findByProduct = !product
//     ? similarities
//     : similarities.filter((product) =>
//         new RegExp(escapedCostura).test(product.ean),
//       );

//   const findDiameter = findByProduct.filter((product) =>
//     new RegExp(pulgada).test(product.ean),
//   );

//   const findCed = findDiameter.filter((product) =>
//     new RegExp(ced).test(product.ean),
//   );

//   // console.log({ findByProduct });

//   const findByGalv = !galvanizado
//     ? findCed.filter((product) => !new RegExp('G').test(product.ean))
//     : findCed.filter((product) =>
//         new RegExp(escapedGalvanizado).test(product.ean),
//       );
//   // console.log({ findByGalv });

//   const findByRan = !ranurado
//     ? findByGalv.filter((product) => !new RegExp('RA').test(product.ean))
//     : findByGalv.filter((product) =>
//         new RegExp(escapedRanurado).test(product.ean),
//       );
//   // console.log({ findByRan });

//   const findByToSearch = findByRan.filter((product) =>
//     new RegExp(adjustedPattern, 'i').test(product.descripcion),
//   );

//   // console.log({ findByToSearch });

//   return findByToSearch;
// };

export const findExactProductByEan = (products: Product[], ean: string) => {
  return products.filter((product) => product.ean === ean);
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
