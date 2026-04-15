import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { spacing, borderRadius, getShadows } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { GlassCard } from '../components/GlassCard';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import { KPICircle } from '../components/KPICircle';
import { Header } from '../components/Header';
import { months } from '../lib/mockData';

type ReportPeriod = 'weekly' | 'monthly';

export const ReportsScreen: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();
  const shadows = getShadows(colors);
  const [period, setPeriod] = useState<ReportPeriod>('weekly');

  // Calculate stats from real data
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

    const hasData = business.length > 0 || finance.length > 0 || project.length > 0 || social.length > 0;

    return {
      totalRevenue,
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      completedTasks,
      totalTasks,
      totalFollowers,
      hasData,
      taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      efficiency: totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0,
    };
  }, [data]);

  // Generate chart data from real entries
  const chartData = useMemo(() => {
    const business = data.business || [];
    const revenueData = business.length > 0 
      ? business.slice(0, 7).map(e => e.saleAmount)
      : [0, 0, 0, 0, 0, 0, 0];
    
    while (revenueData.length < 7) revenueData.push(0);

    return {
      revenue: revenueData,
      labels: period === 'weekly' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : months.slice(0, 7),
    };
  }, [data.business, period]);

  const summaryItems = useMemo(() => [
    { 
      label: 'Total Revenue', 
      value: stats.totalRevenue > 0 ? `$${(stats.totalRevenue / 1000).toFixed(1)}K` : '$0', 
      icon: 'cash-outline' as const, 
      color: colors.primary 
    },
    { 
      label: 'New Followers', 
      value: stats.totalFollowers.toString(), 
      icon: 'people-outline' as const, 
      color: colors.secondary 
    },
    { 
      label: 'Tasks Completed', 
      value: stats.completedTasks.toString(), 
      icon: 'checkmark-done-outline' as const, 
      color: colors.tertiary 
    },
    { 
      label: 'Net Profit', 
      value: stats.profit !== 0 ? `$${Math.abs(stats.profit).toLocaleString()}` : '$0', 
      icon: 'trending-up-outline' as const, 
      color: colors.quaternary 
    },
  ], [stats, colors]);

  const comparisonData = useMemo(() => {
    const finance = data.finance || [];
    const income = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    
    return [
      { label: 'Income', value: income, color: colors.success },
      { label: 'Expense', value: expense, color: colors.error },
    ];
  }, [data.finance, colors]);

  const performanceData = useMemo(() => {
    const business = data.business || [];
    const project = data.project || [];
    const social = data.social || [];
    
    return [
      { label: 'Sales', value: business.reduce((sum, e) => sum + e.saleAmount, 0) },
      { label: 'Tasks', value: project.length * 100 },
      { label: 'Social', value: social.reduce((sum, e) => sum + e.likes + e.comments, 0) },
    ];
  }, [data]);

  // Empty state
  const EmptyState = () => (
    <Animated.View 
      entering={FadeInDown.delay(200)}
      style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name="document-text-outline" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Reports Yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Start adding data to generate insightful reports. Use the + button to add your first entries.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Reports</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {stats.hasData ? 'Performance analysis from your data' : 'Add data to generate reports'}
        </Text>

        {/* Period Toggle */}
        <GlassCard delay={100}>
          <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceLight }]}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                period === 'weekly' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setPeriod('weekly')}
            >
              <Text style={[
                styles.toggleText,
                { color: colors.textSecondary },
                period === 'weekly' && { color: colors.textPrimary },
              ]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                period === 'monthly' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setPeriod('monthly')}
            >
              <Text style={[
                styles.toggleText,
                { color: colors.textSecondary },
                period === 'monthly' && { color: colors.textPrimary },
              ]}>Monthly</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {!stats.hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Summary Cards */}
            <Animated.View entering={FadeIn.delay(200)} style={styles.summaryGrid}>
              {summaryItems.map((item, index) => (
                <Animated.View
                  key={item.label}
                  entering={FadeInDown.delay(200 + index * 100).springify()}
                  style={[
                    styles.summaryCard, 
                    shadows.card,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder }
                  ]}
                >
                  <View style={[styles.summaryIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{item.value}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{item.label}</Text>
                </Animated.View>
              ))}
            </Animated.View>

            {/* KPIs */}
            <GlassCard delay={300}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Performance Metrics
              </Text>
              <View style={styles.kpiRow}>
                <KPICircle value={stats.taskCompletion} label="Task Rate" size={90} />
                <KPICircle value={stats.efficiency} label="Efficiency" size={90} />
                <KPICircle 
                  value={Math.min(100, Math.round(((data.business?.length || 0) + (data.finance?.length || 0) + (data.project?.length || 0) + (data.social?.length || 0)) / 0.4))} 
                  label="Activity" 
                  size={90} 
                />
              </View>
            </GlassCard>

            {/* Revenue Chart */}
            {(data.business?.length || 0) > 0 && (
              <GlassCard delay={400}>
                <LineChart
                  data={chartData.revenue}
                  labels={chartData.labels}
                  title="Revenue Trend"
                  height={200}
                  color={colors.primary}
                />
              </GlassCard>
            )}

            {/* Comparison */}
            {(data.finance?.length || 0) > 0 && (
              <GlassCard delay={500}>
                <BarChart
                  data={comparisonData}
                  title="Income vs Expense"
                  height={180}
                />
              </GlassCard>
            )}

            {/* Performance Breakdown */}
            <GlassCard delay={600}>
              <BarChart
                data={performanceData}
                title="Performance by Category"
                height={200}
              />
            </GlassCard>

            {/* Export Options */}
            <GlassCard delay={700}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Export Report</Text>
              <View style={styles.exportRow}>
                <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                  <Text style={[styles.exportText, { color: colors.textSecondary }]}>PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="grid" size={24} color={colors.secondary} />
                  <Text style={[styles.exportText, { color: colors.textSecondary }]}>Excel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="mail" size={24} color={colors.tertiary} />
                  <Text style={[styles.exportText, { color: colors.textSecondary }]}>Email</Text>
                </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryCard: {
    width: '47%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.md,
    width: 80,
  },
  exportText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 100,
  },
});
