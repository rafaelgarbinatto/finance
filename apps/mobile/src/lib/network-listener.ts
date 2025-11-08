import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from './offline-queue';

export function setupNetworkListener() {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      console.log('Network connected, processing offline queue...');
      offlineQueue.processQueue();
    }
  });

  return unsubscribe;
}
