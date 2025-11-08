import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { setupNetworkListener } from './src/lib/network-listener';

import DashboardScreen from './src/screens/DashboardScreen';
import NewTransactionScreen from './src/screens/NewTransactionScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
    },
  },
});

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    New: '➕',
    History: '📜',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
      {focused && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#2563eb',
            marginTop: 4,
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  useEffect(() => {
    const unsubscribe = setupNetworkListener();
    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => (
              <TabIcon name={route.name} focused={focused} />
            ),
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e2e8f0',
              paddingBottom: 8,
              paddingTop: 8,
              height: 70,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#e2e8f0',
            },
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#0f172a',
            },
          })}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Tab.Screen
            name="New"
            component={NewTransactionScreen}
            options={{ title: 'Novo Lançamento' }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: 'Histórico' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
