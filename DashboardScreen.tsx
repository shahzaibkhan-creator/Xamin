import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { spacing, borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { KPICircle } from '../components/KPICircle';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import { Header } from '../components/Header';
import { GlobalInsightPanel } from '../components/GlobalInsightPanel';
import { TimeMachineToggle, TimeMode } from '../components/TimeMachineToggle';
import { ProjectionsPanel } from '../components/ProjectionsPanel';
import { BrutalTruthPanel } from '../components/BrutalTruthPanel';
import { months } from '../lib/mockData';

export const DashboardScreen: React.FC = () => {
  const { colors } = useAppContext();
  const { data, refreshData } = useDataContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const [timeMode, setTimeMode] = useState<TimeMode>('present');

  // Calculate real stats from user data only
  const stats = useMemo(() => {
    const business = data.business || [];
    const finance = data.finance || [];
    const project = data.project || [];
    const social = data.social || [];

    const totalRevenue = business.reduce((sum, e) => sum + e.saleAmount, 0);
    const totalIncome = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const completedTasks = project.filter(e => e.status === 'done').length;
    const totalTasks = project.length;
    const totalFollowers = social.reduce((sum, e) => sum + e.followersGained, 0);
    const totalEngagement = social.reduce((sum, e) => sum + e.likes + e.comments, 0);

    const hasData = business.length > 0 || finance.length > 0 || project.length > 0 || social.length > 0;

    return {
      totalRevenue,
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      completedTasks,
      totalTasks,
      totalFollowers,
      totalEngagement,
      hasData,
      businessCount: business.length,
      financeCount: finance.length,
      projectCount: project.length,
      socialCount: social.length,
    };
  }, [data]);

  // Calculate KPIs from real data only
  const kpis = useMemo(() => {
    if (!stats.hasData) {
      return { growth: 0, efficiency: 0, stability: 0 };
    }

    const taskCompletion = stats.totalTasks > 0 
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;
    
    const efficiency = stats.totalIncome > 0 
      ? Math.min(100, Math.max(0, Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)))
      : 0;
    
    const stability = Math.min(100, Math.max(0, 
      (stats.businessCount > 0 ? 25 : 0) +
      (stats.financeCount > 0 ? 25 : 0) +
      (stats.projectCount > 0 ? 25 : 0) +
      (stats.socialCount > 0 ? 25 : 0)
    ));

    return {
      growth: taskCompletion,
      efficiency,
      stability,
    };
  }, [stats]);

  // Generate chart data based on time mode
  const chartData = useMemo(() => {
    const business = data.business || [];
    const finance = data.finance || [];
    
    if (business.length === 0) {
      return { revenue: [0, 0, 0, 0, 0, 0], labels: months.slice(0, 6) };
    }

    const revenues = business.slice(0, 6).map(e => e.saleAmount);
    while (revenues.length < 6) revenues.push(0);

    if (timeMode === 'future') {
      // Project future values based on growth rate
      const avgGrowth = revenues.length > 1 
        ? (revenues[revenues.length - 1] - revenues[0]) / revenues.length 
        : revenues[0] * 0.1;
      
      const projected = revenues.map((v, i) => Math.round(v + avgGrowth * (i + 1) * 0.5));
      return { revenue: projected, labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'] };
    }

    if (timeMode === 'past') {
      // Show historical with slight decrease simulation
      const historical = revenues.map((v, i) => Math.round(v * (0.7 + (i * 0.05))));
      return { revenue: historical, labels: months.slice(0, 6) };
    }

    return { revenue: revenues, labels: months.slice(0, 6) };
  }, [data.business, timeMode]);

  const financialData = useMemo(() => {
    const finance = data.finance || [];
    if (finance.length === 0) {
      return [
        { label: 'Income', value: 0, color: colors.success },
        { label: 'Expense', value: 0, color: colors.error },
        { label: 'Profit', value: 0, color: colors.primary },
      ];
    }
    
    let income = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    let expense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    
    // Adjust based on time mode
    if (timeMode === 'future') {
      income = Math.round(income * 1.15);
      expense = Math.round(expense * 1.05);
    } else if (timeMode === 'past') {
      income = Math.round(income * 0.85);
      expense = Math.round(expense * 0.9);
    }
    
    return [
      { label: 'Income', value: income, color: colors.success },
      { label: 'Expense', value: expense, color: colors.error },
      { label: 'Profit', value: Math.max(0, income - expense), color: colors.primary },
    ];
  }, [data.finance, colors, timeMode]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Empty state component
  const EmptyState = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name="analytics-outline" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Data Yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Start adding data using the + button to see your analytics come to life!
      </Text>
      <View style={styles.emptyHints}>
        <View style={styles.hintRow}>
          <Ionicons name="business" size={16} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.textMuted }]}>Add business sales data</Text>
        </View>
        <View style={styles.hintRow}>
          <Ionicons name="wallet" size={16} color={colors.secondary} />
          <Text style={[styles.hintText, { color: colors.textMuted }]}>Track income & expenses</Text>
        </View>
        <View style={styles.hintRow}>
          <Ionicons name="clipboard" size={16} color={colors.tertiary} />
          <Text style={[styles.hintText, { color: colors.textMuted }]}>Manage project tasks</Text>
        </View>
        <View style={styles.hintRow}>
          <Ionicons name="people" size={16} color={colors.quaternary} />
          <Text style={[styles.hintText, { color: colors.textMuted }]}>Monitor social metrics</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Time Machine Toggle */}
        <TimeMachineToggle mode={timeMode} onModeChange={setTimeMode} />

        {/* Data Status Badge */}
        {stats.hasData && (
          <Animated.View entering={FadeIn} style={[styles.dataBadge, { backgroundColor: colors.success + '20' }]}>
            <View style={[styles.dataDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.dataText, { color: colors.success }]}>
              {timeMode === 'present' ? 'Live Data' : timeMode === 'future' ? 'Projected' : 'Historical'} • {stats.businessCount + stats.financeCount + stats.projectCount + stats.socialCount} entries
            </Text>
          </Animated.View>
        )}

        {!stats.hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Global Insight Panel - Cross-System Intelligence */}
            <GlobalInsightPanel />

            {/* Brutal Truth Panel */}
            <BrutalTruthPanel />

            {/* Stats Row */}
            <Animated.View entering={FadeIn.delay(100)} style={styles.statsRow}>
              <StatCard
                title="Total Revenue"
                value={timeMode === 'future' ? Math.round(stats.totalRevenue * 1.15) : timeMode === 'past' ? Math.round(stats.totalRevenue * 0.85) : stats.totalRevenue}
                prefix="$"
                icon="cash-outline"
                trend={stats.businessCount > 1 ? (timeMode === 'future' ? 15 : timeMode === 'past' ? -10 : 12) : undefined}
                delay={100}
                color={colors.primary}
              />
              <StatCard
                title="Followers"
                value={timeMode === 'future' ? Math.round(stats.totalFollowers * 1.2) : timeMode === 'past' ? Math.round(stats.totalFollowers * 0.8) : stats.totalFollowers}
                icon="people-outline"
                trend={stats.socialCount > 1 ? (timeMode === 'future' ? 20 : timeMode === 'past' ? -15 : 8) : undefined}
                delay={200}
                color={colors.secondary}
              />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(200)} style={styles.statsRow}>
              <StatCard
                title="Tasks Done"
                value={stats.completedTasks}
                icon="checkmark-done-outline"
                delay={300}
                color={colors.tertiary}
              />
              <StatCard
                title="Net Profit"
                value={Math.abs(timeMode === 'future' ? Math.round(stats.profit * 1.2) : timeMode === 'past' ? Math.round(stats.profit * 0.7) : stats.profit)}
                prefix="$"
                icon="trending-up-outline"
                trend={stats.profit >= 0 ? (timeMode === 'future' ? 20 : timeMode === 'past' ? -25 : 5) : -5}
                delay={400}
                color={colors.quaternary}
              />
            </Animated.View>

            {/* KPI Circles */}
            <GlassCard delay={300}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                {timeMode === 'future' ? 'Projected KPIs' : timeMode === 'past' ? 'Historical KPIs' : 'Current KPIs'}
              </Text>
              <View style={styles.kpiRow}>
                <KPICircle 
                  value={timeMode === 'future' ? Math.min(100, kpis.growth + 10) : timeMode === 'past' ? Math.max(0, kpis.growth - 15) : kpis.growth} 
                  label="Task Progress" 
                  size={90} 
                />
                <KPICircle 
                  value={timeMode === 'future' ? Math.min(100, kpis.efficiency + 8) : timeMode === 'past' ? Math.max(0, kpis.efficiency - 12) : kpis.efficiency} 
                  label="Efficiency" 
                  size={90} 
                />
                <KPICircle 
                  value={timeMode === 'future' ? Math.min(100, kpis.stability + 5) : timeMode === 'past' ? Math.max(0, kpis.stability - 10) : kpis.stability} 
                  label="Data Coverage" 
                  size={90} 
                />
              </View>
            </GlassCard>

            {/* Future Projections Panel - Only show in Future mode */}
            {timeMode === 'future' && (
              <GlassCard delay={350}>
                <ProjectionsPanel />
              </GlassCard>
            )}

            {/* Revenue Chart */}
            {stats.businessCount > 0 && (
              <GlassCard delay={400}>
                <LineChart
                  data={chartData.revenue}
                  labels={chartData.labels}
                  title={timeMode === 'future' ? 'Projected Sales' : timeMode === 'past' ? 'Historical Sales' : 'Sales Trend'}
                  height={220}
                  color={colors.primary}
                />
              </GlassCard>
            )}

            {/* Financial Summary */}
            {stats.financeCount > 0 && (
              <GlassCard delay={500}>
                <BarChart
                  data={financialData}
                  title={timeMode === 'future' ? 'Projected Financials' : timeMode === 'past' ? 'Historical Financials' : 'Financial Summary'}
                  height={220}
                />
              </GlassCard>
            )}

            {/* Quick Stats Summary */}
            <GlassCard delay={600}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Data Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={[styles.summaryItem, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{stats.businessCount}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Sales</Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="wallet" size={20} color={colors.secondary} />
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{stats.financeCount}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Transactions</Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="clipboard" size={20} color={colors.tertiary} />
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{stats.totalTasks}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Tasks</Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="heart" size={20} color={colors.quaternary} />
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{stats.totalEngagement}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Engagement</Text>
                </View>
              </View>
            </GlassCard>
          </>
        )}

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
  dataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  dataDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dataText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
  },
  emptyState: {
    padding: 32,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyHints: {
    alignSelf: 'stretch',
    gap: 12,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  hintText: {
    fontSize: 13,
  },
  bottomPadding: {
    height: 100,
  },
});
