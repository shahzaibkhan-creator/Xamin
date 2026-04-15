import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { SystemType } from '../lib/types';
import { generateId } from '../lib/dataStore';

interface BulkEntryModalProps {
  system: SystemType;
  visible: boolean;
  onClose: () => void;
}

interface BulkRow {
  id: string;
  values: string[];
}

const getColumns = (system: SystemType): string[] => {
  switch (system) {
    case 'Business': return ['Date', 'Product', 'Qty', 'Amount'];
    case 'Finance': return ['Date', 'Type', 'Amount', 'Category'];
    case 'Project': return ['Task', 'Status', 'Hours'];
    case 'Social': return ['Date', 'Platform', 'Followers', 'Likes', 'Comments'];
  }
};

const getDefaultRow = (system: SystemType): string[] => {
  const today = new Date().toISOString().split('T')[0];
  switch (system) {
    case 'Business': return [today, '', '0', '0'];
    case 'Finance': return [today, 'income', '0', ''];
    case 'Project': return ['', 'pending', '0'];
    case 'Social': return [today, '', '0', '0', '0'];
  }
};

export const BulkEntryModal: React.FC<BulkEntryModalProps> = ({ system, visible, onClose }) => {
  const { colors } = useAppContext();
  const { addBulkEntries } = useDataContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const [rows, setRows] = useState<BulkRow[]>([
    { id: generateId(), values: getDefaultRow(system) },
    { id: generateId(), values: getDefaultRow(system) },
    { id: generateId(), values: getDefaultRow(system) },
  ]);

  const columns = getColumns(system);

  const addRow = () => {
    setRows([...rows, { id: generateId(), values: getDefaultRow(system) }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateCell = (rowId: string, colIndex: number, value: string) => {
    setRows(rows.map(row => 
      row.id === rowId 
        ? { ...row, values: row.values.map((v, i) => i === colIndex ? value : v) }
        : row
    ));
  };

  const handleSubmit = () => {
    const entries = rows.map(row => {
      const v = row.values;
      switch (system) {
        case 'Business':
          return {
            id: generateId(),
            date: v[0] || new Date().toISOString().split('T')[0],
            productName: v[1] || 'Unknown',
            quantity: parseInt(v[2]) || 0,
            saleAmount: parseFloat(v[3]) || 0,
            createdAt: Date.now(),
          };
        case 'Finance':
          return {
            id: generateId(),
            date: v[0] || new Date().toISOString().split('T')[0],
            type: v[1] === 'expense' ? 'expense' : 'income',
            amount: parseFloat(v[2]) || 0,
            category: v[3] || 'General',
            createdAt: Date.now(),
          };
        case 'Project':
          return {
            id: generateId(),
            taskName: v[0] || 'Untitled',
            status: (['done', 'pending', 'in-progress'].includes(v[1]) ? v[1] : 'pending'),
            timeSpent: parseFloat(v[2]) || 0,
            createdAt: Date.now(),
          };
        case 'Social':
          return {
            id: generateId(),
            date: v[0] || new Date().toISOString().split('T')[0],
            platform: v[1] || 'Unknown',
            followersGained: parseInt(v[2]) || 0,
            likes: parseInt(v[3]) || 0,
            comments: parseInt(v[4]) || 0,
            createdAt: Date.now(),
          };
      }
    }).filter(e => e !== null);

    addBulkEntries(system, entries);
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setRows([
        { id: generateId(), values: getDefaultRow(system) },
        { id: generateId(), values: getDefaultRow(system) },
        { id: generateId(), values: getDefaultRow(system) },
      ]);
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Animated.View 
          entering={SlideInUp.springify()}
          style={[styles.container, { backgroundColor: colors.surface }]}
        >
          {showSuccess ? (
            <Animated.View entering={FadeIn} style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              </View>
              <Text style={[styles.successText, { color: colors.textPrimary }]}>
                {rows.length} Entries Added!
              </Text>
              <Text style={[styles.successSubtext, { color: colors.textSecondary }]}>{system} data updated</Text>
            </Animated.View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.systemBadge, { backgroundColor: colors.secondary + '20' }]}>
                    <Ionicons name="grid" size={20} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Bulk Entry</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{system} System</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Header Row */}
                  <View style={styles.tableRow}>
                    {columns.map((col, i) => (
                      <View key={i} style={[styles.headerCell, { backgroundColor: colors.surfaceLight }]}>
                        <Text style={[styles.headerText, { color: colors.textSecondary }]}>{col}</Text>
                      </View>
                    ))}
                    <View style={[styles.actionCell, { backgroundColor: colors.surfaceLight }]} />
                  </View>

                  {/* Data Rows */}
                  <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
                    {rows.map((row, rowIndex) => (
                      <View key={row.id} style={styles.tableRow}>
                        {row.values.map((value, colIndex) => (
                          <TextInput
                            key={colIndex}
                            style={[
                              styles.cell,
                              { 
                                backgroundColor: colors.background,
                                color: colors.textPrimary,
                                borderColor: colors.cardBorder,
                              }
                            ]}
                            value={value}
                            onChangeText={(v) => updateCell(row.id, colIndex, v)}
                            placeholder="..."
                            placeholderTextColor={colors.textMuted}
                          />
                        ))}
                        <TouchableOpacity
                          style={[styles.actionCell, { backgroundColor: colors.error + '20' }]}
                          onPress={() => removeRow(row.id)}
                        >
                          <Ionicons name="trash" size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.addRowButton, { borderColor: colors.cardBorder }]}
                onPress={addRow}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={[styles.addRowText, { color: colors.primary }]}>Add Row</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
              >
                <Ionicons name="cloud-upload" size={22} color="#fff" />
                <Text style={styles.submitText}>Save All ({rows.length} entries)</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    borderRadius: borderRadius.xl,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  systemBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
  tableRow: {
    flexDirection: 'row',
  },
  headerCell: {
    width: 90,
    padding: 10,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginRight: 4,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableBody: {
    maxHeight: 250,
  },
  cell: {
    width: 90,
    padding: 10,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    marginRight: 4,
    marginBottom: 4,
    fontSize: 13,
    textAlign: 'center',
  },
  actionCell: {
    width: 44,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    marginTop: 12,
    gap: 6,
  },
  addRowText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    marginTop: 16,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
  },
});
