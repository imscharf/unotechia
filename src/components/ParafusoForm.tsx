import React, { useState } from 'react';
import { Parafuso } from '../types';

interface ParafusoFormProps {
  onSubmit: (parafuso: Omit<Parafuso, 'id' | 'dataRegistro'>) => void;
  onCancel: () => void;
}

export function ParafusoForm({ onSubmit, onCancel }: ParafusoFormProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: '',
    cor: '',
    material: '',
    diametro: 0,
    comprimento: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'diametro' || name === 'comprimento' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código do Parafuso *
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: PAR-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o tipo</option>
            <option value="Phillips">Phillips</option>
            <option value="Fenda">Fenda</option>
            <option value="Allen">Allen</option>
            <option value="Torx">Torx</option>
            <option value="Sextavado">Sextavado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cor *
          </label>
          <input
            type="text"
            name="cor"
            value={formData.cor}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Prateado, Dourado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material *
          </label>
          <select
            name="material"
            value={formData.material}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o material</option>
            <option value="Aço Carbono">Aço Carbono</option>
            <option value="Aço Inoxidável">Aço Inoxidável</option>
            <option value="Latão">Latão</option>
            <option value="Alumínio">Alumínio</option>
            <option value="Titânio">Titânio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diâmetro (mm) *
          </label>
          <input
            type="number"
            name="diametro"
            value={formData.diametro}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 6.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comprimento (mm) *
          </label>
          <input
            type="number"
            name="comprimento"
            value={formData.comprimento}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 25.0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Registrar Parafuso
        </button>
      </div>
    </form>
  );
}