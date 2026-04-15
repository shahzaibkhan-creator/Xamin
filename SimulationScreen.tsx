import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';\nimport Animated, { FadeIn } from 'react-native-reanimated';
import { spacing, borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { GlassCard } from '../components/GlassCard';
import { Slider } from '../components/Slider';
import { KPICircle } from '../components/KPICircle';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import { Header } from '../components/Header';
import { DecisionSimulator } from '../components/DecisionSimulator';
import { BrutalTruthPanel } from '../components/BrutalTruthPanel';
import { SimulationParams } from '../lib/types';
import { months } from '../lib/mockData';

export const SimulationScreen: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();
  const [params, setParams] = useState<SimulationParams>({
    budget: 50,
    price: 50,
    workload: 50,
    engagementRate: 50,
  });

  // Get base values from real data
  const baseValues = useMemo(() => {
    const business = data.business || [];
    const finance = data.finance || [];
    
    const baseRevenue = business.reduce((sum, e) => sum + e.saleAmount, 0);
    const baseIncome = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const baseExpense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    
    return {
      revenue: baseRevenue,
      income: baseIncome,
      expense: baseExpense,
      hasData: business.length > 0 || finance.length > 0,
    };
  }, [data]);

  // Calculate simulated KPIs based on sliders
  const kpis = useMemo(() => {
    const baseGrowth = baseValues.hasData ? 50 : 0;
    const baseEfficiency = baseValues.hasData ? 50 : 0;
    const baseRisk = baseValues.hasData ? 30 : 50;

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

    return { 
      growth: Math.round(growth), 
      efficiency: Math.round(efficiency), 
      risk: Math.round(risk) 
    };
  }, [params, baseValues]);

  // Generate insight based on simulation
  const insight = useMemo(() => {
    if (!baseValues.hasData) {
      return '📊 Add data first to see meaningful simulation results. The simulation will use your real data as a baseline.';
    }
    if (kpis.risk > 70) {
      return '⚠️ High risk detected due to low engagement and high workload. Consider rebalancing resources.';
    }
    if (kpis.growth > 80 && kpis.efficiency > 70) {
      return '✅ Excellent performance! Stable growth with optimal parameters. This configuration is sustainable.';
    }
    if (kpis.growth > 60 && kpis.risk < 40) {
      return '📈 Positive trend with manageable risk levels. Good balance between growth and stability.';
    }
    if (params.budget > 70 && kpis.efficiency < 50) {
      return '💰 High budget allocation but efficiency is below target. Consider optimizing spend allocation.';
    }
    if (params.workload > 70) {
      return '⚡ Workload is high - consider resource optimization or hiring to prevent burnout.';
    }
    if (params.engagementRate < 40) {
      return '📉 Engagement rate is low - focus on user retention strategies and content quality.';
    }
    return '📊 System operating within normal parameters. Fine-tune sliders to explore different scenarios.';
  }, [kpis, params, baseValues]);

  // Generate simulated chart data
  const revenueData = useMemo(() => {
    const base = baseValues.revenue > 0 ? baseValues.revenue / 12 : 1000;
    return Array.from({ length: 12 }, (_, i) => {
      const multiplier = 1 + (params.budget / 100) + (params.price / 200) + (params.engagementRate / 300);
      const trend = (i / 12) * multiplier;
      return Math.round(base * (1 + trend) * (0.8 + Math.random() * 0.4));
    });
  }, [params, baseValues]);

  const profitData = useMemo(() => {
    const baseIncome = baseValues.income > 0 ? baseValues.income : params.price * 100;
    const baseExpense = baseValues.expense > 0 ? baseValues.expense : params.workload * 60;
    
    const simulatedIncome = baseIncome * (1 + (params.price - 50) / 100);
    const simulatedExpense = baseExpense * (1 + (params.workload - 50) / 100);
    const profit = simulatedIncome - simulatedExpense;
    
    return [
      { label: 'Revenue', value: Math.round(simulatedIncome), color: colors.success },
      { label: 'Expense', value: Math.round(simulatedExpense), color: colors.error },
      { label: 'Profit', value: Math.max(0, Math.round(profit)), color: colors.primary },
    ];
  }, [params, baseValues, colors]);

  const getStatusColor = () => {
    if (kpis.risk > 60) return colors.error;
    if (kpis.risk > 40) return colors.warning;
    return colors.success;
  };

  const getStatusText = () => {
    if (kpis.risk > 60) return 'High Risk';
    if (kpis.risk > 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  const profitChange = useMemo(() => {
    if (!baseValues.hasData) return 0;
    const baseProfit = baseValues.income - baseValues.expense;
    const simIncome = baseValues.income * (1 + (params.price - 50) / 100);
    const simExpense = baseValues.expense * (1 + (params.workload - 50) / 100);
    const simProfit = simIncome - simExpense;
    
    if (baseProfit === 0) return simProfit > 0 ? 100 : 0;
    return Math.round(((simProfit - baseProfit) / Math.abs(baseProfit)) * 100);
  }, [params, baseValues]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Simulation Mode</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {baseValues.hasData 
            ? 'Adjust parameters to simulate impact on your data'
            : 'Add data first to see realistic simulations'
          }
        </Text>

        {/* Decision Simulator - Quick Action Buttons */}
        <GlassCard delay={50}>
          <DecisionSimulator />
        </GlassCard>

        {/* Sliders */}
        <GlassCard delay={100}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Fine-Tune Parameters</Text>
          <Slider
            label="Budget Allocation"
            value={params.budget}
            onChange={(v) => setParams(p => ({ ...p, budget: v }))}
            color={colors.primary}
          />
          <Slider
            label="Price Level"
            value={params.price}
            onChange={(v) => setParams(p => ({ ...p, price: v }))}
            color={colors.secondary}
          />
          <Slider
            label="Workload Intensity"
            value={params.workload}
            onChange={(v) => setParams(p => ({ ...p, workload: v }))}
            color={colors.tertiary}
          />
          <Slider
            label="Engagement Rate"
            value={params.engagementRate}
            onChange={(v) => setParams(p => ({ ...p, engagementRate: v }))}
            color={colors.quaternary}
          />
        </GlassCard>

        {/* Result Panel */}
        <GlassCard delay={200}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Simulation Results</Text>
          <View style={styles.resultGrid}>
            <View style={[styles.resultItem, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Profit Change</Text>
              <Text style={[
                styles.resultValue,
                { color: profitChange >= 0 ? colors.success : colors.error }
              ]}>
                {baseValues.hasData ? `${profitChange >= 0 ? '+' : ''}${profitChange}%` : '--'}
              </Text>
            </View>
            <View style={[styles.resultItem, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Growth Level</Text>
              <Text style={[styles.resultValue, { color: colors.primary }]}>
                {kpis.growth}%
              </Text>
            </View>
            <View style={[styles.resultItem, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Risk Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* KPIs */}
        <GlassCard delay={300}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Impact Analysis</Text>
          <View style={styles.kpiRow}>
            <KPICircle value={kpis.growth} label="Growth" size={90} />
            <KPICircle value={kpis.efficiency} label="Efficiency" size={90} />
            <KPICircle value={100 - kpis.risk} label="Stability" size={90} />
          </View>
        </GlassCard>

        {/* Insight Panel */}
        <GlassCard delay={400}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb" size={24} color={colors.warning} />
            <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>AI Insight</Text>
          </View>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>{insight}</Text>
        </GlassCard>

        {/* Cause-Effect Visualization */}
        <GlassCard delay={450}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Cause & Effect</Text>
          <View style={styles.causeEffectGrid}>
            <View style={[styles.causeEffectItem, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.ceLabel, { color: colors.textMuted }]}>If Budget ↑</Text>
              <Text style={[styles.ceEffect, { color: colors.success }]}>Growth ↑ Risk ↓</Text>
            </View>
            <View style={[styles.causeEffectItem, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.ceLabel, { color: colors.textMuted }]}>If Price ↑</Text>
              <Text style={[styles.ceEffect, { color: colors.warning }]}>Revenue ↑ Volume ↓</Text>
            </View>
            <View style={[styles.causeEffectItem, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.ceLabel, { color: colors.textMuted }]}>If Workload ↑</Text>
              <Text style={[styles.ceEffect, { color: colors.error }]}>Risk ↑ Efficiency ↓</Text>
            </View>
            <View style={[styles.causeEffectItem, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.ceLabel, { color: colors.textMuted }]}>If Engagement ↑</Text>
              <Text style={[styles.ceEffect, { color: colors.success }]}>Growth ↑ Revenue ↑</Text>
            </View>
          </View>
        </GlassCard>

        {/* Charts */}
        <GlassCard delay={500}>
          <LineChart
            data={revenueData}
            labels={months}
            title="Projected Revenue"
            height={200}
            color={colors.primary}
          />
        </GlassCard>

        <GlassCard delay={600}>
          <BarChart
            data={profitData}
            title="Financial Projection"
            height={200}
          />
        </GlassCard>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  resultItem: {
    flex: 1,
    minWidth: 100,
    borderRadius: borderRadius.md,
    padding: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightText: {
    fontSize: 15,
    lineHeight: 24,
  },
  causeEffectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  causeEffectItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  ceLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  ceEffect: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
