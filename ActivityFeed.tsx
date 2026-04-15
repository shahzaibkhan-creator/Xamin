import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { useAppContext } from '../lib/context';
import { ActivityEvent } from '../lib/types';

interface ActivityFeedProps {
  activities: ActivityEvent[];
}

const getActivityIcon = (type: ActivityEvent['type']): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'success': return 'checkmark-circle';
    case 'warning': return 'warning';
    case 'error': return 'alert-circle';
    case 'info': return 'information-circle';
    default: return 'ellipse';
  }
};

const ActivityItem: React.FC<{ item: ActivityEvent; index: number }> = ({ item, index }) => {
  const { colors } = useAppContext();
  
  const getActivityColor = (type: ActivityEvent['type']): string => {
    switch (type) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      case 'info': return colors.info;
      default: return colors.textMuted;
    }
  };

  const activityColor = getActivityColor(item.type);

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={[styles.activityItem, { borderBottomColor: colors.cardBorder }]}
    >
      <View style={[styles.iconDot, { backgroundColor: activityColor + '30' }]}>
        <Ionicons 
          name={getActivityIcon(item.type)} 
          size={16} 
          color={activityColor} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityMessage, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.activityMeta}>
          <Text style={[styles.activitySystem, { color: colors.primary }]}>{item.system}</Text>
          <Text style={[styles.activityTime, { color: colors.textMuted }]}>{item.time}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <ActivityItem item={item} index={index} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  activitySystem: {
    fontSize: 11,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 11,
  },
});
