import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp, FadeOut } from 'react-native-reanimated';
import { borderRadius } from '../lib/theme';
import { useAppContext } from '../lib/context';
import { useDataContext } from '../lib/dataContext';
import { SystemType } from '../lib/types';

interface QuickEntryModalProps {
  system: SystemType;
  visible: boolean;
  onClose: () => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({ system, visible, onClose }) => {
  const { colors } = useAppContext();
  const { addBusinessEntry, addFinanceEntry, addProjectEntry, addSocialEntry } = useDataContext();
  const [showSuccess, setShowSuccess] = useState(false);

  // Business fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [saleAmount, setSaleAmount] = useState('');

  // Finance fields
  const [financeType, setFinanceType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  // Project fields
  const [taskName, setTaskName] = useState('');
  const [status, setStatus] = useState<'done' | 'pending' | 'in-progress'>('pending');
  const [timeSpent, setTimeSpent] = useState('');

  // Social fields
  const [platform, setPlatform] = useState('');
  const [followersGained, setFollowersGained] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');

  const resetFields = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setProductName('');
    setQuantity('');
    setSaleAmount('');
    setFinanceType('income');
    setAmount('');
    setCategory('');
    setTaskName('');
    setStatus('pending');
    setTimeSpent('');
    setPlatform('');
    setFollowersGained('');
    setLikes('');
    setComments('');
  };

  const handleSubmit = () => {
    switch (system) {
      case 'Business':
        if (!productName || !quantity || !saleAmount) return;
        addBusinessEntry({
          date,
          productName,
          quantity: parseInt(quantity) || 0,
          saleAmount: parseFloat(saleAmount) || 0,
        });
        break;
      case 'Finance':
        if (!amount || !category) return;
        addFinanceEntry({
          date,
          type: financeType,
          amount: parseFloat(amount) || 0,
          category,
        });
        break;
      case 'Project':
        if (!taskName) return;
        addProjectEntry({
          taskName,
          status,
          timeSpent: parseFloat(timeSpent) || 0,
        });
        break;
      case 'Social':
        if (!platform) return;
        addSocialEntry({
          date,
          platform,
          followersGained: parseInt(followersGained) || 0,
          likes: parseInt(likes) || 0,
          comments: parseInt(comments) || 0,
        });
        break;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      resetFields();
      onClose();
    }, 1500);
  };

  const renderBusinessForm = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Product Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Sale Amount ($)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={saleAmount}
            onChangeText={setSaleAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </>
  );

  const renderFinanceForm = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: financeType === 'income' ? colors.success : colors.surfaceLight }
            ]}
            onPress={() => setFinanceType('income')}
          >
            <Ionicons name="arrow-down" size={18} color={financeType === 'income' ? '#fff' : colors.textMuted} />
            <Text style={[styles.toggleText, { color: financeType === 'income' ? '#fff' : colors.textMuted }]}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: financeType === 'expense' ? colors.error : colors.surfaceLight }
            ]}
            onPress={() => setFinanceType('expense')}
          >
            <Ionicons name="arrow-up" size={18} color={financeType === 'expense' ? '#fff' : colors.textMuted} />
            <Text style={[styles.toggleText, { color: financeType === 'expense' ? '#fff' : colors.textMuted }]}>Expense</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Amount ($)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Salary, Food"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
    </>
  );

  const renderProjectForm = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Task Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
          value={taskName}
          onChangeText={setTaskName}
          placeholder="Enter task name"
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
        <View style={styles.toggleRow}>
          {(['pending', 'in-progress', 'done'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusButton,
                { 
                  backgroundColor: status === s ? 
                    (s === 'done' ? colors.success : s === 'in-progress' ? colors.warning : colors.tertiary) 
                    : colors.surfaceLight 
                }
              ]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.statusText, { color: status === s ? '#fff' : colors.textMuted }]}>
                {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Time Spent (hours)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
          value={timeSpent}
          onChangeText={setTimeSpent}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />
      </View>
    </>
  );

  const renderSocialForm = () => (
    <>
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Platform</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={platform}
            onChangeText={setPlatform}
            placeholder="e.g. Twitter"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Followers Gained</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
          value={followersGained}
          onChangeText={setFollowersGained}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Likes</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={likes}
            onChangeText={setLikes}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Comments</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            value={comments}
            onChangeText={setComments}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>
      </View>
    </>
  );

  const renderForm = () => {
    switch (system) {
      case 'Business': return renderBusinessForm();
      case 'Finance': return renderFinanceForm();
      case 'Project': return renderProjectForm();
      case 'Social': return renderSocialForm();
    }
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
              <Text style={[styles.successText, { color: colors.textPrimary }]}>Data Added Successfully!</Text>
              <Text style={[styles.successSubtext, { color: colors.textSecondary }]}>{system} data updated</Text>
            </Animated.View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.systemBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="flash" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Quick Entry</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{system} System</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                {renderForm()}
              </ScrollView>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
              >
                <Ionicons name="add-circle" size={22} color="#fff" />
                <Text style={styles.submitText}>Add Entry</Text>
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
    maxHeight: '80%',
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
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
