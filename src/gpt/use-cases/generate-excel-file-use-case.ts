import * as path from 'path';
import * as xlsx from 'xlsx';
import * as fs from 'fs';

export const generateExcelFileUseCase = ({
  filename,
  data,
}: {
  filename: string;
  data: any[];
}) => {
  // Crear el libro y la hoja de Excel
  const folderPath = path.resolve(__dirname, '../../../generated/quotes');
  const excelFile = path.resolve(__dirname, `${folderPath}/${filename}.xlsx`);
  fs.mkdirSync(folderPath, { recursive: true });

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, filename);

  // Guardar el archivo temporalmente
  xlsx.writeFile(workbook, excelFile);

  return excelFile;
};
