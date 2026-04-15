import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { borderRadius, getShadows } from '../lib/theme';
import { useAppContext } from '../lib/context';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: number;
  delay?: number;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon,
  trend,
  delay = 0,
  color,
}) => {
  const { colors } = useAppContext();
  const shadows = getShadows(colors);
  const accentColor = color || colors.primary;
  const [displayValue, setDisplayValue] = useState(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toString();
  };

  return (
    <Animated.View 
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
    >
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
        <Ionicons name={icon} size={24} color={accentColor} />
      </View>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]}>
        {prefix}{formatValue(displayValue)}{suffix}
      </Text>
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={trend >= 0 ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={trend >= 0 ? colors.success : colors.error} 
          />
          <Text style={[
            styles.trend,
            { color: trend >= 0 ? colors.success : colors.error }
          ]}>
            {trend >= 0 ? '+' : ''}{trend}%
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 16,
    minWidth: 140,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
});
