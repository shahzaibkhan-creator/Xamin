import { AppData } from './dataStore';

export interface GlobalInsight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  systems: string[];
  priority: number;
}

export interface Projection {
  metric: string;
  currentValue: number;
  projectedValue: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

export interface BrutalTruth {
  message: string;
  severity: 'positive' | 'neutral' | 'negative';
  icon: string;
}

// Calculate growth rate from array of values
const calculateGrowthRate = (values: number[]): number => {
  if (values.length < 2) return 0;
  const first = values[0] || 1;
  const last = values[values.length - 1] || 0;
  return ((last - first) / Math.abs(first)) * 100;
};

// Calculate average
const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

// Calculate trend direction
const getTrend = (values: number[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable';
  const growth = calculateGrowthRate(values);
  if (growth > 5) return 'up';
  if (growth < -5) return 'down';
  return 'stable';
};

// Generate cross-system insights
export const generateGlobalInsights = (data: AppData): GlobalInsight[] => {
  const insights: GlobalInsight[] = [];
  
  const business = data.business || [];
  const finance = data.finance || [];
  const project = data.project || [];
  const social = data.social || [];
  
  // Calculate metrics
  const totalRevenue = business.reduce((sum, e) => sum + e.saleAmount, 0);
  const totalIncome = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;
  const completedTasks = project.filter(e => e.status === 'done').length;
  const pendingTasks = project.filter(e => e.status === 'pending').length;
  const totalTasks = project.length;
  const totalFollowers = social.reduce((sum, e) => sum + e.followersGained, 0);
  const totalEngagement = social.reduce((sum, e) => sum + e.likes + e.comments, 0);
  
  // Revenue trends
  const revenueTrend = business.slice(0, 10).map(e => e.saleAmount);
  const expenseTrend = finance.filter(e => e.type === 'expense').slice(0, 10).map(e => e.amount);
  
  // Cross-system analysis
  
  // 1. Sales vs Profit analysis
  if (totalRevenue > 0 && profit < totalRevenue * 0.1) {
    insights.push({
      id: 'revenue-profit-gap',
      type: 'warning',
      title: 'Profit Margin Alert',
      message: 'Sales increased but profit margin is low → expenses are eating into revenue',
      systems: ['Business', 'Finance'],
      priority: 1,
    });
  }
  
  // 2. Engagement vs Revenue
  if (totalEngagement > 100 && totalRevenue < totalEngagement * 10) {
    insights.push({
      id: 'engagement-revenue-gap',
      type: 'warning',
      title: 'Low Conversion Rate',
      message: 'High engagement but low revenue → conversion funnel needs optimization',
      systems: ['Social', 'Business'],
      priority: 2,
    });
  }
  
  // 3. Project delays impact
  if (pendingTasks > completedTasks && totalRevenue > 0) {
    insights.push({
      id: 'project-delays',
      type: 'danger',
      title: 'Project Bottleneck',
      message: 'Project delays may be impacting business performance → too many pending tasks',
      systems: ['Project', 'Business'],
      priority: 1,
    });
  }
  
  // 4. Expense growth vs Revenue
  const revenueGrowth = calculateGrowthRate(revenueTrend);
  const expenseGrowth = calculateGrowthRate(expenseTrend);
  if (expenseGrowth > revenueGrowth && expenseGrowth > 10) {
    insights.push({
      id: 'expense-outpacing',
      type: 'danger',
      title: 'Risk Increasing',
      message: `Expenses growing ${Math.round(expenseGrowth - revenueGrowth)}% faster than revenue → financial risk increasing`,
      systems: ['Finance', 'Business'],
      priority: 1,
    });
  }
  
  // 5. Social momentum
  if (totalFollowers > 50 && totalEngagement > totalFollowers * 2) {
    insights.push({
      id: 'social-momentum',
      type: 'success',
      title: 'Strong Social Momentum',
      message: 'High engagement rate indicates strong audience connection → leverage for sales',
      systems: ['Social'],
      priority: 3,
    });
  }
  
  // 6. Task efficiency
  const avgTimePerTask = project.length > 0 
    ? project.reduce((sum, e) => sum + e.timeSpent, 0) / project.length 
    : 0;
  if (avgTimePerTask > 8 && completedTasks < totalTasks * 0.5) {
    insights.push({
      id: 'task-inefficiency',
      type: 'warning',
      title: 'Task Efficiency Issue',
      message: 'High time spent per task with low completion rate → workflow needs optimization',
      systems: ['Project'],
      priority: 2,
    });
  }
  
  // 7. Positive profit trend
  if (profit > 0 && totalIncome > totalExpense * 1.3) {
    insights.push({
      id: 'healthy-profit',
      type: 'success',
      title: 'Healthy Profit Margin',
      message: 'Income exceeds expenses by 30%+ → financial health is strong',
      systems: ['Finance'],
      priority: 3,
    });
  }
  
  // 8. Growth opportunity
  if (completedTasks > 5 && totalRevenue > 1000 && totalFollowers > 100) {
    insights.push({
      id: 'growth-ready',
      type: 'success',
      title: 'Ready for Scale',
      message: 'All systems showing positive activity → consider scaling operations',
      systems: ['Business', 'Finance', 'Project', 'Social'],
      priority: 2,
    });
  }
  
  // 9. No data warning
  if (business.length === 0 && finance.length === 0 && project.length === 0 && social.length === 0) {
    insights.push({
      id: 'no-data',
      type: 'info',
      title: 'Getting Started',
      message: 'Add data to unlock cross-system intelligence and insights',
      systems: [],
      priority: 0,
    });
  }
  
  // Sort by priority
  return insights.sort((a, b) => a.priority - b.priority);
};

// Generate future projections
export const generateProjections = (data: AppData): Projection[] => {
  const projections: Projection[] = [];
  
  const business = data.business || [];
  const finance = data.finance || [];
  const project = data.project || [];
  const social = data.social || [];
  
  // Revenue projection
  if (business.length >= 3) {
    const revenues = business.slice(0, 10).map(e => e.saleAmount);
    const avgRevenue = calculateAverage(revenues);
    const growthRate = calculateGrowthRate(revenues) / 100;
    const projected30Days = avgRevenue * 30 * (1 + growthRate);
    
    projections.push({
      metric: 'Revenue (30 days)',
      currentValue: revenues.reduce((a, b) => a + b, 0),
      projectedValue: Math.round(projected30Days),
      timeframe: '30 days',
      trend: getTrend(revenues),
      confidence: Math.min(90, 50 + business.length * 5),
    });
  }
  
  // Profit projection
  if (finance.length >= 3) {
    const incomes = finance.filter(e => e.type === 'income').map(e => e.amount);
    const expenses = finance.filter(e => e.type === 'expense').map(e => e.amount);
    const avgIncome = calculateAverage(incomes);
    const avgExpense = calculateAverage(expenses);
    const currentProfit = incomes.reduce((a, b) => a + b, 0) - expenses.reduce((a, b) => a + b, 0);
    const projectedProfit = (avgIncome - avgExpense) * 30;
    
    projections.push({
      metric: 'Profit (30 days)',
      currentValue: currentProfit,
      projectedValue: Math.round(projectedProfit),
      timeframe: '30 days',
      trend: projectedProfit > currentProfit ? 'up' : projectedProfit < currentProfit ? 'down' : 'stable',
      confidence: Math.min(85, 45 + finance.length * 4),
    });
  }
  
  // Task completion projection
  if (project.length >= 2) {
    const completionRate = project.filter(e => e.status === 'done').length / project.length;
    const pendingTasks = project.filter(e => e.status !== 'done').length;
    const avgTimePerTask = project.reduce((sum, e) => sum + e.timeSpent, 0) / project.length;
    const daysToComplete = pendingTasks > 0 ? Math.ceil((pendingTasks * avgTimePerTask) / 8) : 0;
    
    projections.push({
      metric: 'Tasks Completion',
      currentValue: Math.round(completionRate * 100),
      projectedValue: daysToComplete,
      timeframe: `${daysToComplete} days to clear backlog`,
      trend: completionRate > 0.5 ? 'up' : 'down',
      confidence: Math.min(80, 40 + project.length * 5),
    });
  }
  
  // Follower growth projection
  if (social.length >= 3) {
    const followers = social.map(e => e.followersGained);
    const avgGrowth = calculateAverage(followers);
    const currentTotal = followers.reduce((a, b) => a + b, 0);
    const projected30Days = currentTotal + (avgGrowth * 30);
    
    projections.push({
      metric: 'Followers (30 days)',
      currentValue: currentTotal,
      projectedValue: Math.round(projected30Days),
      timeframe: '30 days',
      trend: getTrend(followers),
      confidence: Math.min(75, 35 + social.length * 5),
    });
  }
  
  // Engagement projection
  if (social.length >= 3) {
    const engagements = social.map(e => e.likes + e.comments);
    const avgEngagement = calculateAverage(engagements);
    const growthRate = calculateGrowthRate(engagements);
    
    projections.push({
      metric: 'Engagement Growth',
      currentValue: Math.round(growthRate),
      projectedValue: Math.round(growthRate * 1.1),
      timeframe: 'Next period',
      trend: getTrend(engagements),
      confidence: Math.min(70, 30 + social.length * 4),
    });
  }
  
  return projections;
};

// Generate brutal truth feedback
export const generateBrutalTruth = (data: AppData): BrutalTruth => {
  const business = data.business || [];
  const finance = data.finance || [];
  const project = data.project || [];
  const social = data.social || [];
  
  const totalRevenue = business.reduce((sum, e) => sum + e.saleAmount, 0);
  const totalIncome = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;
  const completedTasks = project.filter(e => e.status === 'done').length;
  const totalTasks = project.length;
  const totalEngagement = social.reduce((sum, e) => sum + e.likes + e.comments, 0);
  const totalFollowers = social.reduce((sum, e) => sum + e.followersGained, 0);
  
  const hasData = business.length > 0 || finance.length > 0 || project.length > 0 || social.length > 0;
  
  if (!hasData) {
    return {
      message: "No data to analyze. Start adding entries to get real insights.",
      severity: 'neutral',
      icon: 'help-circle',
    };
  }
  
  // Brutal truth conditions
  
  // Growing but inefficient
  if (totalRevenue > 1000 && profit < totalRevenue * 0.1) {
    return {
      message: "You are growing but inefficiently. Revenue looks good but profit margins are terrible.",
      severity: 'negative',
      icon: 'warning',
    };
  }
  
  // High activity, low results
  if (totalTasks > 10 && completedTasks < totalTasks * 0.3) {
    return {
      message: "High activity but low results. Lots of tasks started, few finished. Focus is scattered.",
      severity: 'negative',
      icon: 'alert-circle',
    };
  }
  
  // Revenue not matching effort
  if (totalEngagement > 500 && totalRevenue < 500) {
    return {
      message: "Revenue is not matching effort. Great engagement but poor monetization.",
      severity: 'negative',
      icon: 'trending-down',
    };
  }
  
  // Stable but not optimized
  if (profit > 0 && profit < totalIncome * 0.2 && completedTasks > 5) {
    return {
      message: "System is stable but not optimized. Things work, but there's significant room for improvement.",
      severity: 'neutral',
      icon: 'pause-circle',
    };
  }
  
  // Burning cash
  if (totalExpense > totalIncome * 1.5) {
    return {
      message: "You're burning cash faster than making it. This is unsustainable.",
      severity: 'negative',
      icon: 'flame',
    };
  }
  
  // Social vanity metrics
  if (totalFollowers > 100 && totalRevenue < 100) {
    return {
      message: "Followers don't pay bills. Great social presence but zero business impact.",
      severity: 'negative',
      icon: 'people',
    };
  }
  
  // Actually doing well
  if (profit > totalIncome * 0.3 && completedTasks > totalTasks * 0.7) {
    return {
      message: "You're actually doing well. Strong execution with healthy margins. Keep it up.",
      severity: 'positive',
      icon: 'checkmark-circle',
    };
  }
  
  // Default
  return {
    message: "System is operational. Not great, not terrible. Room for improvement exists.",
    severity: 'neutral',
    icon: 'analytics',
  };
};

// Calculate decision impact
export interface DecisionImpact {
  profitChange: number;
  revenueChange: number;
  riskChange: number;
  efficiencyChange: number;
  description: string;
}

export const calculateDecisionImpact = (
  decision: 'increase_price' | 'reduce_expenses' | 'increase_marketing' | 'adjust_workload',
  percentage: number,
  data: AppData
): DecisionImpact => {
  const business = data.business || [];
  const finance = data.finance || [];
  
  const totalRevenue = business.reduce((sum, e) => sum + e.saleAmount, 0);
  const totalIncome = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  
  switch (decision) {
    case 'increase_price':
      // Increasing price: more revenue per sale, but might reduce volume
      const priceRevenueImpact = (percentage * 0.8); // 80% of price increase translates to revenue
      const volumeReduction = (percentage * 0.2); // 20% volume reduction due to higher prices
      return {
        profitChange: priceRevenueImpact - volumeReduction,
        revenueChange: priceRevenueImpact - volumeReduction,
        riskChange: percentage * 0.3, // Higher prices = some risk
        efficiencyChange: percentage * 0.5,
        description: `Increasing prices by ${percentage}% may boost profit by ${Math.round(priceRevenueImpact - volumeReduction)}% but could reduce sales volume`,
      };
      
    case 'reduce_expenses':
      // Reducing expenses: direct profit increase
      const expenseRatio = totalExpense / (totalIncome || 1);
      const profitBoost = percentage * expenseRatio * 0.9;
      return {
        profitChange: profitBoost,
        revenueChange: 0,
        riskChange: -percentage * 0.4, // Lower expenses = lower risk
        efficiencyChange: percentage * 0.8,
        description: `Cutting expenses by ${percentage}% could improve profit margins by ${Math.round(profitBoost)}%`,
      };
      
    case 'increase_marketing':
      // More marketing: more engagement, potential revenue boost
      return {
        profitChange: percentage * 0.3, // Delayed profit impact
        revenueChange: percentage * 0.6, // Good revenue potential
        riskChange: percentage * 0.2, // Some risk with spending
        efficiencyChange: -percentage * 0.1, // Short-term efficiency drop
        description: `Boosting marketing by ${percentage}% could increase revenue by ${Math.round(percentage * 0.6)}% over time`,
      };
      
    case 'adjust_workload':
      // Adjusting workload: efficiency gains
      return {
        profitChange: percentage * 0.2,
        revenueChange: percentage * 0.1,
        riskChange: -percentage * 0.3,
        efficiencyChange: percentage * 0.7,
        description: `Optimizing workload by ${percentage}% could improve efficiency by ${Math.round(percentage * 0.7)}%`,
      };
      
    default:
      return {
        profitChange: 0,
        revenueChange: 0,
        riskChange: 0,
        efficiencyChange: 0,
        description: 'No impact calculated',
      };
  }
};
