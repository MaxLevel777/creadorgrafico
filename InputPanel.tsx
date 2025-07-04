
import React, { useState, useCallback } from 'react';
import { DataItem, ChartOptions, ChartType } from '../types';
import { CHART_TYPES } from '../constants';
import { PlusIcon, TrashIcon, SparklesIcon, LoaderIcon } from './Icons';

interface InputPanelProps {
  dataItems: DataItem[];
  setDataItems: (items: DataItem[]) => void;
  chartOptions: ChartOptions;
  updateChartOptions: (options: Partial<ChartOptions>) => void;
  onGenerateData: (prompt: string) => void;
  isGeneratingData: boolean;
  aiError: string | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  dataItems,
  setDataItems,
  chartOptions,
  updateChartOptions,
  onGenerateData,
  isGeneratingData,
  aiError,
}) => {
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemValue, setNewItemValue] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  
  const multiColorChartTypes = [ChartType.PIE, ChartType.RADIAL_BAR, ChartType.TREEMAP];

  const handleAddItem = useCallback(() => {
    const value = parseFloat(newItemValue);
    if (newItemName.trim() && !isNaN(value)) {
      setDataItems([
        ...dataItems,
        { id: self.crypto.randomUUID(), name: newItemName.trim(), value },
      ]);
      setNewItemName('');
      setNewItemValue('');
    } else {
      alert("Por favor, ingrese un nombre válido y un valor numérico para el elemento.");
    }
  }, [newItemName, newItemValue, dataItems, setDataItems]);

  const handleRemoveItem = useCallback((id: string) => {
    setDataItems(dataItems.filter(item => item.id !== id));
  }, [dataItems, setDataItems]);
  
  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateData(aiPrompt);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Generar con IA</h2>
        <form onSubmit={handleAiSubmit} className="space-y-3">
          <div>
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-600 mb-1">
              Describa los datos que quiere visualizar
            </label>
            <textarea
              id="ai-prompt"
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Ventas trimestrales de una tienda de café durante un año"
              disabled={isGeneratingData}
            />
          </div>
          <button
            type="submit"
            disabled={isGeneratingData || !aiPrompt}
            className="w-full flex items-center justify-center p-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isGeneratingData ? (
              <LoaderIcon className="animate-spin mr-2" />
            ) : (
              <SparklesIcon className="mr-2" />
            )}
            {isGeneratingData ? 'Generando...' : 'Generar Datos'}
          </button>
          {aiError && <p className="text-sm text-red-600 mt-2">{aiError}</p>}
        </form>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Configuración del Gráfico</h2>
        <div className="space-y-4">
           <div>
            <label htmlFor="chartTitle" className="block text-sm font-medium text-gray-600 mb-1">Título del Gráfico</label>
            <input
              type="text"
              id="chartTitle"
              value={chartOptions.title}
              onChange={(e) => updateChartOptions({ title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingrese el título del gráfico"
            />
          </div>

          <div>
            <label htmlFor="chartType" className="block text-sm font-medium text-gray-600 mb-1">Tipo de Gráfico</label>
            <select
              id="chartType"
              value={chartOptions.type}
              onChange={(e) => updateChartOptions({ type: e.target.value as ChartType })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {CHART_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {!multiColorChartTypes.includes(chartOptions.type) && (
            <div>
              <label htmlFor="chartColor" className="block text-sm font-medium text-gray-600 mb-1">Color del Gráfico</label>
              <input
                type="color"
                id="chartColor"
                value={chartOptions.color}
                onChange={(e) => updateChartOptions({ color: e.target.value })}
                className="w-full h-10 p-1 border border-gray-300 rounded-md shadow-sm cursor-pointer"
              />
            </div>
           )}
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Editar Datos Manualmente</h2>
        <div className="space-y-3 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-600 mb-1">Etiqueta</label>
              <input
                type="text"
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Ej: Ventas"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="itemValue" className="block text-sm font-medium text-gray-600 mb-1">Valor</label>
              <input
                type="number"
                id="itemValue"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                placeholder="Ej: 100"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddItem}
            className="w-full flex items-center justify-center p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="mr-2"/> Añadir Elemento
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {dataItems.length === 0 && <p className="text-sm text-gray-500 text-center">Aún no hay elementos de datos.</p>}
          {dataItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-md shadow-sm">
              <span className="text-sm text-gray-700 truncate"><strong className="font-medium">{item.name}:</strong> {item.value}</span>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
                aria-label="Eliminar elemento"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
