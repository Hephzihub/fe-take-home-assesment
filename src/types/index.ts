export interface BatteryReading {
  academyId: number;
  batteryLevel: number;
  employeeId: string;
  serialNumber: string;
  timestamp: string;
}

export interface ProcessedDevice {
  serialNumber: string;
  academyId: number;
  currentBatteryLevel: number;
  dailyUsageRate: number;
  healthStatus: HealthStatus;
  lastReading: string;
  totalReadings: number;
}

export interface SchoolSummary {
  academyId: number;
  totalDevices: number;
  healthyDevices: number;
  unhealthyDevices: number;
  unknownDevices: number;
  unhealthyPercentage: number;
  devices: ProcessedDevice[];
}

export interface BatteryInterval {
  startTime: Date;
  endTime: Date;
  batteryDrop: number;
  hoursElapsed: number;
  dailyRate: number;
}

export type HealthStatus = 'Healthy' | 'Needs Replacement' | 'Unknown';