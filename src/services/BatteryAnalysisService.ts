import type { BatteryReading, ProcessedDevice, BatteryInterval } from "@/types";

export class BatteryAnalysisService {
  
  analyzeDevices(readings: BatteryReading[]): ProcessedDevice[] {
    // Group readings by serial number
    const deviceReadings = this.groupBySerialNumber(readings);
    const processedDevices: ProcessedDevice[] = [];

    for (const [serialNumber, deviceData] of deviceReadings.entries()) {
      const processedDevice = this.analyzeDevice(serialNumber, deviceData);
      processedDevices.push(processedDevice);
    }

    return processedDevices;
  }

  private groupBySerialNumber(readings: BatteryReading[]): Map<string, BatteryReading[]> {
    const grouped = new Map<string, BatteryReading[]>();
    
    for (const reading of readings) {
      if (!grouped.has(reading.serialNumber)) {
        grouped.set(reading.serialNumber, []);
      }
      grouped.get(reading.serialNumber)!.push(reading);
    }

    return grouped;
  }

  private analyzeDevice(serialNumber: string, readings: BatteryReading[]): ProcessedDevice {
    // Sort readings chronologically
    const sortedReadings = readings.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // If only one reading, mark as unknown
    if (sortedReadings.length < 2) {
      return {
        serialNumber,
        academyId: sortedReadings[0].academyId,
        currentBatteryLevel: sortedReadings[0].batteryLevel,
        dailyUsageRate: 0,
        healthStatus: 'Unknown',
        lastReading: sortedReadings[0].timestamp,
        totalReadings: 1
      };
    }

    // Calculate daily usage rate using discharge segments approach
    const dailyUsageRate = this.calculateDailyUsageFromSegments(sortedReadings);
    
    // Determine health status
    const healthStatus = this.determineHealthStatus(dailyUsageRate);

    return {
      serialNumber,
      academyId: sortedReadings[0].academyId,
      currentBatteryLevel: sortedReadings[sortedReadings.length - 1].batteryLevel,
      dailyUsageRate,
      healthStatus,
      lastReading: sortedReadings[sortedReadings.length - 1].timestamp,
      totalReadings: sortedReadings.length
    };
  }

  /**
   * Calculates daily usage rate by identifying continuous discharge segments
   * and computing cumulative battery drop over total time for each segment.
   * 
   * This approach aligns with the requirement to calculate "20% over 36 hours"
   * rather than averaging individual intervals.
   */
  private calculateDailyUsageFromSegments(readings: BatteryReading[]): number {
    const dischargeSegments = this.identifyDischargeSegments(readings);
    
    if (dischargeSegments.length === 0) {
      return 0; // No valid discharge data
    }

    // Calculate weighted average across all discharge segments
    // Each segment is weighted by its duration
    let totalWeightedUsage = 0;
    let totalWeight = 0;

    for (const segment of dischargeSegments) {
      const startReading = segment.readings[0];
      const endReading = segment.readings[segment.readings.length - 1];
      
      const totalBatteryDrop = startReading.batteryLevel - endReading.batteryLevel;
      const startTime = new Date(startReading.timestamp);
      const endTime = new Date(endReading.timestamp);
      const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (totalHours > 0 && totalBatteryDrop > 0) {
        const segmentDailyRate = (totalBatteryDrop / totalHours) * 24;
        
        // Weight by duration - longer segments have more influence
        const weight = totalHours;
        totalWeightedUsage += segmentDailyRate * weight;
        totalWeight += weight;
        
        // Debug logging for transparency
        console.log(`Segment: ${totalBatteryDrop.toFixed(3)} drop over ${totalHours.toFixed(1)}h = ${segmentDailyRate.toFixed(3)} daily rate`);
      }
    }

    return totalWeight > 0 ? totalWeightedUsage / totalWeight : 0;
  }

  /**
   * Identifies continuous discharge segments by splitting on charging events.
   * Each segment represents a continuous discharge period without charging.
   */
  private identifyDischargeSegments(readings: BatteryReading[]): { readings: BatteryReading[] }[] {
    const segments: { readings: BatteryReading[] }[] = [];
    let currentSegment: BatteryReading[] = [];

    for (let i = 0; i < readings.length; i++) {
      const current = readings[i];
      const previous = i > 0 ? readings[i - 1] : null;

      // Check if charging occurred (battery level increased)
      if (previous && current.batteryLevel > previous.batteryLevel) {
        // Charging detected - finalize current segment if it has data
        if (currentSegment.length >= 2) {
          segments.push({ readings: [...currentSegment] });
        }
        // Start new segment with current reading
        currentSegment = [current];
      } else {
        // Normal discharge or first reading - add to current segment
        currentSegment.push(current);
      }
    }

    // Don't forget the final segment
    if (currentSegment.length >= 2) {
      segments.push({ readings: [...currentSegment] });
    }

    console.log(readings[0].serialNumber, segments)
    return segments;
  }

  private determineHealthStatus(dailyUsageRate: number): 'Healthy' | 'Needs Replacement' | 'Unknown' {
    if (dailyUsageRate === 0) return 'Unknown';
    if (dailyUsageRate > 1.0) {
      console.warn(`Impossible daily usage rate: ${dailyUsageRate.toFixed(3)} - treating as Unknown`);
      return 'Unknown';
    }
    return dailyUsageRate >= 0.30 ? 'Needs Replacement' : 'Healthy';
  }

  // Utility method for debugging - shows the calculation breakdown  
  analyzeDeviceDetailed(serialNumber: string, readings: BatteryReading[]): any {
    const sortedReadings = readings.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const segments = this.identifyDischargeSegments(sortedReadings);
    
    return {
      serialNumber,
      totalReadings: sortedReadings.length,
      dischargeSegments: segments.map((segment, index) => {
        const start = segment.readings[0];
        const end = segment.readings[segment.readings.length - 1];
        const drop = start.batteryLevel - end.batteryLevel;
        const hours = (new Date(end.timestamp).getTime() - new Date(start.timestamp).getTime()) / (1000 * 60 * 60);
        const dailyRate = hours > 0 ? (drop / hours) * 24 : 0;
        
        return {
          segmentIndex: index,
          startTime: start.timestamp,
          endTime: end.timestamp,
          startBattery: start.batteryLevel,
          endBattery: end.batteryLevel,
          batteryDrop: drop,
          durationHours: hours,
          dailyRate: dailyRate,
          readingsCount: segment.readings.length
        };
      }),
      finalDailyUsageRate: this.calculateDailyUsageFromSegments(sortedReadings)
    };
  }
}