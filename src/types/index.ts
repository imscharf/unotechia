export interface Parafuso {
  id: string;
  codigo: string;
  tipo: string;
  cor: string;
  material: string;
  diametro: number;
  comprimento: number;
  dataRegistro: string;
}

export interface AnaliseCorrosao {
  id: string;
  parafusoId: string;
  percentualAfetado: number;
  observacoes: string;
  dataAnalise: string;
  responsavel: string;
}

export interface ResultadoAnalise extends Parafuso {
  ultimaAnalise?: AnaliseCorrosao;
  totalAnalises: number;
}