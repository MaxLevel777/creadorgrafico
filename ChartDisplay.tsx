import React, { forwardRef, useCallback } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar,
  Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { DataItem, ChartOptions, ChartType } from '../types';
import { PIE_CHART_COLORS } from '../constants';
import { DownloadIcon, SparklesIcon, LightbulbIcon, LoaderIcon } from './Icons';

interface ChartDisplayProps {
  dataItems: DataItem[];
  chartOptions: ChartOptions;
  onGenerateInsights: () => void;
  isGeneratingInsights: boolean;
  insights: string | null;
  aiError: string | null;
}

const CustomizedTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value } = props;
    const isTextVisible = width > 70 && height > 25;
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {isTextVisible && (
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14} stroke="#000" strokeWidth={0.4} >
                    {name}
                </text>
            )}
        </g>
    );
};


export const ChartDisplay = forwardRef<HTMLDivElement, ChartDisplayProps>(({ 
  dataItems, 
  chartOptions,
  onGenerateInsights,
  isGeneratingInsights,
  insights,
  aiError
}, ref) => {
  
  const handleExportPNG = useCallback(async () => {
    if ((ref as React.RefObject<HTMLDivElement>)?.current) {
      try {
        const dataUrl = await toPng((ref as React.RefObject<HTMLDivElement>).current!, { 
            cacheBust: true, 
            pixelRatio: 2,
            backgroundColor: 'white'
        });
        const link = document.createElement('a');
        link.download = `${chartOptions.title.replace(/\s+/g, '_') || 'grafico'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error al exportar PNG:', error);
        alert('Error al exportar gráfico como PNG. Verifique la consola para más detalles.');
      }
    }
  }, [ref, chartOptions.title]);

  const handleExportPDF = useCallback(async () => {
    if ((ref as React.RefObject<HTMLDivElement>)?.current) {
      try {
        const chartElement = (ref as React.RefObject<HTMLDivElement>).current!;
        const dataUrl = await toPng(chartElement, { 
            cacheBust: true, 
            pixelRatio: 2,
            backgroundColor: 'white'
        });
        
        const pdf = new jsPDF({
          orientation: chartElement.offsetWidth > chartElement.offsetHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [chartElement.offsetWidth, chartElement.offsetHeight]
        });
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, chartElement.offsetWidth, chartElement.offsetHeight);
        pdf.save(`${chartOptions.title.replace(/\s+/g, '_') || 'grafico'}.pdf`);
      } catch (error) {
        console.error('Error al exportar PDF:', error);
        alert('Error al exportar gráfico como PDF. Verifique la consola para más detalles.');
      }
    }
  }, [ref, chartOptions.title]);

  const renderChart = () => {
    if (dataItems.length === 0) {
      return <div className="flex items-center justify-center h-full"><p className="text-center text-gray-500 py-10">No hay datos para mostrar. Genere o añada elementos de datos.</p></div>;
    }

    const commonProps = {
      data: dataItems,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };
    
    const tooltip = <Tooltip wrapperClassName="!border-gray-300 !bg-white/80 !backdrop-blur-sm !rounded-md !shadow-lg" />;

    switch (chartOptions.type) {
      case ChartType.BAR:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            {tooltip}
            <Legend />
            <Bar dataKey="value" fill={chartOptions.color} />
          </BarChart>
        );
      case ChartType.LINE:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            {tooltip}
            <Legend />
            <Line type="monotone" dataKey="value" stroke={chartOptions.color} strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            {tooltip}
            <Legend />
            <Area type="monotone" dataKey="value" stroke={chartOptions.color} fillOpacity={0.6} fill={chartOptions.color} />
          </AreaChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Pie
              data={dataItems}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={Math.min(150, (ref as React.RefObject<HTMLDivElement>)?.current?.offsetWidth / 3.5 || 150) }
              dataKey="value"
            >
              {dataItems.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
              ))}
            </Pie>
            {tooltip}
            <Legend />
          </PieChart>
        );
      case ChartType.RADAR:
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataItems}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
            {tooltip}
            <Radar name={chartOptions.title} dataKey="value" stroke={chartOptions.color} fill={chartOptions.color} fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        );
      case ChartType.RADIAL_BAR:
        const dataWithFill = dataItems.map((item, index) => ({
            ...item,
            fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
        }));
        return (
            <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="10%" 
                outerRadius="90%" 
                barSize={15} 
                data={dataWithFill}
            >
                <RadialBar {...{minAngle: 15, background: true, dataKey: 'value' } as any} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                {tooltip}
            </RadialBarChart>
        );
      case ChartType.TREEMAP:
        return (
          <Treemap
            data={dataItems.map(item => ({...item, children: []}))}
            dataKey="value"
            aspectRatio={16 / 9}
            stroke="#fff"
            content={<CustomizedTreemapContent />}
          >
            {tooltip}
          </Treemap>
        );
      default:
        return <p>Seleccione un tipo de gráfico</p>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">{chartOptions.title}</h2>
        <div ref={ref} className="flex-grow w-full min-h-[400px] lg:h-auto bg-white rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
      
      {(insights || isGeneratingInsights) && (
        <div className="mt-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg" role="alert">
            <div className="flex">
              <div className="py-1"><LightbulbIcon className="w-6 h-6 mr-4" /></div>
              <div>
                <p className="font-bold mb-1">Análisis IA</p>
                {isGeneratingInsights && <p className="text-sm">Analizando datos...</p>}
                {insights && <p className="text-sm">{insights}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleExportPNG}
          className="flex items-center justify-center px-6 py-2.5 bg-green-500 text-white font-medium rounded-md shadow-sm hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <DownloadIcon className="mr-2"/> Exportar PNG
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center px-6 py-2.5 bg-red-500 text-white font-medium rounded-md shadow-sm hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <DownloadIcon className="mr-2"/> Exportar PDF
        </button>
         <button
          onClick={onGenerateInsights}
          disabled={isGeneratingInsights || dataItems.length === 0}
          className="flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isGeneratingInsights ? <LoaderIcon className="animate-spin mr-2" /> : <SparklesIcon className="mr-2"/>}
          {isGeneratingInsights ? 'Analizando...' : 'Obtener Análisis IA'}
        </button>
      </div>
    </div>
  );
});

ChartDisplay.displayName = 'ChartDisplay';
