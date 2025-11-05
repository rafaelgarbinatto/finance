import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@shared/utils';
import { fetchApi } from '../lib/api';
import { syncPendingTransactions, API_BASE_URL } from '../lib/offlineQueue';

interface DashboardData {
  income: string;
  expense: string;
  balance: string;
  top_categories: Array<{
    name: string;
    amount: string;
    percentage: number;
  }>;
  recent: Array<{
    id: string;
    type: string;
    amount: string;
    category_name: string;
    note?: string;
    date: string;
  }>;
}

async function fetchDashboard(): Promise<DashboardData> {
  return fetchApi('/api/v1/dashboard');
}

export default function DashboardScreen() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  // Sync pending transactions on mount
  useEffect(() => {
    syncPendingTransactions(API_BASE_URL).catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {/* KPIs */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Receitas</Text>
          <Text style={[styles.kpiValue, styles.incomeText]}>
            {formatCurrency(data!.income)}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Despesas</Text>
          <Text style={[styles.kpiValue, styles.expenseText]}>
            {formatCurrency(data!.expense)}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Saldo</Text>
          <Text style={[
            styles.kpiValue,
            parseFloat(data!.balance) >= 0 ? styles.incomeText : styles.expenseText
          ]}>
            {formatCurrency(data!.balance)}
          </Text>
        </View>
      </View>

      {/* Top Categories */}
      {data!.top_categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Principais Categorias</Text>
          {data!.top_categories.map((cat) => (
            <View key={cat.name} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(cat.amount)} ({cat.percentage}%)
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${cat.percentage}%` }]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recentes</Text>
        {data!.recent.map((txn) => (
          <View key={txn.id} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionCategory}>{txn.category_name}</Text>
              {txn.note && <Text style={styles.transactionNote}>{txn.note}</Text>}
              <Text style={styles.transactionDate}>{txn.date}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              txn.type === 'INCOME' ? styles.incomeText : styles.expenseText
            ]}>
              {txn.type === 'INCOME' ? '+' : '-'} {formatCurrency(txn.amount)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#dc2626',
  },
  retryButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
