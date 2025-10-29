import React, { useState, useEffect } from 'react';
import { Plus, Wrench, Brain, Search } from 'lucide-react';
import { Modal } from './components/Modal';
import { ParafusoForm } from './components/ParafusoForm';
import { AnaliseForm } from './components/AnaliseForm';
import { ResultadosTabela } from './components/ResultadosTabela';
import { Parafuso, AnaliseCorrosao, ResultadoAnalise } from './types';

function App() {
    const [parafusos, setParafusos] = useState<Parafuso[]>([]);
    const [analises, setAnalises] = useState<AnaliseCorrosao[]>([]);
    const [resultados, setResultados] = useState<ResultadoAnalise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [showParafusoModal, setShowParafusoModal] = useState(false);
    const [showAnaliseModal, setShowAnaliseModal] = useState(false);

    // Função para gerar ID único
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Atualizar resultados quando parafusos ou análises mudarem
    useEffect(() => {
        const novosResultados: ResultadoAnalise[] = parafusos.map(parafuso => {
            const analisesDoParafuso = analises.filter(a => a.parafusoId === parafuso.id);
            const ultimaAnalise = analisesDoParafuso.sort((a, b) =>
                new Date(b.dataAnalise).getTime() - new Date(a.dataAnalise).getTime()
            )[0];

            return {
                ...parafuso,
                ultimaAnalise,
                totalAnalises: analisesDoParafuso.length
            };
        });

        setResultados(novosResultados);
    }, [parafusos, analises]);

    const handleAddParafuso = (novoParafuso: Omit<Parafuso, 'id' | 'dataRegistro'>) => {
        const parafuso: Parafuso = {
            ...novoParafuso,
            id: generateId(),
            dataRegistro: new Date().toISOString()
        };

        setParafusos(prev => [...prev, parafuso]);
        setShowParafusoModal(false);
    };

    const handleAddAnalise = (novaAnalise: Omit<AnaliseCorrosao, 'id' | 'dataAnalise'>) => {
        const analise: AnaliseCorrosao = {
            ...novaAnalise,
            id: generateId(),
            dataAnalise: new Date().toISOString()
        };

        setAnalises(prev => [...prev, analise]);
        setShowAnaliseModal(false);
    };

    // Filtrar resultados baseado no termo de busca
    const resultadosFiltrados = resultados.filter(resultado =>
        resultado.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Wrench className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Sistema de Análise de Corrosão
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Monitoramento inteligente de parafusos
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-50 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-blue-700">
                                    {parafusos.length} parafusos registrados
                                </span>
                            </div>
                            <div className="bg-green-50 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-green-700">
                                    {analises.length} análises realizadas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowParafusoModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={20} className="mr-2" />
                            Registrar Parafuso
                        </button>

                        <button
                            onClick={() => setShowAnaliseModal(true)}
                            disabled={parafusos.length === 0}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <Brain size={20} className="mr-2" />
                            Analisar com IA
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por código do parafuso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Resultados das Análises
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {resultadosFiltrados.length} de {resultados.length} parafusos
                        </p>
                    </div>

                    <ResultadosTabela resultados={resultadosFiltrados} analises={analises} />
                </div>
            </main>

            {/* Modals */}
            <Modal
                isOpen={showParafusoModal}
                onClose={() => setShowParafusoModal(false)}
                title="Registrar Novo Parafuso"
            >
                <ParafusoForm
                    onSubmit={handleAddParafuso}
                    onCancel={() => setShowParafusoModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showAnaliseModal}
                onClose={() => setShowAnaliseModal(false)}
                title="Análise de Corrosão com IA"
            >
                <AnaliseForm
                    parafusos={parafusos}
                    onSubmit={handleAddAnalise}
                    onCancel={() => setShowAnaliseModal(false)}
                />
            </Modal>
        </div>
    );
}

export default App;
