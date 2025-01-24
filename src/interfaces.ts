export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export interface Product {
  codigo: string;
  ean: string;
  descripcion: string;
  similarity: number;
}

export interface ProductEmbedding {
  codigo: string;
  ean: string;
  descripcion: string;
  embedding: number[];
}

export interface ProductFile {
  codigo: string;
  ean: string;
  descripcion: string;
}
