import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { spacing, borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { DataSheet } from '../components/DataSheet';
import { ExportModal } from '../components/ExportModal';
import { SystemType } from '../lib/types';
import { calculateStats } from '../lib/dataStore';

const systems: { id: SystemType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'Business', label: 'Business', icon: 'business' },
  { id: 'Finance', label: 'Finance', icon: 'wallet' },
  { id: 'Project', label: 'Project', icon: 'clipboard' },
  { id: 'Social', label: 'Social', icon: 'people' },
];

export const DataSheetScreen: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();
  const [activeSystem, setActiveSystem] = useState<SystemType>('Business');
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const stats = calculateStats(data);

  const getSystemCount = (system: SystemType) => {
    const key = system.toLowerCase() as keyof typeof data;
    return data[key]?.length || 0;
  };

  const getTotalEntries = () => {
    return stats.businessEntries + stats.financeEntries + stats.projectEntries + stats.socialEntries;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Data Manager</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {getTotalEntries()} total entries across all systems
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={() => setExportModalVisible(true)}
          >
            <Ionicons name="download" size={18} color="#fff" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="business" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>${stats.totalRevenue.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Revenue</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="trending-up" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>${stats.profit.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Profit</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.tertiary + '20' }]}>
              <Ionicons name="checkmark-done" size={20} color={colors.tertiary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.taskCompletion}%</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tasks Done</Text>
          </View>
        </Animated.View>

        {/* System Tabs */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard noPadding>
            <View style={styles.tabsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                {systems.map((system) => (
                  <TouchableOpacity
                    key={system.id}
                    style={[
                      styles.tab,
                      activeSystem === system.id && { backgroundColor: colors.primary + '20' },
                    ]}
                    onPress={() => setActiveSystem(system.id)}
                  >
                    <Ionicons 
                      name={system.icon} 
                      size={18} 
                      color={activeSystem === system.id ? colors.primary : colors.textMuted} 
                    />
                    <Text style={[
                      styles.tabText,
                      { color: activeSystem === system.id ? colors.primary : colors.textSecondary }
                    ]}>
                      {system.label}
                    </Text>
                    <View style={[
                      styles.badge,
                      { backgroundColor: activeSystem === system.id ? colors.primary : colors.surfaceLight }
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        { color: activeSystem === system.id ? '#fff' : colors.textMuted }
                      ]}>
                        {getSystemCount(system.id)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dataSheetContainer}>
              <DataSheet system={activeSystem} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Help Card */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <GlassCard>
            <View style={styles.helpHeader}>
              <Ionicons name="help-circle" size={22} color={colors.info} />
              <Text style={[styles.helpTitle, { color: colors.textPrimary }]}>Quick Tips</Text>
            </View>
            <View style={styles.helpList}>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  Tap the <Text style={{ fontWeight: '600' }}>+ button</Text> to add new data
                </Text>
              </View>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: colors.secondary }]} />
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  Tap any cell to <Text style={{ fontWeight: '600' }}>edit</Text> directly
                </Text>
              </View>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: colors.tertiary }]} />
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  Use <Text style={{ fontWeight: '600' }}>CSV Import</Text> for bulk data
                </Text>
              </View>
              <View style={styles.helpItem}>
                <View style={[styles.helpDot, { backgroundColor: colors.quaternary }]} />
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Export</Text> to download or print reports
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <ExportModal
        system={activeSystem}
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginRight: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dataSheetContainer: {
    padding: 16,
    minHeight: 300,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpList: {
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  helpText: {
    fontSize: 13,
    flex: 1,
  },
  bottomPadding: {
    height: 100,
  },
});
