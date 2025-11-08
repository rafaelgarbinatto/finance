import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../lib/api';
import { offlineQueue } from '../lib/offline-queue';

interface Category {
  id: string;
  name: string;
  kind: string;
}

export default function NewTransactionScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/v1/categories'),
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const idempotencyKey = `${Date.now()}-${Math.random()}`;
      
      if (!isOnline) {
        // Queue for later
        await offlineQueue.enqueue({
          endpoint: '/api/v1/transactions',
          method: 'POST',
          data: {
            ...data,
            date: new Date().toISOString(),
          },
          idempotencyKey,
        });
        return null;
      }

      return api.post('/api/v1/transactions', {
        ...data,
        date: new Date().toISOString(),
      }, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message);
    },
  });

  const filteredCategories =
    categories?.filter((cat) => cat.kind === kind) || [];

  useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  const handleSubmit = () => {
    if (!amount || !categoryId) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const amountValue = parseFloat(amount).toFixed(2);
    mutation.mutate({
      amount: amountValue,
      kind,
      categoryId,
      note: note || undefined,
    });
  };

  if (!categories) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            📡 Offline - Será sincronizado quando conectar
          </Text>
        </View>
      )}

      {/* Amount */}
      <View style={styles.field}>
        <Text style={styles.label}>Valor</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>R$</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
          />
        </View>
      </View>

      {/* Kind Toggle */}
      <View style={styles.field}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              kind === 'INCOME' && styles.toggleButtonActiveIncome,
            ]}
            onPress={() => setKind('INCOME')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                kind === 'INCOME' && styles.toggleButtonTextActive,
              ]}
            >
              Receita
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              kind === 'EXPENSE' && styles.toggleButtonActiveExpense,
            ]}
            onPress={() => setKind('EXPENSE')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                kind === 'EXPENSE' && styles.toggleButtonTextActive,
              ]}
            >
              Despesa
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {filteredCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                categoryId === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  categoryId === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Note */}
      <View style={styles.field}>
        <Text style={styles.label}>Nota (opcional)</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Descrição do lançamento"
          maxLength={200}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Salvar Lançamento</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: '#92400e',
    textAlign: 'center',
    fontSize: 14,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 24,
    color: '#64748b',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    padding: 16,
    fontVariant: ['tabular-nums'],
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  toggleButtonActiveIncome: {
    backgroundColor: '#16a34a',
  },
  toggleButtonActiveExpense: {
    backgroundColor: '#dc2626',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
