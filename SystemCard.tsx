import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { borderRadius, getShadows } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { SystemData, SystemStatus } from '../lib/types';

interface SystemCardProps {
  system: SystemData;
  onPress: () => void;
  delay?: number;
}

const getSystemIcon = (id: string): keyof typeof Ionicons.glyphMap => {
  switch (id) {
    case 'Business': return 'business';
    case 'Finance': return 'wallet';
    case 'Project': return 'clipboard';
    case 'Social': return 'people';
    default: return 'cube';
  }
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const SystemCard: React.FC<SystemCardProps> = ({ system, onPress, delay = 0 }) => {
  const { colors } = useAppContext();
  const shadows = getShadows(colors);
  const scale = useSharedValue(1);

  const getStatusColor = (status: SystemStatus): string => {
    switch (status) {
      case 'Stable': return colors.success;
      case 'Risk': return colors.warning;
      case 'Critical': return colors.error;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatMetric = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toString();
  };

  const statusColor = getStatusColor(system.status);

  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(delay).springify()}
      style={[
        styles.card, 
        shadows.card, 
        animatedStyle,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        }
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={getSystemIcon(system.id)} size={24} color={colors.primary} />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {system.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.name, { color: colors.textPrimary }]}>{system.name}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {formatMetric(system.metrics.primary)}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Primary</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {formatMetric(system.metrics.secondary)}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Secondary</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {system.metrics.tertiary}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Health</Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
        <Text style={[styles.viewDetails, { color: colors.primary }]}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  viewDetails: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
});
