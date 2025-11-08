import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatCurrencyDisplay, formatDateDisplay } from '@financas-a-dois/shared';

interface DashboardData {
  income: string;
  expense: string;
  balance: string;
  topCategories: Array<{
    name: string;
    amount: string;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: string;
    kind: string;
    note: string | null;
    date: string;
    category: {
      name: string;
    };
  }>;
}

export default function DashboardScreen({ navigation }: any) {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/api/v1/dashboard'),
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
      </View>
    );
  }

  if (!data) return null;

  const balance = parseFloat(data.balance);
  const balanceColor = balance >= 0 ? '#16a34a' : '#dc2626';

  return (
    <ScrollView style={styles.container}>
      {/* KPIs */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Receitas</Text>
          <Text style={[styles.kpiValue, { color: '#16a34a' }]}>
            {formatCurrencyDisplay(data.income)}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Despesas</Text>
          <Text style={[styles.kpiValue, { color: '#dc2626' }]}>
            {formatCurrencyDisplay(data.expense)}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Saldo</Text>
          <Text style={[styles.kpiValue, { color: balanceColor }]}>
            {formatCurrencyDisplay(data.balance)}
          </Text>
        </View>
      </View>

      {/* Top Categories */}
      {data.topCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Principais Categorias</Text>
          {data.topCategories.map((cat) => (
            <View key={cat.name} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrencyDisplay(cat.amount)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${cat.percentage}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lançamentos Recentes</Text>
        {data.recentTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
        ) : (
          data.recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>
                  {transaction.category.name}
                </Text>
                {transaction.note && (
                  <Text style={styles.transactionNote}>{transaction.note}</Text>
                )}
                <Text style={styles.transactionDate}>
                  {formatDateDisplay(transaction.date)}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.kind === 'INCOME' ? '#16a34a' : '#dc2626',
                  },
                ]}
              >
                {transaction.kind === 'INCOME' ? '+' : '-'}
                {formatCurrencyDisplay(transaction.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
  kpiContainer: {
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
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
    color: '#475569',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
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
    borderBottomColor: '#e2e8f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    paddingVertical: 32,
  },
});
