import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { borderRadius, getShadows } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { SystemType } from '../lib/types';
import { QuickEntryModal } from './QuickEntryModal';
import { BulkEntryModal } from './BulkEntryModal';
import { CSVImportModal } from './CSVImportModal';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type EntryMode = 'quick' | 'bulk' | 'csv';

interface SystemOption {
  id: SystemType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const AddDataFAB: React.FC = () => {
  const { colors } = useAppContext();
  const shadows = getShadows(colors);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<SystemType | null>(null);
  const [entryMode, setEntryMode] = useState<EntryMode | null>(null);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const systemOptions: SystemOption[] = [
    { id: 'Business', label: 'Business', icon: 'business', color: colors.primary },
    { id: 'Finance', label: 'Finance', icon: 'wallet', color: colors.secondary },
    { id: 'Project', label: 'Project', icon: 'clipboard', color: colors.tertiary },
    { id: 'Social', label: 'Social', icon: 'people', color: colors.quaternary },
  ];

  const handlePress = () => {
    setMenuVisible(true);
    rotation.value = withSpring(45);
  };

  const handleClose = () => {
    setMenuVisible(false);
    rotation.value = withSpring(0);
  };

  const handleSystemSelect = (system: SystemType) => {
    setSelectedSystem(system);
  };

  const handleModeSelect = (mode: EntryMode) => {
    setEntryMode(mode);
    setMenuVisible(false);
  };

  const handleEntryComplete = () => {
    setSelectedSystem(null);
    setEntryMode(null);
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <>
      <AnimatedTouchable
        style={[
          styles.fab,
          shadows.glow,
          { backgroundColor: colors.primary },
          fabStyle,
        ]}
        onPress={handlePress}
        onPressIn={() => { scale.value = withSpring(0.9); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        activeOpacity={0.9}
      >
        <Animated.View style={iconStyle}>
          <Ionicons name="add" size={28} color="#fff" />
        </Animated.View>
      </AnimatedTouchable>

      {/* System Selection Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Animated.View 
            entering={SlideInDown.springify()}
            exiting={SlideOutDown}
            style={[styles.menuContainer, { backgroundColor: colors.surface }]}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                {selectedSystem ? 'Select Entry Mode' : 'Add Data'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!selectedSystem ? (
              <View style={styles.optionsGrid}>
                {systemOptions.map((option, index) => (
                  <Animated.View
                    key={option.id}
                    entering={FadeIn.delay(index * 50)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.optionCard,
                        { backgroundColor: colors.surfaceLight, borderColor: colors.cardBorder }
                      ]}
                      onPress={() => handleSystemSelect(option.id)}
                    >
                      <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                        <Ionicons name={option.icon} size={28} color={option.color} />
                      </View>
                      <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.modeOptions}>
                <TouchableOpacity
                  style={[styles.modeCard, { backgroundColor: colors.surfaceLight }]}
                  onPress={() => handleModeSelect('quick')}
                >
                  <View style={[styles.modeIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="flash" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.modeText}>
                    <Text style={[styles.modeTitle, { color: colors.textPrimary }]}>Quick Entry</Text>
                    <Text style={[styles.modeDesc, { color: colors.textMuted }]}>Add single entry fast</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeCard, { backgroundColor: colors.surfaceLight }]}
                  onPress={() => handleModeSelect('bulk')}
                >
                  <View style={[styles.modeIcon, { backgroundColor: colors.secondary + '20' }]}>
                    <Ionicons name="grid" size={24} color={colors.secondary} />
                  </View>
                  <View style={styles.modeText}>
                    <Text style={[styles.modeTitle, { color: colors.textPrimary }]}>Bulk Entry</Text>
                    <Text style={[styles.modeDesc, { color: colors.textMuted }]}>Add multiple rows at once</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeCard, { backgroundColor: colors.surfaceLight }]}
                  onPress={() => handleModeSelect('csv')}
                >
                  <View style={[styles.modeIcon, { backgroundColor: colors.tertiary + '20' }]}>
                    <Ionicons name="document-text" size={24} color={colors.tertiary} />
                  </View>
                  <View style={styles.modeText}>
                    <Text style={[styles.modeTitle, { color: colors.textPrimary }]}>CSV Import</Text>
                    <Text style={[styles.modeDesc, { color: colors.textMuted }]}>Paste or import CSV data</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedSystem(null)}
                >
                  <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
                  <Text style={[styles.backText, { color: colors.textSecondary }]}>Back to systems</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Entry Modals */}
      {selectedSystem && entryMode === 'quick' && (
        <QuickEntryModal
          system={selectedSystem}
          visible={true}
          onClose={handleEntryComplete}
        />
      )}

      {selectedSystem && entryMode === 'bulk' && (
        <BulkEntryModal
          system={selectedSystem}
          visible={true}
          onClose={handleEntryComplete}
        />
      )}

      {selectedSystem && entryMode === 'csv' && (
        <CSVImportModal
          system={selectedSystem}
          visible={true}
          onClose={handleEntryComplete}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '47%',
    padding: 20,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 150,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modeOptions: {
    gap: 12,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 14,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modeDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
