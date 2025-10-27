// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Wrench, Brain, Search, Loader, AlertCircle } from 'lucide-react';
import { Modal } from './components/Modal';
import { ParafusoForm } from './components/ParafusoForm';
import { AnaliseForm } from './components/AnaliseForm';
import { ResultadosTabela } from './components/ResultadosTabela';
import { Parafuso, AnaliseCorrosao, ResultadoAnalise } from './types';

// Assuma que a API está no mesmo domínio, sob /api
// Em ambiente de desenvolvimento, você pode precisar usar uma URL completa como "http://localhost:5000/api"
const API_BASE_URL = '/api'; 

function App() {
  const [parafusos, setParafusos] = useState<Parafuso[]>([]);
  const [analises, setAnalises] = useState<AnaliseCorrosao[]>([]);
  const [resultados, setResultados] = useState<ResultadoAnalise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showParafusoModal, setShowParafusoModal] = useState(false);
  const [showAnaliseModal, setShowAnaliseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar parafusos do back-end
  const fetchParafusos = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/parafusos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Parafuso[] = await response.json();
      setParafusos(data);
    } catch (e) {
      console.error("Erro ao buscar parafusos:", e);
      setError("Não foi possível carregar os parafusos.");
    }
  }, []); // Dependências vazias, pois só precisamos que ela seja criada uma vez

  // Função para buscar análises do back-end
  const fetchAnalises = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analises`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AnaliseCorrosao[] = await response.json();
      setAnalises(data);
    } catch (e) {
      console.error("Erro ao buscar análises:", e);
      setError("Não foi possível carregar as análises.");
    }
  }, []); // Dependências vazias

  // Carregar dados na montagem do componente
  useEffect(() => {
    setLoading(true);
    setError(null); // Limpa erros anteriores
    const loadData = async () => {
      await Promise.all([fetchParafusos(), fetchAnalises()]); // Busca ambos em paralelo
      setLoading(false);
    };
    loadData();
  }, [fetchParafusos, fetchAnalises]);


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

  // Função para adicionar parafuso via API
  const handleAddParafuso = async (novoParafusoData: Omit<Parafuso, 'id' | 'dataRegistro'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/parafusos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoParafusoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const addedParafuso: Parafuso = await response.json();
      setParafusos(prev => [...prev, addedParafuso]);
      setShowParafusoModal(false);
    } catch (e: any) {
      console.error("Erro ao adicionar parafuso:", e);
      alert(`Erro ao registrar parafuso: ${e.message}. Verifique a conexão com a API.`);
    }
  };

  // Função para adicionar análise via API (agora incluindo o arquivo de imagem)
  const handleAddAnalise = async (novaAnaliseData: Omit<AnaliseCorrosao, 'id' | 'dataAnalise' | 'percentualAfetado'>, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('parafusoId', novaAnaliseData.parafusoId);
      formData.append('observacoes', novaAnaliseData.observacoes);
      formData.append('responsavel', novaAnaliseData.responsavel);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData, // FormData não precisa de 'Content-Type' header, o browser cuida disso
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const addedAnalise: AnaliseCorrosao = await response.json();
      setAnalises(prev => [...prev, addedAnalise]); // Adiciona a nova análise à lista local
      setShowAnaliseModal(false);
    } catch (e: any) {
      console.error("Erro ao adicionar análise:", e);
      alert(`Erro ao realizar análise com IA: ${e.message}. Verifique o console para mais detalhes.`);
      throw e; // Propaga o erro para que o AnaliseForm possa tratá-lo no finally
    }
  };


  // Filtrar resultados baseado no termo de busca
  const resultadosFiltrados = resultados.filter(resultado =>
    resultado.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">Carregando dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-4 rounded-lg shadow-md m-4">
        <AlertCircle className="w-8 h-8 mr-2 mb-3" />
        <p className="text-xl font-semibold mb-2">Ops! Ocorreu um erro.</p>
        <span className="text-gray-700">{error}</span>
        <button 
          onClick={() => { setError(null); setLoading(true); Promise.all([fetchParafusos(), fetchAnalises()]); }} 
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
        >
          <Loader className="w-4 h-4 mr-2" />
          Tentar novamente
        </button>
      </div>
    );
  }

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
          onSubmit={handleAddAnalise} // Passa a nova função handleAddAnalise
          onCancel={() => setShowAnaliseModal(false)}
        />
      </Modal>
    </div>
  );
}

export default App;