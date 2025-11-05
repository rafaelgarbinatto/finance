import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { parseCurrency } from '@shared/utils';
import { fetchApi } from '../lib/api';
import { addToOfflineQueue, syncPendingTransactions, API_BASE_URL } from '../lib/offlineQueue';

interface Category {
  id: string;
  name: string;
  kind: string;
}

async function fetchCategories(kind: string): Promise<Category[]> {
  return fetchApi(`/api/v1/categories?kind=${kind}`);
}

async function createTransaction(data: any) {
  return fetchApi('/api/v1/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export default function NewTransactionScreen({ navigation }: any) {
  const queryClient = useQueryClient();

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => fetchCategories(type.toLowerCase()),
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert('Sucesso', 'Transação salva com sucesso');
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const handleSubmit = async () => {
    if (!amount || !categoryId) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const parsedAmount = parseCurrency(amount);
    const transactionData = {
      type,
      amount: parsedAmount,
      category_id: categoryId,
      note: note || undefined,
    };

    if (!isOnline) {
      // Add to offline queue
      try {
        await addToOfflineQueue(transactionData);
        Alert.alert(
          'Salvo offline',
          'Sua transação será enviada quando você estiver online',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } catch (error) {
        Alert.alert('Erro', 'Falha ao salvar transação offline');
      }
    } else {
      // Try to sync any pending transactions first
      await syncPendingTransactions(API_BASE_URL).catch(console.error);
      // Submit online
      mutation.mutate(transactionData);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📵 Modo offline</Text>
        </View>
      )}

      {/* Type Toggle */}
      <View style={styles.section}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'EXPENSE' && styles.typeButtonExpenseActive,
            ]}
            onPress={() => {
              setType('EXPENSE');
              setCategoryId('');
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'EXPENSE' && styles.typeButtonTextActive,
              ]}
            >
              Despesa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'INCOME' && styles.typeButtonIncomeActive,
            ]}
            onPress={() => {
              setType('INCOME');
              setCategoryId('');
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'INCOME' && styles.typeButtonTextActive,
              ]}
            >
              Receita
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.section}>
        <Text style={styles.label}>Valor *</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />
      </View>

      {/* Category */}
      <View style={styles.section}>
        <Text style={styles.label}>Categoria *</Text>
        {isLoading ? (
          <Text style={styles.loadingText}>Carregando categorias...</Text>
        ) : (
          <View style={styles.categoryList}>
            {categories?.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  categoryId === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    categoryId === cat.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Note */}
      <View style={styles.section}>
        <Text style={styles.label}>Nota (opcional)</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Adicione uma nota..."
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={mutation.isPending}
      >
        <Text style={styles.submitButtonText}>
          {mutation.isPending ? 'Salvando...' : 'Salvar'}
        </Text>
      </TouchableOpacity>
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
  offlineBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#92400e',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonExpenseActive: {
    backgroundColor: '#dc2626',
  },
  typeButtonIncomeActive: {
    backgroundColor: '#16a34a',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
