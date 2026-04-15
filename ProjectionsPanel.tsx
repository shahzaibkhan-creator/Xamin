import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { generateProjections, Projection } from '../lib/intelligence';

export const ProjectionsPanel: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();

  const projections = useMemo(() => generateProjections(data), [data]);

  const getTrendIcon = (trend: Projection['trend']): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'remove';
    }
  };

  const getTrendColor = (trend: Projection['trend']) => {
    switch (trend) {
      case 'up': return colors.success;
      case 'down': return colors.error;
      case 'stable': return colors.warning;
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.includes('Revenue') || metric.includes('Profit')) {
      return `$${value.toLocaleString()}`;
    }
    if (metric.includes('Growth') || metric.includes('Completion')) {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  if (projections.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="analytics-outline" size={32} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Add more data to generate projections
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="rocket" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Future Projections</Text>
      </View>

      <View style={styles.grid}>
        {projections.map((projection, index) => (
          <Animated.View
            key={projection.metric}
            entering={FadeInUp.delay(index * 100).springify()}
            style={[
              styles.projectionCard,
              { backgroundColor: colors.surfaceLight }
            ]}
          >
            <View style={styles.projectionHeader}>
              <Text style={[styles.metricName, { color: colors.textSecondary }]}>
                {projection.metric}
              </Text>
              <View style={[styles.trendBadge, { backgroundColor: getTrendColor(projection.trend) + '20' }]}>
                <Ionicons 
                  name={getTrendIcon(projection.trend)} 
                  size={14} 
                  color={getTrendColor(projection.trend)} 
                />
              </View>
            </View>

            <View style={styles.valuesRow}>
              <View style={styles.valueColumn}>
                <Text style={[styles.valueLabel, { color: colors.textMuted }]}>Current</Text>
                <Text style={[styles.valueText, { color: colors.textPrimary }]}>
                  {formatValue(projection.currentValue, projection.metric)}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
              <View style={styles.valueColumn}>
                <Text style={[styles.valueLabel, { color: colors.textMuted }]}>Projected</Text>
                <Text style={[styles.projectedValue, { color: getTrendColor(projection.trend) }]}>
                  {formatValue(projection.projectedValue, projection.metric)}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.timeframe, { color: colors.textMuted }]}>
                {projection.timeframe}
              </Text>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { 
                      width: `${projection.confidence}%`,
                      backgroundColor: colors.primary,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.confidenceText, { color: colors.textMuted }]}>
                {projection.confidence}%
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    gap: 12,
  },
  projectionCard: {
    padding: 14,
    borderRadius: borderRadius.md,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 13,
    fontWeight: '500',
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valueColumn: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
  },
  projectedValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeframe: {
    fontSize: 10,
    flex: 1,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    width: 30,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 24,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
