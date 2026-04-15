import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { SystemType } from '../lib/types';
import { parseCSV } from '../lib/dataStore';

interface CSVImportModalProps {
  system: SystemType;
  visible: boolean;
  onClose: () => void;
}

const getCSVTemplate = (system: SystemType): string => {
  switch (system) {
    case 'Business':
      return 'date,product,quantity,amount\n2024-01-15,Widget A,10,250.00\n2024-01-16,Widget B,5,125.00';
    case 'Finance':
      return 'date,type,amount,category\n2024-01-15,income,5000,Salary\n2024-01-16,expense,150,Food';
    case 'Project':
      return 'task,status,hours\nDesign mockups,done,8\nImplement API,in-progress,4';
    case 'Social':
      return 'date,platform,followers,likes,comments\n2024-01-15,Twitter,50,200,30\n2024-01-16,Instagram,100,500,45';
  }
};

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ system, visible, onClose }) => {
  const { colors } = useAppContext();
  const { addBulkEntries } = useDataContext();
  const [csvText, setCsvText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [entriesCount, setEntriesCount] = useState(0);
  const [error, setError] = useState('');

  const handleImport = () => {
    setError('');
    
    if (!csvText.trim()) {
      setError('Please paste CSV data');
      return;
    }

    try {
      const entries = parseCSV(csvText, system);
      
      if (entries.length === 0) {
        setError('No valid entries found. Check CSV format.');
        return;
      }

      addBulkEntries(system, entries);
      setEntriesCount(entries.length);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setCsvText('');
        onClose();
      }, 1500);
    } catch (e) {
      setError('Error parsing CSV. Please check format.');
    }
  };

  const loadTemplate = () => {
    setCsvText(getCSVTemplate(system));
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
                {entriesCount} Entries Imported!
              </Text>
              <Text style={[styles.successSubtext, { color: colors.textSecondary }]}>{system} data updated</Text>
            </Animated.View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.systemBadge, { backgroundColor: colors.tertiary + '20' }]}>
                    <Ionicons name="document-text" size={20} color={colors.tertiary} />
                  </View>
                  <View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>CSV Import</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{system} System</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.instructions}>
                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                  Paste your CSV data below. First row should be headers.
                </Text>
                <TouchableOpacity onPress={loadTemplate}>
                  <Text style={[styles.templateLink, { color: colors.primary }]}>Load template</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.textArea,
                  { 
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: error ? colors.error : colors.cardBorder,
                  }
                ]}
                value={csvText}
                onChangeText={setCsvText}
                placeholder={getCSVTemplate(system)}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}

              <View style={[styles.helpBox, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name="information-circle" size={18} color={colors.info} />
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  Supported columns: {getCSVTemplate(system).split('\n')[0]}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleImport}
              >
                <Ionicons name="cloud-upload" size={22} color="#fff" />
                <Text style={styles.submitText}>Import Data</Text>
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
    padding: 20,
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
    marginBottom: 16,
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
  instructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 13,
    flex: 1,
  },
  templateLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: 14,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 180,
    marginBottom: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 8,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
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
