import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { calculateDecisionImpact, DecisionImpact } from '../lib/intelligence';

type DecisionType = 'increase_price' | 'reduce_expenses' | 'increase_marketing' | 'adjust_workload';

interface Decision {
  id: DecisionType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const decisions: Decision[] = [
  { id: 'increase_price', label: 'Increase Price', icon: 'pricetag', description: '+10% price' },
  { id: 'reduce_expenses', label: 'Cut Expenses', icon: 'cut', description: '-15% costs' },
  { id: 'increase_marketing', label: 'Boost Marketing', icon: 'megaphone', description: '+20% spend' },
  { id: 'adjust_workload', label: 'Optimize Work', icon: 'speedometer', description: 'Rebalance' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const DecisionSimulator: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();
  const [activeDecision, setActiveDecision] = useState<DecisionType | null>(null);
  const [impact, setImpact] = useState<DecisionImpact | null>(null);

  const handleDecisionPress = (decisionId: DecisionType) => {
    if (activeDecision === decisionId) {
      setActiveDecision(null);
      setImpact(null);
      return;
    }

    setActiveDecision(decisionId);
    
    const percentage = decisionId === 'increase_price' ? 10 
      : decisionId === 'reduce_expenses' ? 15 
      : decisionId === 'increase_marketing' ? 20 
      : 10;
    
    const calculatedImpact = calculateDecisionImpact(decisionId, percentage, data);
    setImpact(calculatedImpact);
  };

  const getImpactColor = (value: number) => {
    if (value > 5) return colors.success;
    if (value < -5) return colors.error;
    return colors.warning;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="game-controller" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Decision Simulator</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Tap a decision to see instant impact analysis
      </Text>

      <View style={styles.decisionsGrid}>
        {decisions.map((decision, index) => {
          const isActive = activeDecision === decision.id;
          return (
            <Animated.View
              key={decision.id}
              entering={FadeInDown.delay(index * 80).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.decisionButton,
                  { 
                    backgroundColor: isActive ? colors.primary : colors.surfaceLight,
                    borderColor: isActive ? colors.primary : colors.cardBorder,
                  }
                ]}
                onPress={() => handleDecisionPress(decision.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.decisionIcon,
                  { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colors.primary + '20' }
                ]}>
                  <Ionicons 
                    name={decision.icon} 
                    size={20} 
                    color={isActive ? '#fff' : colors.primary} 
                  />
                </View>
                <Text style={[
                  styles.decisionLabel,
                  { color: isActive ? '#fff' : colors.textPrimary }
                ]}>
                  {decision.label}
                </Text>
                <Text style={[
                  styles.decisionDesc,
                  { color: isActive ? 'rgba(255,255,255,0.7)' : colors.textMuted }
                ]}>
                  {decision.description}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {impact && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={[styles.impactPanel, { backgroundColor: colors.surfaceLight }]}
        >
          <Text style={[styles.impactTitle, { color: colors.textPrimary }]}>Impact Analysis</Text>
          
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <Text style={[styles.impactLabel, { color: colors.textMuted }]}>Profit</Text>
              <Text style={[styles.impactValue, { color: getImpactColor(impact.profitChange) }]}>
                {impact.profitChange >= 0 ? '+' : ''}{impact.profitChange.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactLabel, { color: colors.textMuted }]}>Revenue</Text>
              <Text style={[styles.impactValue, { color: getImpactColor(impact.revenueChange) }]}>
                {impact.revenueChange >= 0 ? '+' : ''}{impact.revenueChange.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactLabel, { color: colors.textMuted }]}>Risk</Text>
              <Text style={[styles.impactValue, { color: getImpactColor(-impact.riskChange) }]}>
                {impact.riskChange >= 0 ? '+' : ''}{impact.riskChange.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactLabel, { color: colors.textMuted }]}>Efficiency</Text>
              <Text style={[styles.impactValue, { color: getImpactColor(impact.efficiencyChange) }]}>
                {impact.efficiencyChange >= 0 ? '+' : ''}{impact.efficiencyChange.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={[styles.descriptionBox, { backgroundColor: colors.card }]}>
            <Ionicons name="bulb-outline" size={16} color={colors.warning} />
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {impact.description}
            </Text>
          </View>
        </Animated.View>
      )}
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
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  decisionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  decisionButton: {
    width: '100%',
    minWidth: 155,
    flex: 1,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  decisionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  decisionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  decisionDesc: {
    fontSize: 11,
  },
  impactPanel: {
    marginTop: 16,
    padding: 16,
    borderRadius: borderRadius.lg,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  impactItem: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  descriptionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 10,
  },
  descriptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
