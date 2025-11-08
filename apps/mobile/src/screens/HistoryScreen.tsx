import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatCurrencyDisplay, formatDateDisplay } from '@financas-a-dois/shared';

interface Transaction {
  id: string;
  amount: string;
  kind: string;
  note: string | null;
  date: string;
  category: {
    name: string;
  };
}

interface PaginatedTransactions {
  data: Transaction[];
  nextCursor?: string;
  hasMore: boolean;
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const { data, isLoading } = useQuery<PaginatedTransactions>({
    queryKey: ['transactions', filter],
    queryFn: () => {
      const params = filter !== 'ALL' ? `?kind=${filter}` : '';
      return api.get<PaginatedTransactions>(`/api/v1/transactions${params}`);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ALL' && styles.filterButtonActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'ALL' && styles.filterButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'INCOME' && styles.filterButtonActiveIncome,
          ]}
          onPress={() => setFilter('INCOME')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'INCOME' && styles.filterButtonTextActive,
            ]}
          >
            Receitas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'EXPENSE' && styles.filterButtonActiveExpense,
          ]}
          onPress={() => setFilter('EXPENSE')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'EXPENSE' && styles.filterButtonTextActive,
            ]}
          >
            Despesas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.list}>
        {!data || data.data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
          </View>
        ) : (
          data.data.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <View style={styles.categoryRow}>
                  <View
                    style={[
                      styles.kindIndicator,
                      {
                        backgroundColor:
                          transaction.kind === 'INCOME' ? '#16a34a' : '#dc2626',
                      },
                    ]}
                  />
                  <Text style={styles.categoryName}>
                    {transaction.category.name}
                  </Text>
                </View>
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
                    color: transaction.kind === 'INCOME' ? '#16a34a' : '#dc2626',
                  },
                ]}
              >
                {transaction.kind === 'INCOME' ? '+' : '-'}
                {formatCurrencyDisplay(transaction.amount)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonActiveIncome: {
    backgroundColor: '#16a34a',
  },
  filterButtonActiveExpense: {
    backgroundColor: '#dc2626',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  transactionInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  kindIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  transactionNote: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    marginLeft: 16,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 16,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
