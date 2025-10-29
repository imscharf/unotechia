import React, { useState } from 'react';
import { AnaliseCorrosao, Parafuso, DetalhesCorrosao } from '../types'; // Importe DetalhesCorrosao
import { Brain, Loader, AlertCircle } from 'lucide-react';

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
        imagemParafuso: null as File | null, // Novo estado para a imagem
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Limpa erros anteriores

        if (!formData.imagemParafuso) {
            setError("Por favor, selecione uma imagem do parafuso para análise.");
            return;
        }

        setIsAnalyzing(true);

        try {
            const { percentualAfetado, detalhesCorrosao } = await chamarIA(formData.imagemParafuso);

            onSubmit({
                ...formData,
                percentualAfetado,
                detalhesCorrosao, // Passe os detalhes da corrosão
            });
        } catch (err) {
            console.error('Erro ao analisar com IA:', err);
            setError('Erro ao processar análise com IA. Verifique o console para mais detalhes.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const chamarIA = async (imagem: File): Promise<{ percentualAfetado: number; detalhesCorrosao: DetalhesCorrosao }> => {
        const apiUrl = '/api/analyze-corrosion/'; // Use o proxy configurado no vite.config.ts ou a URL direta da sua API
        const formData = new FormData();
        formData.append('file', imagem);

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Falha na análise da IA');
        }

        const data: DetalhesCorrosao = await response.json();

        return {
            percentualAfetado: data.percentual_total_afetado,
            detalhesCorrosao: data, // Retorna todos os detalhes
        };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                imagemParafuso: e.target.files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                imagemParafuso: null
            }));
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

                <div>
                    <label htmlFor="imagemParafuso" className="block text-sm font-medium text-gray-700 mb-1">
                        Imagem do Parafuso *
                    </label>
                    <input
                        type="file"
                        id="imagemParafuso"
                        name="imagemParafuso"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        disabled={isAnalyzing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.imagemParafuso && (
                        <p className="mt-2 text-sm text-gray-500">
                            Arquivo selecionado: {formData.imagemParafuso.name}
                        </p>
                    )}
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

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

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
                    disabled={isAnalyzing || !formData.parafusoId || !formData.responsavel || !formData.imagemParafuso}
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