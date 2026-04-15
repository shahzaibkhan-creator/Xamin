import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { borderRadius, getShadows } from '../lib/theme';
import { SystemType } from '../lib/types';
import { useAppContext } from '../lib/context';

const systems: SystemType[] = ['Business', 'Finance', 'Project', 'Social'];

export const Header: React.FC = () => {
  const { colors, selectedSystem, setSelectedSystem } = useAppContext();
  const shadows = getShadows(colors);
  const [dropdownVisible, setDropdownVisible] = React.useState(false);

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[
      styles.container,
      { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }
    ]}>
      <View style={styles.left}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="radio" size={24} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Control Tower</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>System Dashboard</Text>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity 
          style={[styles.dropdown, { backgroundColor: colors.surfaceLight }]}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={[styles.dropdownText, { color: colors.textPrimary }]}>{selectedSystem}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <Animated.View 
            entering={SlideInDown.springify()}
            style={[
              styles.dropdownMenu, 
              shadows.card,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder }
            ]}
          >
            <Text style={[styles.dropdownTitle, { color: colors.textMuted }]}>Select System</Text>
            {systems.map((system) => (
              <TouchableOpacity
                key={system}
                style={[
                  styles.dropdownItem,
                  selectedSystem === system && { backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => {
                  setSelectedSystem(system);
                  setDropdownVisible(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  { color: colors.textPrimary },
                  selectedSystem === system && { color: colors.primary },
                ]}>
                  {system}
                </Text>
                {selectedSystem === system && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownMenu: {
    borderRadius: borderRadius.lg,
    padding: 8,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  dropdownItemText: {
    fontSize: 16,
  },
});
