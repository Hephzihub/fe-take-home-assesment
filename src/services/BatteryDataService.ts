import type { BatteryReading } from "@/types";
import batteryData from "@/data/battery.json"

export class BatteryDataService {
  private static instance: BatteryDataService;
  private data: BatteryReading[] = [];
  private cache: BatteryReading[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): BatteryDataService {
    if (!BatteryDataService.instance) {
      BatteryDataService.instance = new BatteryDataService();
    }

    return BatteryDataService.instance;
  }

  async loadData(): Promise<BatteryReading[]> {
    try {
      // Check cache first
      const currentTime = Date.now();
      if (this.cache && (currentTime - this.cacheTimestamp) < this.CACHE_DURATION) {
        return this.cache;
      }

      // Simulate loading data from a file or database
      await this.delay(3000);

      // Load data from the JSON file
      const data = batteryData as BatteryReading[];

      // Validate the data structure
      if (!Array.isArray(data) || !data.every(item => 
        typeof item.academyId === 'number' &&
        typeof item.batteryLevel === 'number' &&
        typeof item.employeeId === 'string' &&
        typeof item.serialNumber === 'string' &&
        typeof item.timestamp === 'string'
      )) {
        throw new Error("Invalid data format");
      }

      // Update Cache
      this.data = data;
      this.cache = data;
      this.cacheTimestamp = Date.now();

      console.log(`Loaded ${this.data.length} battery readings from src`);
      // Return Data

      return this.data;
    } catch (error) {
      console.error("Error loading battery data:", error);
      throw new Error(`Failed to load battery data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}