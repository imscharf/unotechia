import React, { useState } from 'react';
import { AnaliseCorrosao, Parafuso } from '../types';
import { Brain, Loader } from 'lucide-react';

interface AnaliseFormProps {
  parafusos: Parafuso[];
  onSubmit: (analise: Omit<AnaliseCorrosao, 'id' | 'dataAnalise'>) => void;
  onCancel: () => void;
}

export function AnaliseForm({ parafusos, onSubmit, onCancel }: AnaliseFormProps) {
  const [formData, setFormData] = useState({
    parafusoId: '',
    observacoes: '',
    responsavel: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      // Simular chamada para a IA (substitua pela sua implementação real)
      const percentualAfetado = await chamarIA(formData.parafusoId);
      
      onSubmit({
        ...formData,
        percentualAfetado
      });
    } catch (error) {
      console.error('Erro ao analisar com IA:', error);
      alert('Erro ao processar análise com IA. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função simulada da IA - substitua pela sua implementação real
  const chamarIA = async (parafusoId: string): Promise<number> => {
    // Simular delay da IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular resultado da IA (0-100%)
    return Math.round(Math.random() * 100 * 100) / 100;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const parafusoSelecionado = parafusos.find(p => p.id === formData.parafusoId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-900">Análise com IA</h3>
        </div>
        <p className="text-sm text-blue-700">
          Nossa IA analisará automaticamente a corrosão na cabeça do parafuso e calculará o percentual afetado.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parafuso para Análise *
          </label>
          <select
            name="parafusoId"
            value={formData.parafusoId}
            onChange={handleChange}
            required
            disabled={isAnalyzing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione um parafuso</option>
            {parafusos.map(parafuso => (
              <option key={parafuso.id} value={parafuso.id}>
                {parafuso.codigo} - {parafuso.tipo} ({parafuso.material})
              </option>
            ))}
          </select>
        </div>

        {parafusoSelecionado && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Detalhes do Parafuso</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Código:</span>
                <span className="ml-2 font-medium">{parafusoSelecionado.codigo}</span>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <span className="ml-2 font-medium">{parafusoSelecionado.tipo}</span>
              </div>
              <div>
                <span className="text-gray-500">Material:</span>
                <span className="ml-2 font-medium">{parafusoSelecionado.material}</span>
              </div>
              <div>
                <span className="text-gray-500">Dimensões:</span>
                <span className="ml-2 font-medium">Ø{parafusoSelecionado.diametro}mm × {parafusoSelecionado.comprimento}mm</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável pela Análise *
          </label>
          <input
            type="text"
            name="responsavel"
            value={formData.responsavel}
            onChange={handleChange}
            required
            disabled={isAnalyzing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Nome do responsável pela análise"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
            disabled={isAnalyzing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Observações adicionais sobre a análise..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isAnalyzing}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isAnalyzing || !formData.parafusoId || !formData.responsavel}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Analisando com IA...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>Analisar com IA</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}