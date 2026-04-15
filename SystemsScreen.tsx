import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing, borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { Header } from '../components/Header';
import { SystemCard } from '../components/SystemCard';
import { SystemData, SystemStatus } from '../lib/types';

type RootStackParamList = {
  SystemDetail: { systemId: string };
};

export const SystemsScreen: React.FC = () => {
  const { colors } = useAppContext();
  const { data, refreshData } = useDataContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = React.useState(false);

  // Calculate system data from user entries
  const systems: SystemData[] = useMemo(() => {
    const business = data.business || [];
    const finance = data.finance || [];
    const project = data.project || [];
    const social = data.social || [];

    const getStatus = (count: number, health: number): SystemStatus => {
      if (count === 0) return 'Risk';
      if (health >= 70) return 'Stable';
      if (health >= 40) return 'Risk';
      return 'Critical';
    };

    // Business metrics
    const businessRevenue = business.reduce((sum, e) => sum + e.saleAmount, 0);
    const businessQty = business.reduce((sum, e) => sum + e.quantity, 0);
    const businessHealth = business.length > 0 ? Math.min(100, Math.round((business.length / 10) * 100)) : 0;

    // Finance metrics
    const totalIncome = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const financeHealth = totalIncome > 0 ? Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    // Project metrics
    const completedTasks = project.filter(e => e.status === 'done').length;
    const totalTasks = project.length;
    const projectHealth = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Social metrics
    const totalFollowers = social.reduce((sum, e) => sum + e.followersGained, 0);
    const totalEngagement = social.reduce((sum, e) => sum + e.likes + e.comments, 0);
    const socialHealth = social.length > 0 ? Math.min(100, Math.round((social.length / 10) * 100)) : 0;

    return [
      {
        id: 'Business',
        name: 'Business System',
        status: getStatus(business.length, businessHealth),
        metrics: { 
          primary: businessRevenue, 
          secondary: businessQty, 
          tertiary: businessHealth 
        },
        trend: business.slice(0, 12).map(e => e.saleAmount),
      },
      {
        id: 'Finance',
        name: 'Finance System',
        status: getStatus(finance.length, Math.max(0, financeHealth)),
        metrics: { 
          primary: totalIncome, 
          secondary: totalExpense, 
          tertiary: Math.max(0, financeHealth)
        },
        trend: finance.slice(0, 12).map(e => e.amount),
      },
      {
        id: 'Project',
        name: 'Project System',
        status: getStatus(project.length, projectHealth),
        metrics: { 
          primary: completedTasks, 
          secondary: totalTasks - completedTasks, 
          tertiary: projectHealth 
        },
        trend: project.slice(0, 12).map(e => e.timeSpent),
      },
      {
        id: 'Social',
        name: 'Social System',
        status: getStatus(social.length, socialHealth),
        metrics: { 
          primary: totalFollowers, 
          secondary: totalEngagement, 
          tertiary: socialHealth 
        },
        trend: social.slice(0, 12).map(e => e.followersGained),
      },
    ];
  }, [data]);

  const totalEntries = useMemo(() => {
    return (data.business?.length || 0) + 
           (data.finance?.length || 0) + 
           (data.project?.length || 0) + 
           (data.social?.length || 0);
  }, [data]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleSystemPress = (systemId: string) => {
    navigation.navigate('SystemDetail', { systemId });
  };

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
        <Text style={[styles.title, { color: colors.textPrimary }]}>System Overview</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {totalEntries > 0 
            ? `${totalEntries} total entries across all systems`
            : 'Add data to activate your systems'
          }
        </Text>

        {totalEntries === 0 && (
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={[styles.hintCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              Systems will show "Risk" status until you add data. Use the + button to get started!
            </Text>
          </Animated.View>
        )}

        {systems.map((system, index) => (
          <SystemCard
            key={system.id}
            system={system}
            onPress={() => handleSystemPress(system.id)}
            delay={index * 100}
          />
        ))}

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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
