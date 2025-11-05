import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { generateUUID } from '@shared/utils';

const QUEUE_KEY = 'pending_transactions';

export interface PendingTransaction {
  tempId: string;
  type: string;
  amount: string;
  category_id: string;
  note?: string;
  date?: string;
  createdAt: string;
  status: 'pending' | 'failed';
}

// Get all pending transactions
export async function getPendingTransactions(): Promise<PendingTransaction[]> {
  try {
    const json = await AsyncStorage.getItem(QUEUE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Failed to get pending transactions:', error);
    return [];
  }
}

// Add transaction to offline queue
export async function addToOfflineQueue(transaction: Omit<PendingTransaction, 'tempId' | 'createdAt' | 'status'>) {
  const tempId = generateUUID();
  const pending: PendingTransaction = {
    ...transaction,
    tempId,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const queue = await getPendingTransactions();
  queue.push(pending);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  
  return tempId;
}

// Sync pending transactions when online
export async function syncPendingTransactions(apiBaseUrl: string): Promise<void> {
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected) {
    console.log('No network connection, skipping sync');
    return;
  }

  const queue = await getPendingTransactions();
  if (queue.length === 0) {
    return;
  }

  // Sort by createdAt to maintain order
  const sortedQueue = [...queue].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const results: PendingTransaction[] = [];

  for (const item of sortedQueue) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': item.tempId,
        },
        body: JSON.stringify({
          type: item.type,
          amount: item.amount,
          category_id: item.category_id,
          note: item.note,
          date: item.date,
        }),
      });

      if (response.ok) {
        // Successfully synced, don't add back to queue
        console.log('Synced transaction:', item.tempId);
      } else {
        // Failed, mark as failed and keep in queue
        results.push({ ...item, status: 'failed' });
        console.error('Failed to sync transaction:', item.tempId, response.status);
      }
    } catch (error) {
      // Network error, keep in queue
      results.push(item);
      console.error('Error syncing transaction:', item.tempId, error);
    }
  }

  // Update queue with only failed/unsent items
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(results));
}

// Clear all pending transactions (useful for testing or manual cleanup)
export async function clearPendingTransactions(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
