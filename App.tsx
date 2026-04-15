import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { DashboardScreen } from './screens/DashboardScreen';
import { SystemsScreen } from './screens/SystemsScreen';
import { SystemDetailScreen } from './screens/SystemDetailScreen';
import { SimulationScreen } from './screens/SimulationScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { DataSheetScreen } from './screens/DataSheetScreen';
import { AddDataFAB } from './components/AddDataFAB';
import { AppContext, AppContextType } from './lib/context';
import { DataProvider } from './lib/dataContext';
import { SimulationParams, SystemType } from './lib/types';
import { ThemeMode, getThemeColors } from './lib/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type TabIconName = 'grid' | 'grid-outline' | 'layers' | 'layers-outline' | 
  'analytics' | 'analytics-outline' | 'document-text' | 'document-text-outline' |
  'settings' | 'settings-outline' | 'folder' | 'folder-outline';

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
  route: string;
}

const getTabIcon = (routeName: string, focused: boolean): TabIconName => {
  switch (routeName) {
    case 'Dashboard':
      return focused ? 'grid' : 'grid-outline';
    case 'Systems':
      return focused ? 'layers' : 'layers-outline';
    case 'Simulation':
      return focused ? 'analytics' : 'analytics-outline';
    case 'Data':
      return focused ? 'folder' : 'folder-outline';
    case 'Settings':
      return focused ? 'settings' : 'settings-outline';
    default:
      return 'grid-outline';
  }
};

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, color, size, route }) => {
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 15 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={getTabIcon(route, focused)} size={size} color={color} />
    </Animated.View>
  );
};

function SystemsStack() {
  const { colors } = React.useContext(AppContext)!;
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SystemsList" component={SystemsScreen} />
      <Stack.Screen 
        name="SystemDetail" 
        component={SystemDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'System Details',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors } = React.useContext(AppContext)!;
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} color={color} size={size} route={route.name} />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.cardBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            position: 'absolute',
            elevation: 0,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Systems" component={SystemsStack} />
        <Tab.Screen name="Simulation" component={SimulationScreen} />
        <Tab.Screen name="Data" component={DataSheetScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <AddDataFAB />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [selectedSystem, setSelectedSystem] = useState<SystemType>('Business');
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    budget: 50,
    price: 50,
    workload: 50,
    engagementRate: 50,
  });

  const colors = useMemo(() => getThemeColors(themeMode), [themeMode]);

  const contextValue: AppContextType = {
    themeMode,
    setThemeMode,
    colors,
    selectedSystem,
    setSelectedSystem,
    simulationParams,
    setSimulationParams,
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar 
          barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} 
          backgroundColor={colors.background} 
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaProvider>
        <AppContext.Provider value={contextValue}>
          <DataProvider>
            <StatusBar 
              barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} 
              backgroundColor={colors.background} 
            />
            <NavigationContainer>
              <MainTabs />
            </NavigationContainer>
          </DataProvider>
        </AppContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
