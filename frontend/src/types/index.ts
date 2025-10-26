// src/types/index.ts
export interface Parafuso {
  id: string;
  codigo: string;
  dataRegistro: string;
}

export interface DetalhesCorrosao {
  percentual_total_afetado: number;
  percentual_vermelha: number;
  percentual_preta: number;
  percentual_branca: number;
}

export interface AnaliseCorrosao {
  id: string;
  parafusoId: string;
  percentualAfetado: number; // Campo principal, pode ser o total afetado
  detalhesCorrosao?: DetalhesCorrosao; // Novo campo para detalhes da IA
  observacoes: string;
  dataAnalise: string;
  responsavel: string;
}

export interface ResultadoAnalise extends Parafuso {
  ultimaAnalise?: AnaliseCorrosao;
  totalAnalises: number;
}