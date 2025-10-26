// src/components/AnaliseForm.tsx
import { useState } from 'react';
import { AnaliseCorrosao, Parafuso } from '../types';
import { Brain, Loader, FileImage } from 'lucide-react'; // Adicionado FileImage para o ícone do upload

interface AnaliseFormProps {
  parafusos: Parafuso[];
  // O onSubmit agora espera o File da imagem
  onSubmit: (analise: Omit<AnaliseCorrosao, 'id' | 'dataAnalise' | 'percentualAfetado'>, imageFile: File) => Promise<void>;
  onCancel: () => void;
}

export function AnaliseForm({ parafusos, onSubmit, onCancel }: AnaliseFormProps) {
  const [formData, setFormData] = useState({
    parafusoId: '',
    observacoes: '',
    responsavel: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null); // Novo estado para a imagem
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null); // Limpa erros de arquivo anteriores

    if (!imageFile) {
      setFileError('Por favor, selecione uma imagem para análise.');
      return;
    }

    // Verifica se os campos obrigatórios estão preenchidos antes de iniciar a análise
    if (!formData.parafusoId || !formData.responsavel) {
        alert('Por favor, preencha todos os campos obrigatórios (Parafuso e Responsável).');
        return;
    }

    setIsAnalyzing(true);

    try {
      // Chama o onSubmit do App.tsx, passando os dados do formulário e o arquivo de imagem
      await onSubmit(formData, imageFile);
      // O onSubmit no App.tsx já cuida de fechar o modal e atualizar os dados
    } catch (error) {
      console.error('Erro ao analisar com IA:', error);
      // O erro já é alertado no App.tsx, mas podemos adicionar um feedback aqui também se necessário
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validação básica do tipo de arquivo
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setFileError(null); // Limpa o erro se um arquivo válido for selecionado
      } else {
        setImageFile(null);
        setFileError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF).');
      }
    } else {
      setImageFile(null);
      setFileError('Nenhum arquivo selecionado.');
    }
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
          Carregue uma imagem da cabeça do parafuso para nossa IA analisar automaticamente o percentual de corrosão.
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
                {parafuso.codigo}
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
                <span className="text-gray-500">Registrado em:</span>
                <span className="ml-2 font-medium">
                  {new Date(parafusoSelecionado.dataRegistro).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Campo de Upload de Imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Carregar Imagem do Parafuso *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <FileImage className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Faça o upload de um arquivo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isAnalyzing}
                    accept="image/*" // Aceita apenas arquivos de imagem
                  />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF até 10MB
              </p>
              {imageFile && (
                <p className="text-sm text-gray-800 mt-2">
                  Arquivo selecionado: <span className="font-medium">{imageFile.name}</span>
                </p>
              )}
              {fileError && (
                <p className="text-sm text-red-600 mt-2">{fileError}</p>
              )}
            </div>
          </div>
        </div>

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
          disabled={isAnalyzing || !formData.parafusoId || !formData.responsavel || !imageFile}
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