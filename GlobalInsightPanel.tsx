import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { generateGlobalInsights, GlobalInsight } from '../lib/intelligence';

export const GlobalInsightPanel: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();

  const insights = useMemo(() => generateGlobalInsights(data), [data]);

  const getInsightColor = (type: GlobalInsight['type']) => {
    switch (type) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'danger': return colors.error;
      case 'info': return colors.info;
    }
  };

  const getInsightIcon = (type: GlobalInsight['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'danger': return 'alert-circle';
      case 'info': return 'information-circle';
    }
  };

  if (insights.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="bulb" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Cross-System Intelligence</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {insights.length} insight{insights.length !== 1 ? 's' : ''} detected
          </Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.insightsScroll}
      >
        {insights.slice(0, 5).map((insight, index) => (
          <Animated.View
            key={insight.id}
            entering={FadeInRight.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={[
              styles.insightCard,
              { 
                backgroundColor: getInsightColor(insight.type) + '15',
                borderColor: getInsightColor(insight.type) + '30',
              }
            ]}
          >
            <View style={styles.insightHeader}>
              <Ionicons 
                name={getInsightIcon(insight.type)} 
                size={18} 
                color={getInsightColor(insight.type)} 
              />
              <Text style={[styles.insightTitle, { color: getInsightColor(insight.type) }]}>
                {insight.title}
              </Text>
            </View>
            <Text style={[styles.insightMessage, { color: colors.textSecondary }]}>
              {insight.message}
            </Text>
            <View style={styles.systemTags}>
              {insight.systems.map((system, i) => (
                <View key={i} style={[styles.systemTag, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.systemTagText, { color: colors.textMuted }]}>{system}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  insightsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  insightCard: {
    width: 280,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightMessage: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  systemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  systemTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  systemTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
