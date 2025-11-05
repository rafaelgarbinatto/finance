import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import DashboardScreen from './screens/DashboardScreen';
import NewTransactionScreen from './screens/NewTransactionScreen';
import HistoryScreen from './screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#9ca3af',
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Finanças a Dois',
              tabBarLabel: 'Dashboard',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📊</Text>,
            }}
          />
          <Tab.Screen
            name="New"
            component={NewTransactionScreen}
            options={{
              title: 'Novo Lançamento',
              tabBarLabel: '+ Lançar',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>➕</Text>,
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: 'Histórico',
              tabBarLabel: 'Histórico',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📝</Text>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
