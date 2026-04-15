import { SystemData, ActivityEvent, SimulationParams, KPIData } from './types';

export const generateRevenueTrend = (base: number = 50000): number[] => {
  const data: number[] = [];
  let current = base;
  for (let i = 0; i < 12; i++) {
    current += (Math.random() - 0.4) * 5000;
    data.push(Math.max(20000, Math.round(current)));
  }
  return data;
};

export const generateExpenseTrend = (base: number = 35000): number[] => {
  const data: number[] = [];
  let current = base;
  for (let i = 0; i < 12; i++) {
    current += (Math.random() - 0.5) * 3000;
    data.push(Math.max(15000, Math.round(current)));
  }
  return data;
};

export const initialSystems: SystemData[] = [
  {
    id: 'Business',
    name: 'Business System',
    status: 'Stable',
    metrics: { primary: 125000, secondary: 8500, tertiary: 94 },
    trend: generateRevenueTrend(60000),
  },
  {
    id: 'Finance',
    name: 'Finance System',
    status: 'Risk',
    metrics: { primary: 450000, secondary: 320000, tertiary: 78 },
    trend: generateRevenueTrend(45000),
  },
  {
    id: 'Project',
    name: 'Project System',
    status: 'Stable',
    metrics: { primary: 47, secondary: 12, tertiary: 89 },
    trend: generateRevenueTrend(30000),
  },
  {
    id: 'Social',
    name: 'Social System',
    status: 'Critical',
    metrics: { primary: 15200, secondary: 2800, tertiary: 45 },
    trend: generateRevenueTrend(25000),
  },
];

export const activityMessages = [
  { type: 'success' as const, message: 'Revenue target achieved for Q3', system: 'Business' as const },
  { type: 'warning' as const, message: 'Expense threshold exceeded by 12%', system: 'Finance' as const },
  { type: 'info' as const, message: 'New project milestone completed', system: 'Project' as const },
  { type: 'error' as const, message: 'Engagement rate dropped below target', system: 'Social' as const },
  { type: 'success' as const, message: 'Customer retention improved to 94%', system: 'Business' as const },
  { type: 'info' as const, message: 'Monthly report generated', system: 'Finance' as const },
  { type: 'warning' as const, message: 'Task deadline approaching', system: 'Project' as const },
  { type: 'success' as const, message: 'Follower milestone reached: 15K', system: 'Social' as const },
];

export const generateActivity = (): ActivityEvent => {
  const template = activityMessages[Math.floor(Math.random() * activityMessages.length)];
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...template,
    time: new Date().toLocaleTimeString(),
  };
};

export const calculateKPIs = (params: SimulationParams): KPIData => {
  const baseGrowth = 50;
  const baseEfficiency = 60;
  const baseRisk = 30;

  const growth = Math.min(100, Math.max(0, 
    baseGrowth + 
    (params.budget - 50) * 0.3 + 
    (params.price - 50) * 0.2 + 
    (params.engagementRate - 50) * 0.4
  ));

  const efficiency = Math.min(100, Math.max(0,
    baseEfficiency +
    (params.budget - 50) * 0.2 -
    (params.workload - 50) * 0.3 +
    (params.engagementRate - 50) * 0.2
  ));

  const risk = Math.min(100, Math.max(0,
    baseRisk -
    (params.budget - 50) * 0.2 +
    (params.workload - 50) * 0.3 -
    (params.engagementRate - 50) * 0.2
  ));

  return { growth: Math.round(growth), efficiency: Math.round(efficiency), risk: Math.round(risk) };
};

export const generateInsight = (kpis: KPIData, params: SimulationParams): string => {
  if (kpis.risk > 70) {
    return '⚠️ High risk detected due to low engagement and high workload';
  }
  if (kpis.growth > 80 && kpis.efficiency > 70) {
    return '✅ Excellent performance! Stable growth with optimal parameters';
  }
  if (kpis.growth > 60 && kpis.risk < 40) {
    return '📈 Positive trend with manageable risk levels';
  }
  if (params.budget > 70 && kpis.efficiency < 50) {
    return '💰 High budget allocation but efficiency is below target';
  }
  if (params.workload > 70) {
    return '⚡ Workload is high - consider resource optimization';
  }
  if (params.engagementRate < 40) {
    return '📉 Engagement rate is low - focus on user retention strategies';
  }
  return '📊 System operating within normal parameters';
};

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
