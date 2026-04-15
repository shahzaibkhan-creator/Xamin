import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  color?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  color,
}) => {
  const { colors } = useAppContext();
  const sliderColor = color || colors.primary;
  const [sliderWidth, setSliderWidth] = React.useState(200);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    const position = ((value - min) / (max - min)) * sliderWidth;
    translateX.value = withSpring(position, { damping: 15 });
  }, [value, sliderWidth]);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      const newX = Math.max(0, Math.min(sliderWidth, event.x));
      translateX.value = newX;
      const newValue = Math.round((newX / sliderWidth) * (max - min) + min);
      runOnJS(onChange)(newValue);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - 12 },
      { scale: scale.value },
    ],
  }));

  const trackFillStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.value, { color: sliderColor }]}>{value}</Text>
      </View>
      <View 
        style={[styles.track, { backgroundColor: colors.surfaceLight }]}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.trackFill, { backgroundColor: sliderColor }, trackFillStyle]} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[
            styles.thumb, 
            { borderColor: sliderColor, backgroundColor: colors.background }, 
            thumbStyle
          ]} />
        </GestureDetector>
      </View>
      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>{min}</Text>
        <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>{max}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
  },
  trackFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 11,
  },
});
