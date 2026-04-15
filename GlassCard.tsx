import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { borderRadius, getShadows } from '../lib/theme';
import { useAppContext } from '../lib/context';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  direction?: 'up' | 'down';
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  delay = 0,
  direction = 'up',
  noPadding = false,
}) => {
  const { colors } = useAppContext();
  const shadows = getShadows(colors);
  
  const entering = direction === 'up' 
    ? FadeInUp.delay(delay).springify()
    : FadeInDown.delay(delay).springify();

  return (
    <Animated.View 
      entering={entering}
      style={[
        styles.card, 
        shadows.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        noPadding && { padding: 0 },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});
