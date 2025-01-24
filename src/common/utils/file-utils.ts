/* eslint-disable prettier/prettier */

import * as pdfParse from 'pdf-parse';
import { type  ProductFile } from 'src/interfaces';
import * as xlsx from 'xlsx';
import * as fs from 'fs'
import * as readline from 'readline';

export const extractTextFromPdf = async (fileBuffer: Buffer): Promise<string> => {
  const pdfData = await pdfParse(fileBuffer);
  return pdfData.text;
};

export const extractTextFromExcel = (fileBuffer: Buffer) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return JSON.stringify(sheetData, null, 2);
};

export const loadProductsFromFile = async (filePath: string) => {
  let products: ProductFile[] = []

  const fileStream = fs.createReadStream(filePath)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    const [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      CODIGO, CLAVE, PRECIO1, PRECIO2, COSTO, ULTIMO_COSTO, DESCRIPCION
    ] = line.split('\t')

    products = [...products, { codigo: CODIGO, ean: CLAVE, descripcion: DESCRIPCION }]
  }

  return products
}
