import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';

interface HeatmapGridProps {
  data: number[][];
  title?: string;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ data, title }) => {
  const { colors } = useAppContext();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];

  const getHeatColor = (value: number): string => {
    if (value >= 80) return colors.primary;
    if (value >= 60) return colors.secondary;
    if (value >= 40) return colors.tertiary;
    if (value >= 20) return colors.quaternary;
    return colors.surfaceLight;
  };

  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>}
      <View style={styles.grid}>
        <View style={styles.yLabels}>
          <View style={styles.cornerCell} />
          {hours.map((hour, i) => (
            <Text key={i} style={[styles.label, { color: colors.textMuted }]}>{hour}</Text>
          ))}
        </View>
        <View style={styles.dataGrid}>
          <View style={styles.xLabels}>
            {days.map((day, i) => (
              <Text key={i} style={[styles.label, styles.dayLabel, { color: colors.textMuted }]}>{day}</Text>
            ))}
          </View>
          {data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((value, colIndex) => (
                <Animated.View
                  key={colIndex}
                  entering={FadeIn.delay((rowIndex * 7 + colIndex) * 30)}
                  style={[
                    styles.cell,
                    { backgroundColor: getHeatColor(value), opacity: 0.3 + (value / 100) * 0.7 },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Low</Text>
        <View style={styles.legendGradient}>
          {[0, 25, 50, 75, 100].map((v, i) => (
            <View key={i} style={[styles.legendCell, { backgroundColor: getHeatColor(v) }]} />
          ))}
        </View>
        <Text style={[styles.legendLabel, { color: colors.textMuted }]}>High</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
  },
  yLabels: {
    marginRight: 8,
  },
  cornerCell: {
    height: 24,
  },
  xLabels: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dataGrid: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 1,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    height: 24,
    textAlignVertical: 'center',
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 2,
  },
  legendCell: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 10,
  },
});
