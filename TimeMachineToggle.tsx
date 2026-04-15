import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';

export type TimeMode = 'past' | 'present' | 'future';

interface TimeMachineToggleProps {
  mode: TimeMode;
  onModeChange: (mode: TimeMode) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const TimeMachineToggle: React.FC<TimeMachineToggleProps> = ({ mode, onModeChange }) => {
  const { colors } = useAppContext();

  const modes: { key: TimeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'past', label: 'Past', icon: 'time-outline' },
    { key: 'present', label: 'Present', icon: 'radio-button-on' },
    { key: 'future', label: 'Future', icon: 'rocket-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceLight }]}>
      <View style={styles.header}>
        <Ionicons name="time" size={16} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textSecondary }]}>Time Machine</Text>
      </View>
      <View style={styles.toggleContainer}>
        {modes.map((m) => {
          const isActive = mode === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.toggleButton,
                isActive && { backgroundColor: colors.primary },
              ]}
              onPress={() => onModeChange(m.key)}
            >
              <Ionicons 
                name={m.icon} 
                size={16} 
                color={isActive ? '#fff' : colors.textMuted} 
              />
              <Text style={[
                styles.toggleText,
                { color: isActive ? '#fff' : colors.textMuted }
              ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
