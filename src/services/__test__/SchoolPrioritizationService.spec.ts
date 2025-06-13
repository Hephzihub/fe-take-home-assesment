import { describe, it, expect } from 'vitest'
import { SchoolPrioritizationService } from '../SchoolPrioritizationService'
import type { ProcessedDevice } from '@/types'

const service = new SchoolPrioritizationService()

describe('SchoolPrioritizationService', () => {
  it('groups devices by academyId', () => {
    const devices: ProcessedDevice[] = [
      { serialNumber: 'A', academyId: 1, currentBatteryLevel: 0.5, dailyUsageRate: 0.1, healthStatus: 'Healthy', lastReading: '', totalReadings: 2 },
      { serialNumber: 'B', academyId: 2, currentBatteryLevel: 0.4, dailyUsageRate: 0.2, healthStatus: 'Needs Replacement', lastReading: '', totalReadings: 2 }
    ]
    // @ts-ignore
    const grouped = service['groupDevicesBySchool'](devices)
    expect(grouped.get(1)?.length).toBe(1)
    expect(grouped.get(2)?.length).toBe(1)
  })

  it('creates accurate school summaries', () => {
    const devices: ProcessedDevice[] = [
      { serialNumber: 'A', academyId: 1, currentBatteryLevel: 0.5, dailyUsageRate: 0.1, healthStatus: 'Healthy', lastReading: '', totalReadings: 2 },
      { serialNumber: 'B', academyId: 1, currentBatteryLevel: 0.4, dailyUsageRate: 0.2, healthStatus: 'Needs Replacement', lastReading: '', totalReadings: 2 },
      { serialNumber: 'C', academyId: 1, currentBatteryLevel: 0.6, dailyUsageRate: 0.05, healthStatus: 'Unknown', lastReading: '', totalReadings: 1 }
    ]
    const summaries = service.prioritizeSchools(devices)
    expect(summaries[0].totalDevices).toBe(3)
    expect(summaries[0].unhealthyDevices).toBe(1)
    expect(summaries[0].healthyDevices).toBe(1)
    expect(summaries[0].unknownDevices).toBe(1)
    expect(summaries[0].unhealthyPercentage).toBeCloseTo(33.33, 1)
  })
})