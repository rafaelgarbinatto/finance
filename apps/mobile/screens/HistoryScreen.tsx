import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@shared/utils';
import { fetchApi } from '../lib/api';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  category_name: string;
  note?: string;
  date: string;
}

interface TransactionsResponse {
  items: Transaction[];
  next_cursor: string | null;
}

async function fetchTransactions(type?: string): Promise<TransactionsResponse> {
  const url = type
    ? `/api/v1/transactions?type=${type}&limit=50`
    : '/api/v1/transactions?limit=50';
  return fetchApi(url);
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => fetchTransactions(filter === 'all' ? undefined : filter),
  });

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionCategory}>{item.category_name}</Text>
        {item.note && <Text style={styles.transactionNote}>{item.note}</Text>}
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === 'INCOME' ? styles.incomeText : styles.expenseText,
        ]}
      >
        {item.type === 'INCOME' ? '+' : '-'} {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'income' && styles.filterButtonIncomeActive,
          ]}
          onPress={() => setFilter('income')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'income' && styles.filterButtonTextActive,
            ]}
          >
            Receitas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'expense' && styles.filterButtonExpenseActive,
          ]}
          onPress={() => setFilter('expense')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'expense' && styles.filterButtonTextActive,
            ]}
          >
            Despesas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      {error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Erro ao carregar transações</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && data && data.items.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
        </View>
      )}

      {!error && data && data.items.length > 0 && (
        <FlatList
          data={data.items}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonIncomeActive: {
    backgroundColor: '#16a34a',
  },
  filterButtonExpenseActive: {
    backgroundColor: '#dc2626',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    textAlign: 'right',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
});
