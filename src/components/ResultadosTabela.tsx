import React, { useState } from 'react';
import { ResultadoAnalise, AnaliseCorrosao } from '../types';
import { AlertCircle, Brain, ChevronDown, ChevronRight, Calendar, User } from 'lucide-react';

interface ResultadosTabelaProps {
  resultados: ResultadoAnalise[];
  analises: AnaliseCorrosao[];
}

export function ResultadosTabela({ resultados, analises }: ResultadosTabelaProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (parafusoId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(parafusoId)) {
      newExpanded.delete(parafusoId);
    } else {
      newExpanded.add(parafusoId);
    }
    setExpandedRows(newExpanded);
  };

  const getAnalisesDoParafuso = (parafusoId: string) => {
    return analises
      .filter(a => a.parafusoId === parafusoId)
      .sort((a, b) => new Date(b.dataAnalise).getTime() - new Date(a.dataAnalise).getTime());
  };

  const getPercentualColor = (percentual: number) => {
    if (percentual < 10) return 'text-green-700 bg-green-100';
    if (percentual < 25) return 'text-yellow-700 bg-yellow-100';
    if (percentual < 50) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (resultados.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <AlertCircle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-gray-500">
          Registre parafusos e adicione análises para visualizar os resultados aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
              
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Parafuso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Especificações
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Última Análise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              % Corrosão (Cabeça)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Análises
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {resultados.map((resultado) => {
            const analisesDoParafuso = getAnalisesDoParafuso(resultado.id);
            const isExpanded = expandedRows.has(resultado.id);
            const hasAnalises = analisesDoParafuso.length > 0;

            return (
              <React.Fragment key={resultado.id}>
                {/* Linha principal do parafuso */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasAnalises && (
                      <button
                        onClick={() => toggleRow(resultado.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {resultado.codigo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="text-gray-500">
                        Registrado em: {new Date(resultado.dataRegistro).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resultado.ultimaAnalise 
                      ? formatDate(resultado.ultimaAnalise.dataAnalise)
                      : 'Sem análise'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {resultado.ultimaAnalise ? (
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPercentualColor(resultado.ultimaAnalise.percentualAfetado)}`}>
                          {resultado.ultimaAnalise.percentualAfetado.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Sem análise</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {resultado.totalAnalises}
                    </span>
                  </td>
                </tr>

                {/* Linhas das análises (subitens) */}
                {isExpanded && analisesDoParafuso.map((analise, index) => (
                  <tr key={analise.id} className="bg-gray-50">
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3" colSpan={5}>
                      <div className="ml-4 border-l-2 border-blue-200 pl-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-900">
                                Análise #{analisesDoParafuso.length - index}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPercentualColor(analise.percentualAfetado)}`}>
                                {analise.percentualAfetado.toFixed(1)}% de corrosão
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(analise.dataAnalise)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Responsável:</span>
                              <span className="font-medium text-gray-900">{analise.responsavel}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Data:</span>
                              <span className="font-medium text-gray-900">
                                {formatDate(analise.dataAnalise)}
                              </span>
                            </div>
                          </div>

                          {analise.observacoes && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="text-sm">
                                <span className="text-gray-600 font-medium">Observações:</span>
                                <p className="mt-1 text-gray-900">{analise.observacoes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}