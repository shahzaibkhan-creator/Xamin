import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing, borderRadius, ThemeMode } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  description,
  onPress,
  rightElement,
  color,
  danger = false,
}) => {
  const { colors } = useAppContext();
  const itemColor = danger ? colors.error : (color || colors.primary);

  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIcon, { backgroundColor: itemColor + '20' }]}>
        <Ionicons name={icon} size={20} color={itemColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: danger ? colors.error : colors.textPrimary }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
            {description}
          </Text>
        )}
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
};

interface ThemeOptionProps {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  mode,
  label,
  description,
  icon,
  colors: themeColors,
  isSelected,
  onSelect,
}) => {
  const { colors } = useAppContext();

  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        { 
          backgroundColor: colors.surfaceLight,
          borderColor: isSelected ? colors.primary : colors.cardBorder,
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
      onPress={onSelect}
    >
      <View style={styles.themeHeader}>
        <View style={[styles.themeIcon, { backgroundColor: themeColors[0] + '30' }]}>
          <Ionicons name={icon} size={20} color={themeColors[0]} />
        </View>
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
      </View>
      <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.themeDescription, { color: colors.textMuted }]}>{description}</Text>
      <View style={styles.colorPreview}>
        {themeColors.map((color, index) => (
          <View key={index} style={[styles.colorDot, { backgroundColor: color }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
};

export const SettingsScreen: React.FC = () => {
  const { colors, themeMode, setThemeMode } = useAppContext();
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [animations, setAnimations] = useState(true);

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will reset all simulation data and settings to defaults. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'All data has been reset to defaults.');
          }
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert('Success', 'Cache cleared successfully.');
  };

  const themeOptions: { mode: ThemeMode; label: string; description: string; icon: keyof typeof Ionicons.glyphMap; colors: string[] }[] = [
    {
      mode: 'dark',
      label: 'Dark Mode',
      description: 'Neon cyberpunk theme',
      icon: 'moon',
      colors: ['#00d4ff', '#00ffc8', '#a855f7', '#ec4899'],
    },
    {
      mode: 'light',
      label: 'Light Mode',
      description: 'Soft natural palette',
      icon: 'sunny',
      colors: ['#B0E0E6', '#93C572', '#D2B48C', '#D3D3D3'],
    },
    {
      mode: 'tech',
      label: 'Tech Mode',
      description: 'Premium metallic theme',
      icon: 'hardware-chip',
      colors: ['#D4AF37', '#C0C0C0', '#1E3A5F', '#0D0D0D'],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Customize your Control Tower experience</Text>

        {/* Theme Selection */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Theme</Text>
            <View style={styles.themeGrid}>
              {themeOptions.map((option) => (
                <ThemeOption
                  key={option.mode}
                  {...option}
                  isSelected={themeMode === option.mode}
                  onSelect={() => setThemeMode(option.mode)}
                />
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
            <SettingItem
              icon="sparkles"
              label="Animations"
              description="Enable smooth transitions and effects"
              color={colors.secondary}
              rightElement={
                <Switch
                  value={animations}
                  onValueChange={setAnimations}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary + '50' }}
                  thumbColor={animations ? colors.primary : colors.textMuted}
                />
              }
            />
          </GlassCard>
        </Animated.View>

        {/* Data & Sync */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data & Sync</Text>
            <SettingItem
              icon="refresh"
              label="Auto Refresh"
              description="Automatically update data every 5 seconds"
              color={colors.primary}
              rightElement={
                <Switch
                  value={autoRefresh}
                  onValueChange={setAutoRefresh}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary + '50' }}
                  thumbColor={autoRefresh ? colors.primary : colors.textMuted}
                />
              }
            />
            <SettingItem
              icon="cloud-download"
              label="Sync Data"
              description="Last synced: Just now"
              color={colors.secondary}
              onPress={() => Alert.alert('Sync', 'Data synced successfully!')}
            />
            <SettingItem
              icon="trash-bin"
              label="Clear Cache"
              description="Free up storage space"
              color={colors.warning}
              onPress={handleClearCache}
            />
          </GlassCard>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
            <SettingItem
              icon="notifications"
              label="Push Notifications"
              description="Receive alerts and updates"
              color={colors.quaternary}
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary + '50' }}
                  thumbColor={notifications ? colors.primary : colors.textMuted}
                />
              }
            />
            <SettingItem
              icon="alert-circle"
              label="Risk Alerts"
              description="Get notified when systems are at risk"
              color={colors.warning}
              onPress={() => {}}
            />
          </GlassCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>About</Text>
            <SettingItem
              icon="information-circle"
              label="Version"
              description="Control Tower v1.0.0"
              color={colors.info}
            />
            <SettingItem
              icon="document-text"
              label="Terms of Service"
              color={colors.textSecondary}
              onPress={() => {}}
            />
            <SettingItem
              icon="shield-checkmark"
              label="Privacy Policy"
              color={colors.textSecondary}
              onPress={() => {}}
            />
          </GlassCard>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <GlassCard>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
            <SettingItem
              icon="refresh-circle"
              label="Reset All Data"
              description="Reset to factory defaults"
              danger
              onPress={handleResetData}
            />
          </GlassCard>
        </Animated.View>

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
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  themeHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  themeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
});
