import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { Parafuso } from '../types';

interface ParafusoFormProps {
    onSubmit: (parafuso: Omit<Parafuso, 'id' | 'dataRegistro'>) => void;
    onCancel: () => void;
}

export function ParafusoForm({ onSubmit, onCancel }: ParafusoFormProps) {
    const [formData, setFormData] = useState({
        codigo: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-medium text-blue-900">Registro Simplificado</h3>
                </div>
                <p className="text-sm text-blue-700">
                    Cadastre apenas o código do parafuso para começar o monitoramento.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código do Parafuso *
                </label>
                <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Ex: PAR-001, BOLT-123, SCR-456..."
                    autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">
                    Digite um código único para identificar este parafuso
                </p>
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
