
/**
 * Network utilities for checking connectivity
 */

import * as Network from 'expo-network';
import { Alert, Platform } from 'react-native';

/**
 * Check if the device is online
 */
export async function isOnline(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected === true && networkState.isInternetReachable === true;
  } catch (error) {
    console.error('Error checking network status:', error);
    // Assume online if we can't check
    return true;
  }
}

/**
 * Show an alert when the device is offline
 */
export function showOfflineAlert(): void {
  Alert.alert(
    'No Internet Connection',
    'Please check your internet connection and try again.',
    [{ text: 'OK' }]
  );
}

/**
 * Get the current network type
 */
export async function getNetworkType(): Promise<string> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.type || 'unknown';
  } catch (error) {
    console.error('Error getting network type:', error);
    return 'unknown';
  }
}

/**
 * Check if the device is on WiFi
 */
export async function isOnWiFi(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.type === Network.NetworkStateType.WIFI;
  } catch (error) {
    console.error('Error checking WiFi status:', error);
    return false;
  }
}

/**
 * Check if the device is on cellular data
 */
export async function isOnCellular(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.type === Network.NetworkStateType.CELLULAR;
  } catch (error) {
    console.error('Error checking cellular status:', error);
    return false;
  }
}
