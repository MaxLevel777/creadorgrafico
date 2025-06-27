import React, { useState, useCallback, useRef, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { ChartDisplay } from './components/ChartDisplay';
import { DataItem, ChartOptions, ChartType } from './types';
import { INITIAL_DATA_ITEMS, DEFAULT_CHART_COLOR } from './constants';
import { generateChartDataFromPrompt, generateChartInsights } from './lib/gemini';
import { AppLogo } from './components/Icons';

const App: React.FC = () => {
  const [dataItems, setDataItems] = useState<DataItem[]>(INITIAL_DATA_ITEMS);
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    title: 'Informe de Ventas T1-T2',
    type: ChartType.BAR,
    color: DEFAULT_CHART_COLOR,
  });

  const [isLoading, setIsLoading] = useState({ data: false, insights: false });
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('chartData');
      const savedOptions = localStorage.getItem('chartOptions');
      if (savedData) {
        setDataItems(JSON.parse(savedData));
      }
      if (savedOptions) {
        setChartOptions(JSON.parse(savedOptions));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('chartData', JSON.stringify(dataItems));
      localStorage.setItem('chartOptions', JSON.stringify(chartOptions));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [dataItems, chartOptions]);


  const handleUpdateChartOptions = useCallback((newOptions: Partial<ChartOptions>) => {
    setChartOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const handleSetDataItems = useCallback((newDataItems: DataItem[]) => {
    setDataItems(newDataItems);
  }, []);

  const handleGenerateData = async (prompt: string) => {
    if (!prompt) return;
    setIsLoading(prev => ({ ...prev, data: true }));
    setError(null);
    setInsights(null);
    try {
      const newData = await generateChartDataFromPrompt(prompt);
      setDataItems(newData);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Error al generar los datos. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(prev => ({ ...prev, data: false }));
    }
  };

  const handleGenerateInsights = async () => {
    setIsLoading(prev => ({ ...prev, insights: true }));
    setError(null);
    setInsights(null);
    try {
      const newInsights = await generateChartInsights(dataItems, chartOptions);
      setInsights(newInsights);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Error al generar las ideas. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(prev => ({ ...prev, insights: false }));
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AppLogo />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Creador de Gráficos con IA</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <InputPanel
            dataItems={dataItems}
            setDataItems={handleSetDataItems}
            chartOptions={chartOptions}
            updateChartOptions={handleUpdateChartOptions}
            onGenerateData={handleGenerateData}
            isGeneratingData={isLoading.data}
            aiError={error}
          />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col">
          <ChartDisplay
            ref={chartContainerRef}
            dataItems={dataItems}
            chartOptions={chartOptions}
            onGenerateInsights={handleGenerateInsights}
            isGeneratingInsights={isLoading.insights}
            insights={insights}
            aiError={error}
          />
        </div>
      </main>

      <footer className="bg-gray-800 text-white text-center p-4 text-sm">
        © {new Date().getFullYear()} Creador de Gráficos con IA. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default App;