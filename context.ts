import React, { createContext, useContext } from 'react';
import { SimulationParams, SystemType } from './types';
import { ThemeMode, ThemeColors } from './theme';

export interface AppContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  selectedSystem: SystemType;
  setSelectedSystem: (system: SystemType) => void;
  simulationParams: SimulationParams;
  setSimulationParams: (params: SimulationParams) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
