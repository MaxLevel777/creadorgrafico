
import { ChartType, DataItem } from './types';

export const DEFAULT_CHART_COLOR = '#3b82f6'; // Tailwind's blue-500

export const CHART_TYPES = [
  { value: ChartType.BAR, label: 'Gráfico de Barras' },
  { value: ChartType.LINE, label: 'Gráfico de Líneas' },
  { value: ChartType.PIE, label: 'Gráfico Circular' },
  { value: ChartType.AREA, label: 'Gráfico de Área' },
  { value: ChartType.RADAR, label: 'Gráfico de Radar' },
  { value: ChartType.RADIAL_BAR, label: 'Gráfico Radial' },
  { value: ChartType.TREEMAP, label: 'Mapa de Árbol' },
];

export const INITIAL_DATA_ITEMS: DataItem[] = [
  { id: '1', name: 'Ene', value: 65 },
  { id: '2', name: 'Feb', value: 59 },
  { id: '3', name: 'Mar', value: 80 },
  { id: '4', name: 'Abr', value: 81 },
  { id: '5', name: 'May', value: 56 },
  { id: '6', name: 'Jun', value: 55 },
];

export const PIE_CHART_COLORS = [
  '#3b82f6', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#14b8a6', '#6366f1', '#ec4899',
  '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'
]; // A set of distinct colors for pie chart slices
