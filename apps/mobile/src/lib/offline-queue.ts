import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = '@financas-a-dois:offline-queue';

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  data?: any;
  idempotencyKey?: string;
  timestamp: number;
}

class OfflineQueue {
  private processing = false;

  async enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp'>): Promise<void> {
    const queue = await this.getQueue();
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    queue.push(queuedRequest);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  async getQueue(): Promise<QueuedRequest[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async processQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    const queue = await this.getQueue();
    const failedRequests: QueuedRequest[] = [];

    for (const request of queue) {
      try {
        switch (request.method) {
          case 'POST':
            await api.post(
              request.endpoint,
              request.data,
              request.idempotencyKey
            );
            break;
          case 'PATCH':
            await api.patch(request.endpoint, request.data);
            break;
          case 'DELETE':
            await api.delete(request.endpoint);
            break;
        }
      } catch (error) {
        console.error('Failed to process queued request:', error);
        failedRequests.push(request);
      }
    }

    // Save failed requests back to queue
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedRequests));
    this.processing = false;
  }

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
}

export const offlineQueue = new OfflineQueue();
