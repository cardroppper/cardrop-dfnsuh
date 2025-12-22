
export interface NearbyVehicle {
  vehicleId: string;
  vehicleName: string;
  ownerUsername: string;
  ownerDisplayName: string;
  rssi: number;
  distance: 'very-close' | 'close' | 'nearby';
  lastSeen: number;
  primaryImageUrl?: string;
}

export interface BeaconData {
  uuid: string;
  major?: number;
  minor?: number;
  rssi: number;
  deviceId: string;
}

export const CARDROP_BEACON_UUID = 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0';

export const RSSI_THRESHOLDS = {
  VERY_CLOSE: -60,
  CLOSE: -75,
  NEARBY: -90,
};

export function calculateDistance(rssi: number): 'very-close' | 'close' | 'nearby' {
  if (rssi >= RSSI_THRESHOLDS.VERY_CLOSE) {
    return 'very-close';
  } else if (rssi >= RSSI_THRESHOLDS.CLOSE) {
    return 'close';
  } else {
    return 'nearby';
  }
}

export function getDistanceLabel(distance: 'very-close' | 'close' | 'nearby'): string {
  switch (distance) {
    case 'very-close':
      return 'Very Close';
    case 'close':
      return 'Close';
    case 'nearby':
      return 'Nearby';
  }
}
