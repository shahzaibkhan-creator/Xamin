import AsyncStorage from '@react-native-async-storage/async-storage';
import { SystemType } from './types';

export interface BusinessEntry {
  id: string;
  date: string;
  productName: string;
  quantity: number;
  saleAmount: number;
  createdAt: number;
}

export interface FinanceEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  createdAt: number;
}

export interface ProjectEntry {
  id: string;
  taskName: string;
  status: 'done' | 'pending' | 'in-progress';
  timeSpent: number; // in hours
  createdAt: number;
}

export interface SocialEntry {
  id: string;
  date: string;
  platform: string;
  followersGained: number;
  likes: number;
  comments: number;
  createdAt: number;
}

export type DataEntry = BusinessEntry | FinanceEntry | ProjectEntry | SocialEntry;

export interface AppData {
  business: BusinessEntry[];
  finance: FinanceEntry[];
  project: ProjectEntry[];
  social: SocialEntry[];
}

const STORAGE_KEY = 'control_tower_data_v2'; // Changed key to force fresh start
const VERSION_KEY = 'control_tower_version';
const CURRENT_VERSION = '2.0.0'; // Increment to force data reset

const defaultData: AppData = {
  business: [],
  finance: [],
  project: [],
  social: [],
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const loadData = async (): Promise<AppData> => {
  try {
    // Check version - if different, clear old data
    const storedVersion = await AsyncStorage.getItem(VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      // Clear all old data and set new version
      await AsyncStorage.removeItem('control_tower_data'); // Old key
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return defaultData;
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all arrays exist
      return {
        business: parsed.business || [],
        finance: parsed.finance || [],
        project: parsed.project || [],
        social: parsed.social || [],
      };
    }
    return defaultData;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export const saveData = async (data: AppData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem('control_tower_data'); // Also clear old key
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

export const parseCSV = (csv: string, system: SystemType): DataEntry[] => {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const entries: DataEntry[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;
    
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    
    try {
      switch (system) {
        case 'Business':
          entries.push({
            id: generateId(),
            date: row.date || new Date().toISOString().split('T')[0],
            productName: row.product || row.productname || row['product name'] || 'Unknown',
            quantity: parseInt(row.quantity || row.qty || '0') || 0,
            saleAmount: parseFloat(row.amount || row.sale || row.saleamount || '0') || 0,
            createdAt: Date.now(),
          } as BusinessEntry);
          break;
        case 'Finance':
          entries.push({
            id: generateId(),
            date: row.date || new Date().toISOString().split('T')[0],
            type: (row.type || 'income').toLowerCase() === 'expense' ? 'expense' : 'income',
            amount: parseFloat(row.amount || '0') || 0,
            category: row.category || 'General',
            createdAt: Date.now(),
          } as FinanceEntry);
          break;
        case 'Project':
          entries.push({
            id: generateId(),
            taskName: row.task || row.taskname || row['task name'] || 'Untitled Task',
            status: (['done', 'pending', 'in-progress'].includes((row.status || '').toLowerCase()) 
              ? row.status.toLowerCase() : 'pending') as 'done' | 'pending' | 'in-progress',
            timeSpent: parseFloat(row.time || row.timespent || row.hours || '0') || 0,
            createdAt: Date.now(),
          } as ProjectEntry);
          break;
        case 'Social':
          entries.push({
            id: generateId(),
            date: row.date || new Date().toISOString().split('T')[0],
            platform: row.platform || 'Unknown',
            followersGained: parseInt(row.followers || row.followersgained || '0') || 0,
            likes: parseInt(row.likes || '0') || 0,
            comments: parseInt(row.comments || '0') || 0,
            createdAt: Date.now(),
          } as SocialEntry);
          break;
      }
    } catch (e) {
      console.error('Error parsing row:', e);
    }
  }
  
  return entries;
};

export const exportToCSV = (data: DataEntry[], system: SystemType): string => {
  if (data.length === 0) return '';
  
  let headers: string[] = [];
  let rows: string[][] = [];
  
  switch (system) {
    case 'Business':
      headers = ['Date', 'Product Name', 'Quantity', 'Sale Amount'];
      rows = (data as BusinessEntry[]).map(e => [
        e.date,
        e.productName,
        e.quantity.toString(),
        e.saleAmount.toString(),
      ]);
      break;
    case 'Finance':
      headers = ['Date', 'Type', 'Amount', 'Category'];
      rows = (data as FinanceEntry[]).map(e => [
        e.date,
        e.type,
        e.amount.toString(),
        e.category,
      ]);
      break;
    case 'Project':
      headers = ['Task Name', 'Status', 'Time Spent (hours)'];
      rows = (data as ProjectEntry[]).map(e => [
        e.taskName,
        e.status,
        e.timeSpent.toString(),
      ]);
      break;
    case 'Social':
      headers = ['Date', 'Platform', 'Followers Gained', 'Likes', 'Comments'];
      rows = (data as SocialEntry[]).map(e => [
        e.date,
        e.platform,
        e.followersGained.toString(),
        e.likes.toString(),
        e.comments.toString(),
      ]);
      break;
  }
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
};

export const calculateStats = (data: AppData) => {
  const business = data.business || [];
  const finance = data.finance || [];
  const project = data.project || [];
  const social = data.social || [];
  
  const totalRevenue = business.reduce((sum, e) => sum + e.saleAmount, 0);
  const totalIncome = finance.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = finance.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const completedTasks = project.filter(e => e.status === 'done').length;
  const totalTasks = project.length;
  const totalFollowers = social.reduce((sum, e) => sum + e.followersGained, 0);
  const totalEngagement = social.reduce((sum, e) => sum + e.likes + e.comments, 0);
  
  return {
    totalRevenue,
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
    completedTasks,
    totalTasks,
    taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalFollowers,
    totalEngagement,
    businessEntries: business.length,
    financeEntries: finance.length,
    projectEntries: project.length,
    socialEntries: social.length,
  };
};
