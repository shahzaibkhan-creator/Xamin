import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { SystemType } from '../lib/types';
import { exportToCSV, calculateStats } from '../lib/dataStore';

interface ExportModalProps {
  system: SystemType;
  visible: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ system, visible, onClose }) => {
  const { colors } = useAppContext();
  const { data } = useDataContext();
  const [showReport, setShowReport] = useState(false);

  const systemData = data[system.toLowerCase() as keyof typeof data] || [];
  const stats = calculateStats(data);

  const handleCSVExport = () => {
    const csv = exportToCSV(systemData, system);
    
    if (!csv) {
      Alert.alert('No Data', 'No data available to export.');
      return;
    }

    // For web, create downloadable file
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${system.toLowerCase()}_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Alert.alert('Success', 'CSV file downloaded!');
    } else {
      // For mobile, show the CSV content
      Alert.alert(
        'CSV Export',
        'CSV data ready. In a production app, this would save to your device.',
        [{ text: 'OK' }]
      );
    }
    
    onClose();
  };

  const handlePrintReport = () => {
    setShowReport(true);
  };

  const getSystemStats = () => {
    switch (system) {
      case 'Business':
        return [
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}` },
          { label: 'Total Entries', value: stats.businessEntries.toString() },
          { label: 'Avg Sale', value: stats.businessEntries > 0 ? `$${(stats.totalRevenue / stats.businessEntries).toFixed(2)}` : '$0' },
        ];
      case 'Finance':
        return [
          { label: 'Total Income', value: `$${stats.totalIncome.toLocaleString()}` },
          { label: 'Total Expense', value: `$${stats.totalExpense.toLocaleString()}` },
          { label: 'Net Profit', value: `$${stats.profit.toLocaleString()}` },
        ];
      case 'Project':
        return [
          { label: 'Total Tasks', value: stats.totalTasks.toString() },
          { label: 'Completed', value: stats.completedTasks.toString() },
          { label: 'Completion Rate', value: `${stats.taskCompletion}%` },
        ];
      case 'Social':
        return [
          { label: 'Total Followers', value: stats.totalFollowers.toLocaleString() },
          { label: 'Total Engagement', value: stats.totalEngagement.toLocaleString() },
          { label: 'Total Entries', value: stats.socialEntries.toString() },
        ];
      default:
        return [];
    }
  };

  const PrintableReport = () => (
    <ScrollView style={styles.reportContainer}>
      <View style={styles.reportContent}>
        {/* Report Header */}
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>Control Tower Report</Text>
          <Text style={styles.reportSubtitle}>{system} System Analysis</Text>
          <Text style={styles.reportDate}>
            Generated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Key Stats */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Key Statistics</Text>
          <View style={styles.statsGrid}>
            {getSystemStats().map((stat, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Data Summary */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Data Summary</Text>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Records</Text>
              <Text style={styles.summaryValue}>{systemData.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date Range</Text>
              <Text style={styles.summaryValue}>
                {systemData.length > 0 
                  ? `${systemData.length} entries` 
                  : 'No data'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Last Updated</Text>
              <Text style={styles.summaryValue}>
                {systemData.length > 0 
                  ? new Date(Math.max(...systemData.map((e: any) => e.createdAt))).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.reportFooter}>
          <Text style={styles.footerText}>Control Tower Dashboard</Text>
          <Text style={styles.footerText}>© {new Date().getFullYear()}</Text>
        </View>

        {/* Print Button */}
        <TouchableOpacity
          style={styles.printButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.print();
            } else {
              Alert.alert('Print', 'Use your device\'s print function to save as PDF');
            }
          }}
        >
          <Ionicons name="print" size={20} color="#fff" />
          <Text style={styles.printButtonText}>Print / Save as PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowReport(false)}
        >
          <Ionicons name="arrow-back" size={18} color="#666" />
          <Text style={styles.backButtonText}>Back to Export Options</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} transparent={!showReport} animationType="fade" onRequestClose={onClose}>
      {showReport ? (
        <PrintableReport />
      ) : (
        <View style={styles.overlay}>
          <Animated.View 
            entering={SlideInUp.springify()}
            style={[styles.container, { backgroundColor: colors.surface }]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.systemBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="download" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>Export Data</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>{system} System • {systemData.length} entries</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.options}>
              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: colors.surfaceLight }]}
                onPress={handleCSVExport}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="document-text" size={28} color={colors.success} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Download CSV</Text>
                  <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Excel-compatible spreadsheet</Text>
                </View>
                <Ionicons name="download" size={22} color={colors.success} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: colors.surfaceLight }]}
                onPress={handlePrintReport}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="print" size={28} color={colors.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Print Report</Text>
                  <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Clean PDF-ready format</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Quick Stats Preview */}
            <View style={[styles.previewBox, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.previewTitle, { color: colors.textSecondary }]}>Export Preview</Text>
              <View style={styles.previewStats}>
                {getSystemStats().map((stat, i) => (
                  <View key={i} style={styles.previewStat}>
                    <Text style={[styles.previewValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                    <Text style={[styles.previewLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    borderRadius: borderRadius.xl,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  options: {
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 14,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  previewBox: {
    padding: 16,
    borderRadius: borderRadius.lg,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewStat: {
    alignItems: 'center',
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  // Print Report Styles
  reportContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  reportContent: {
    padding: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  reportHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a2e',
    paddingBottom: 20,
    marginBottom: 30,
  },
  reportTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  reportSubtitle: {
    fontSize: 20,
    color: '#666',
    marginTop: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  reportSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4ff',
    paddingLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statBox: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#f5f7fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  summaryTable: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  reportFooter: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    gap: 8,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
