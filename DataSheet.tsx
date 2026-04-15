import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight, Layout } from 'react-native-reanimated';
import { borderRadius, getShadows } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { SystemType } from '../lib/types';
import { BusinessEntry, FinanceEntry, ProjectEntry, SocialEntry } from '../lib/dataStore';

interface DataSheetProps {
  system: SystemType;
}

type SortField = string;
type SortDirection = 'asc' | 'desc';

export const DataSheet: React.FC<DataSheetProps> = ({ system }) => {
  const { colors } = useAppContext();
  const { data, updateEntry, deleteEntry } = useDataContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const systemData = useMemo(() => {
    const key = system.toLowerCase() as keyof typeof data;
    return data[key] || [];
  }, [data, system]);

  const columns = useMemo(() => {
    switch (system) {
      case 'Business':
        return [
          { key: 'date', label: 'Date', width: 100 },
          { key: 'productName', label: 'Product', width: 120 },
          { key: 'quantity', label: 'Qty', width: 60 },
          { key: 'saleAmount', label: 'Amount', width: 90 },
        ];
      case 'Finance':
        return [
          { key: 'date', label: 'Date', width: 100 },
          { key: 'type', label: 'Type', width: 80 },
          { key: 'amount', label: 'Amount', width: 90 },
          { key: 'category', label: 'Category', width: 100 },
        ];
      case 'Project':
        return [
          { key: 'taskName', label: 'Task', width: 150 },
          { key: 'status', label: 'Status', width: 100 },
          { key: 'timeSpent', label: 'Hours', width: 70 },
        ];
      case 'Social':
        return [
          { key: 'date', label: 'Date', width: 100 },
          { key: 'platform', label: 'Platform', width: 100 },
          { key: 'followersGained', label: 'Followers', width: 80 },
          { key: 'likes', label: 'Likes', width: 70 },
          { key: 'comments', label: 'Comments', width: 80 },
        ];
      default:
        return [];
    }
  }, [system]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...systemData];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item: any) => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(query)
        );
      });
    }

    // Sort
    result.sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return result;
  }, [systemData, searchQuery, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const startEdit = (id: string, field: string, currentValue: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentValue));
  };

  const saveEdit = () => {
    if (editingCell) {
      let value: any = editValue;
      
      // Convert to appropriate type
      if (['quantity', 'saleAmount', 'amount', 'timeSpent', 'followersGained', 'likes', 'comments'].includes(editingCell.field)) {
        value = parseFloat(editValue) || 0;
      }
      
      updateEntry(system, editingCell.id, { [editingCell.field]: value });
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteEntry(system, id),
        },
      ]
    );
  };

  const formatValue = (value: any, field: string) => {
    if (field === 'saleAmount' || field === 'amount') {
      return `$${Number(value).toFixed(2)}`;
    }
    if (field === 'type') {
      return value === 'income' ? '↓ Income' : '↑ Expense';
    }
    if (field === 'status') {
      const statusMap: Record<string, string> = {
        'done': '✓ Done',
        'pending': '○ Pending',
        'in-progress': '◐ In Progress',
      };
      return statusMap[value] || value;
    }
    return String(value);
  };

  const renderCell = (item: any, column: { key: string; width: number }) => {
    const isEditing = editingCell?.id === item.id && editingCell?.field === column.key;
    const value = item[column.key];

    if (isEditing) {
      return (
        <View style={[styles.cell, { width: column.width }]}>
          <TextInput
            style={[
              styles.cellInput,
              { backgroundColor: colors.primary + '20', color: colors.textPrimary, borderColor: colors.primary }
            ]}
            value={editValue}
            onChangeText={setEditValue}
            onBlur={saveEdit}
            onSubmitEditing={saveEdit}
            autoFocus
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.cell, { width: column.width }]}
        onPress={() => startEdit(item.id, column.key, value)}
      >
        <Text 
          style={[
            styles.cellText, 
            { color: colors.textPrimary },
            column.key === 'type' && { color: value === 'income' ? colors.success : colors.error },
          ]} 
          numberOfLines={1}
        >
          {formatValue(value, column.key)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRow = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 30)}
      layout={Layout.springify()}
      style={[styles.row, { borderBottomColor: colors.cardBorder }]}
    >
      {columns.map(col => (
        <View key={col.key}>
          {renderCell(item, col)}
        </View>
      ))}
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </Animated.View>
  );

  if (systemData.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="document-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Data Yet</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Use the + button to add {system.toLowerCase()} data
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search entries..."
          placeholderTextColor={colors.textMuted}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Results count */}
      <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
        {filteredAndSortedData.length} of {systemData.length} entries
      </Text>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={[styles.headerRow, { backgroundColor: colors.surfaceLight }]}>
            {columns.map(col => (
              <TouchableOpacity
                key={col.key}
                style={[styles.headerCell, { width: col.width }]}
                onPress={() => handleSort(col.key)}
              >
                <Text style={[styles.headerText, { color: colors.textSecondary }]}>{col.label}</Text>
                {sortField === col.key && (
                  <Ionicons 
                    name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                    size={12} 
                    color={colors.primary} 
                  />
                )}
              </TouchableOpacity>
            ))}
            <View style={[styles.headerCell, { width: 44 }]} />
          </View>

          {/* Data Rows */}
          <FlatList
            data={filteredAndSortedData}
            keyExtractor={(item: any) => item.id}
            renderItem={renderRow}
            showsVerticalScrollIndicator={false}
            style={styles.dataList}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  resultsCount: {
    fontSize: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dataList: {
    maxHeight: 300,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cell: {
    padding: 10,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
  },
  cellInput: {
    padding: 6,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    fontSize: 13,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
