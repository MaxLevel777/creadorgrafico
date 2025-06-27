export interface DataItem {
  id: string;
  name: string;
  value: number;
  [key: string]: any;
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  AREA = 'area',
  RADAR = 'radar',
  RADIAL_BAR = 'radialBar',
  TREEMAP = 'treemap',
}

export interface ChartOptions {
  title: string;
  type: ChartType;
  color: string;
}
