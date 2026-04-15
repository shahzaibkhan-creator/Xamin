export type SystemType = 'Business' | 'Finance' | 'Project' | 'Social';

export type SystemStatus = 'Stable' | 'Risk' | 'Critical';

export interface SystemData {
  id: SystemType;
  name: string;
  status: SystemStatus;
  metrics: {
    primary: number;
    secondary: number;
    tertiary: number;
  };
  trend: number[];
}

export interface KPIData {
  growth: number;
  efficiency: number;
  risk: number;
}

export interface SimulationParams {
  budget: number;
  price: number;
  workload: number;
  engagementRate: number;
}

export interface ActivityEvent {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  time: string;
  system: SystemType;
}

export interface ChartDataPoint {
  x: number;
  y: number;
}
