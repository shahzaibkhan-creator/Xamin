import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { generateBrutalTruth, BrutalTruth } from '../lib/intelligence';

export const BrutalTruthPanel: React.FC = () => {
  const { colors } = useAppContext();
  const { data } = useDataContext();

  const truth = useMemo(() => generateBrutalTruth(data), [data]);

  const getSeverityColors = (severity: BrutalTruth['severity']) => {
    switch (severity) {
      case 'positive':
        return { bg: colors.success + '15', border: colors.success + '30', text: colors.success };
      case 'negative':
        return { bg: colors.error + '15', border: colors.error + '30', text: colors.error };
      case 'neutral':
        return { bg: colors.warning + '15', border: colors.warning + '30', text: colors.warning };
    }
  };

  const severityColors = getSeverityColors(truth.severity);

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={[
        styles.container, 
        { 
          backgroundColor: severityColors.bg,
          borderColor: severityColors.border,
        }
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: severityColors.text + '20' }]}>
          <Ionicons 
            name={truth.icon as any} 
            size={20} 
            color={severityColors.text} 
          />
        </View>
        <Text style={[styles.title, { color: severityColors.text }]}>Brutal Truth</Text>
      </View>
      <Text style={[styles.message, { color: colors.textPrimary }]}>
        {truth.message}
      </Text>
    </Animated.View>
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
    gap: 10,
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
});
