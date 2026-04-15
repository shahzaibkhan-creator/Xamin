import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing, borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { GlassCard } from '../components/GlassCard';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import { KPICircle } from '../components/KPICircle';
import { ProgressBar } from '../components/ProgressBar';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { months } from '../lib/mockData';
import { SystemType } from '../lib/types';

type RouteParams = {
  SystemDetail: { systemId: string };
};

export const SystemDetailScreen: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();
  const route = useRoute<RouteProp<RouteParams, 'SystemDetail'>>();
  const systemId = route.params.systemId as SystemType;

  const systemData = useMemo(() => {
    switch (systemId) {
      case 'Business':
        return data.business || [];
      case 'Finance':
        return data.finance || [];
      case 'Project':
        return data.project || [];
      case 'Social':
        return data.social || [];
      default:
        return [];
    }
  }, [data, systemId]);

  const hasData = systemData.length > 0;

  const getSystemConfig = useMemo(() => {
    switch (systemId) {
      case 'Business': {
        const entries = data.business || [];
        const totalRevenue = entries.reduce((sum, e) => sum + e.saleAmount, 0);
        const totalQty = entries.reduce((sum, e) => sum + e.quantity, 0);
        const avgSale = entries.length > 0 ? totalRevenue / entries.length : 0;
        
        return {
          title: 'Business System',
          icon: 'business' as const,
          kpi1: { value: entries.length > 0 ? Math.min(100, Math.round((entries.length / 10) * 100)) : 0, label: 'Activity' },
          kpi2: { value: totalQty > 0 ? Math.min(100, Math.round((totalQty / 100) * 100)) : 0, label: 'Volume' },
          chartData: entries.slice(0, 12).map(e => e.saleAmount),
          barData: [
            { label: 'Revenue', value: totalRevenue },
            { label: 'Quantity', value: totalQty },
            { label: 'Avg Sale', value: Math.round(avgSale) },
          ],
          stats: [
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
            { label: 'Items Sold', value: totalQty.toString() },
            { label: 'Entries', value: entries.length.toString() },
          ],
        };
      }
      case 'Finance': {
        const entries = data.finance || [];
        const income = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
        const expense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        const profit = income - expense;
        const savingsRate = income > 0 ? Math.round((profit / income) * 100) : 0;
        
        return {
          title: 'Finance System',
          icon: 'wallet' as const,
          kpi1: { value: Math.max(0, Math.min(100, savingsRate)), label: 'Savings Rate' },
          kpi2: { value: expense > 0 ? Math.min(100, Math.round((income / expense) * 50)) : 0, label: 'Income Ratio' },
          chartData: entries.slice(0, 12).map(e => e.type === 'income' ? e.amount : -e.amount),
          barData: [
            { label: 'Income', value: income, color: colors.success },
            { label: 'Expense', value: expense, color: colors.error },
            { label: 'Profit', value: Math.max(0, profit), color: colors.primary },
          ],
          stats: [
            { label: 'Total Income', value: `$${income.toLocaleString()}` },
            { label: 'Total Expense', value: `$${expense.toLocaleString()}` },
            { label: 'Net Profit', value: `$${profit.toLocaleString()}` },
          ],
        };
      }
      case 'Project': {
        const entries = data.project || [];
        const done = entries.filter(e => e.status === 'done').length;
        const inProgress = entries.filter(e => e.status === 'in-progress').length;
        const pending = entries.filter(e => e.status === 'pending').length;
        const totalHours = entries.reduce((sum, e) => sum + e.timeSpent, 0);
        const completion = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
        
        return {
          title: 'Project System',
          icon: 'clipboard' as const,
          kpi1: { value: completion, label: 'Completion' },
          kpi2: { value: entries.length > 0 ? Math.min(100, Math.round((done / Math.max(1, entries.length)) * 100)) : 0, label: 'Success Rate' },
          chartData: entries.slice(0, 12).map(e => e.timeSpent),
          barData: [
            { label: 'Done', value: done, color: colors.success },
            { label: 'In Progress', value: inProgress, color: colors.warning },
            { label: 'Pending', value: pending, color: colors.tertiary },
          ],
          stats: [
            { label: 'Completed', value: done.toString() },
            { label: 'In Progress', value: inProgress.toString() },
            { label: 'Total Hours', value: totalHours.toFixed(1) },
          ],
          progressBars: [
            { label: 'Done', value: done, max: entries.length || 1, color: colors.success },
            { label: 'In Progress', value: inProgress, max: entries.length || 1, color: colors.warning },
            { label: 'Pending', value: pending, max: entries.length || 1, color: colors.tertiary },
          ],
        };
      }
      case 'Social': {
        const entries = data.social || [];
        const followers = entries.reduce((sum, e) => sum + e.followersGained, 0);
        const likes = entries.reduce((sum, e) => sum + e.likes, 0);
        const comments = entries.reduce((sum, e) => sum + e.comments, 0);
        const engagement = likes + comments;
        const engagementRate = followers > 0 ? Math.min(100, Math.round((engagement / followers) * 10)) : 0;
        
        // Generate heatmap from entries
        const heatmapData: number[][] = [];
        for (let i = 0; i < 6; i++) {
          const row: number[] = [];
          for (let j = 0; j < 7; j++) {
            const idx = i * 7 + j;
            row.push(entries[idx] ? Math.min(100, entries[idx].likes + entries[idx].comments) : 0);
          }
          heatmapData.push(row);
        }
        
        return {
          title: 'Social System',
          icon: 'people' as const,
          kpi1: { value: engagementRate, label: 'Engagement' },
          kpi2: { value: entries.length > 0 ? Math.min(100, Math.round((entries.length / 10) * 100)) : 0, label: 'Activity' },
          chartData: entries.slice(0, 12).map(e => e.followersGained),
          barData: [
            { label: 'Followers', value: followers },
            { label: 'Likes', value: likes },
            { label: 'Comments', value: comments },
          ],
          stats: [
            { label: 'Followers Gained', value: followers.toLocaleString() },
            { label: 'Total Likes', value: likes.toLocaleString() },
            { label: 'Total Comments', value: comments.toLocaleString() },
          ],
          heatmapData,
        };
      }
      default:
        return {
          title: 'System',
          icon: 'cube' as const,
          kpi1: { value: 0, label: 'KPI 1' },
          kpi2: { value: 0, label: 'KPI 2' },
          chartData: [],
          barData: [],
          stats: [],
        };
    }
  }, [systemId, data, colors]);

  const config = getSystemConfig;

  // Empty state
  const EmptyState = () => (
    <Animated.View 
      entering={FadeInDown.delay(200)}
      style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={config.icon} size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Data Yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Add {systemId.toLowerCase()} data using the + button to see detailed analytics here.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <GlassCard delay={0}>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name={config.icon} size={32} color={colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{config.title}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {hasData ? `${systemData.length} entries` : 'No data yet'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* KPIs */}
            <GlassCard delay={100}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Key Metrics</Text>
              <View style={styles.kpiRow}>
                <KPICircle value={config.kpi1.value} label={config.kpi1.label} size={100} />
                <KPICircle value={config.kpi2.value} label={config.kpi2.label} size={100} />
              </View>
            </GlassCard>

            {/* Stats */}
            <GlassCard delay={150}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Statistics</Text>
              <View style={styles.statsGrid}>
                {config.stats.map((stat, i) => (
                  <View key={i} style={[styles.statItem, { backgroundColor: colors.surfaceLight }]}>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* Chart */}
            {config.chartData.length > 0 && (
              <GlassCard delay={200}>
                <LineChart
                  data={config.chartData.length >= 6 ? config.chartData : [...config.chartData, ...Array(6 - config.chartData.length).fill(0)]}
                  labels={months.slice(0, Math.max(6, config.chartData.length))}
                  title="Trend"
                  height={200}
                  color={colors.primary}
                />
              </GlassCard>
            )}

            {/* Bar Chart */}
            {config.barData.length > 0 && (
              <GlassCard delay={300}>
                <BarChart
                  data={config.barData}
                  title="Breakdown"
                  height={200}
                />
              </GlassCard>
            )}

            {/* Progress Bars for Project */}
            {systemId === 'Project' && 'progressBars' in config && (
              <GlassCard delay={400}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Task Status</Text>
                {(config as any).progressBars.map((bar: any, i: number) => (
                  <ProgressBar key={i} label={bar.label} value={bar.value} max={bar.max} color={bar.color} />
                ))}
              </GlassCard>
            )}

            {/* Heatmap for Social */}
            {systemId === 'Social' && 'heatmapData' in config && (
              <GlassCard delay={400}>
                <HeatmapGrid data={(config as any).heatmapData} title="Activity Heatmap" />
              </GlassCard>
            )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
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
