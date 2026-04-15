import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppData, BusinessEntry, FinanceEntry, ProjectEntry, SocialEntry, loadData, saveData, generateId, clearAllData } from './dataStore';
import { SystemType } from './types';

interface DataContextType {
  data: AppData;
  isLoading: boolean;
  addBusinessEntry: (entry: Omit<BusinessEntry, 'id' | 'createdAt'>) => void;
  addFinanceEntry: (entry: Omit<FinanceEntry, 'id' | 'createdAt'>) => void;
  addProjectEntry: (entry: Omit<ProjectEntry, 'id' | 'createdAt'>) => void;
  addSocialEntry: (entry: Omit<SocialEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (system: SystemType, id: string, updates: Partial<any>) => void;
  deleteEntry: (system: SystemType, id: string) => void;
  addBulkEntries: (system: SystemType, entries: any[]) => void;
  clearSystemData: (system: SystemType) => void;
  clearAllData: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    business: [],
    finance: [],
    project: [],
    social: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const loaded = await loadData();
    setData(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  const addBusinessEntry = useCallback((entry: Omit<BusinessEntry, 'id' | 'createdAt'>) => {
    const newEntry: BusinessEntry = {
      ...entry,
      id: generateId(),
      createdAt: Date.now(),
    };
    setData(prev => ({
      ...prev,
      business: [newEntry, ...prev.business],
    }));
  }, []);

  const addFinanceEntry = useCallback((entry: Omit<FinanceEntry, 'id' | 'createdAt'>) => {
    const newEntry: FinanceEntry = {
      ...entry,
      id: generateId(),
      createdAt: Date.now(),
    };
    setData(prev => ({
      ...prev,
      finance: [newEntry, ...prev.finance],
    }));
  }, []);

  const addProjectEntry = useCallback((entry: Omit<ProjectEntry, 'id' | 'createdAt'>) => {
    const newEntry: ProjectEntry = {
      ...entry,
      id: generateId(),
      createdAt: Date.now(),
    };
    setData(prev => ({
      ...prev,
      project: [newEntry, ...prev.project],
    }));
  }, []);

  const addSocialEntry = useCallback((entry: Omit<SocialEntry, 'id' | 'createdAt'>) => {
    const newEntry: SocialEntry = {
      ...entry,
      id: generateId(),
      createdAt: Date.now(),
    };
    setData(prev => ({
      ...prev,
      social: [newEntry, ...prev.social],
    }));
  }, []);

  const updateEntry = useCallback((system: SystemType, id: string, updates: Partial<any>) => {
    const key = system.toLowerCase() as keyof AppData;
    setData(prev => ({
      ...prev,
      [key]: prev[key].map((entry: any) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  }, []);

  const deleteEntry = useCallback((system: SystemType, id: string) => {
    const key = system.toLowerCase() as keyof AppData;
    setData(prev => ({
      ...prev,
      [key]: prev[key].filter((entry: any) => entry.id !== id),
    }));
  }, []);

  const addBulkEntries = useCallback((system: SystemType, entries: any[]) => {
    const key = system.toLowerCase() as keyof AppData;
    const newEntries = entries.map(entry => ({
      ...entry,
      id: entry.id || generateId(),
      createdAt: entry.createdAt || Date.now(),
    }));
    setData(prev => ({
      ...prev,
      [key]: [...newEntries, ...prev[key]],
    }));
  }, []);

  const clearSystemData = useCallback((system: SystemType) => {
    const key = system.toLowerCase() as keyof AppData;
    setData(prev => ({
      ...prev,
      [key]: [],
    }));
  }, []);

  const handleClearAllData = useCallback(async () => {
    await clearAllData();
    setData({
      business: [],
      finance: [],
      project: [],
      social: [],
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        isLoading,
        addBusinessEntry,
        addFinanceEntry,
        addProjectEntry,
        addSocialEntry,
        updateEntry,
        deleteEntry,
        addBulkEntries,
        clearSystemData,
        clearAllData: handleClearAllData,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
