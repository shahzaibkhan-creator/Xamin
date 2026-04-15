import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, Text as SvgText, Line } from 'react-native-svg';
import { useAppContext } from '../lib/context';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  title?: string;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  title,
  showValues = true,
}) => {
  const { colors } = useAppContext();
  const [dimensions, setDimensions] = useState({ width: 300 });
  const [animatedData, setAnimatedData] = useState(data.map(() => 0));
  
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data.map(d => d.value));
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.value)) * 1.2;
  const barWidth = (chartWidth / data.length) * 0.6;
  const barGap = (chartWidth / data.length) * 0.4;

  const getBarHeight = (value: number) => (value / maxValue) * chartHeight;
  const getX = (index: number) => padding.left + index * (barWidth + barGap) + barGap / 2;

  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  const yAxisValues = [0, maxValue * 0.5, maxValue].map(v => Math.round(v));

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setDimensions({ width: e.nativeEvent.layout.width })}
    >
      {title && <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>}
      <Svg width={dimensions.width} height={height}>
        <Defs>
          <LinearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.tertiary} />
          </LinearGradient>
          <LinearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.quaternary} />
            <Stop offset="100%" stopColor={colors.tertiary} />
          </LinearGradient>
        </Defs>

        {/* Y-axis lines */}
        {yAxisValues.map((value, i) => (
          <React.Fragment key={i}>
            <Line
              x1={padding.left}
              y1={padding.top + chartHeight - getBarHeight(value)}
              x2={dimensions.width - padding.right}
              y2={padding.top + chartHeight - getBarHeight(value)}
              stroke={colors.cardBorder}
              strokeDasharray="4,4"
            />
            <SvgText
              x={padding.left - 8}
              y={padding.top + chartHeight - getBarHeight(value) + 4}
              fontSize={10}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {formatValue(value)}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = getBarHeight(animatedData[index]);
          return (
            <React.Fragment key={index}>
              <Rect
                x={getX(index)}
                y={padding.top + chartHeight - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={item.color || (index % 2 === 0 ? 'url(#barGradient1)' : 'url(#barGradient2)')}
              />
              {showValues && (
                <SvgText
                  x={getX(index) + barWidth / 2}
                  y={padding.top + chartHeight - barHeight - 8}
                  fontSize={10}
                  fill={colors.textSecondary}
                  textAnchor="middle"
                >
                  {formatValue(item.value)}
                </SvgText>
              )}
              <SvgText
                x={getX(index) + barWidth / 2}
                y={height - 10}
                fontSize={10}
                fill={colors.textMuted}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
});
