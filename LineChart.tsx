import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useAppContext } from '../lib/context';

interface LineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  showArea?: boolean;
  title?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  labels = [],
  height = 200,
  color,
  showArea = true,
  title,
}) => {
  const { colors } = useAppContext();
  const chartColor = color || colors.primary;
  const [dimensions, setDimensions] = useState({ width: 300 });
  
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data) * 1.1;
  const minValue = Math.min(...data) * 0.9;
  const range = maxValue - minValue;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / range) * chartHeight;

  const linePath = data.map((value, index) => {
    const x = getX(index);
    const y = getY(value);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const areaPath = linePath + 
    ` L ${getX(data.length - 1)} ${padding.top + chartHeight}` +
    ` L ${padding.left} ${padding.top + chartHeight} Z`;

  const formatValue = (val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toFixed(0);
  };

  const yAxisValues = [minValue, minValue + range * 0.5, maxValue].map(v => Math.round(v));

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setDimensions({ width: e.nativeEvent.layout.width })}
    >
      {title && <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>}
      <Svg width={dimensions.width} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.tertiary} />
          </LinearGradient>
          <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={chartColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Y-axis labels */}
        {yAxisValues.map((value, i) => (
          <React.Fragment key={i}>
            <Line
              x1={padding.left}
              y1={getY(value)}
              x2={dimensions.width - padding.right}
              y2={getY(value)}
              stroke={colors.cardBorder}
              strokeDasharray="4,4"
            />
            <SvgText
              x={padding.left - 8}
              y={getY(value) + 4}
              fontSize={10}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {formatValue(value)}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Area fill */}
        {showArea && (
          <Path d={areaPath} fill="url(#areaGradient)" />
        )}

        {/* Line */}
        <Path
          d={linePath}
          stroke="url(#lineGradient)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((value, index) => (
          <Circle
            key={index}
            cx={getX(index)}
            cy={getY(value)}
            r={4}
            fill={colors.background}
            stroke={chartColor}
            strokeWidth={2}
          />
        ))}

        {/* X-axis labels */}
        {labels.slice(0, data.length).map((label, index) => (
          <SvgText
            key={index}
            x={getX(index)}
            y={height - 8}
            fontSize={10}
            fill={colors.textMuted}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
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
