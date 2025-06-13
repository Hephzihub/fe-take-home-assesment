import { describe, it, expect } from 'vitest'
import { BatteryAnalysisService } from '../BatteryAnalysisService'
import type { BatteryReading } from '@/types'

const service = new BatteryAnalysisService()

describe('BatteryAnalysisService', () => {
  it('groups readings by serial number', () => {
    const readings: BatteryReading[] = [
      { academyId: 1, batteryLevel: 0.5, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-01T00:00:00Z' },
      { academyId: 1, batteryLevel: 0.4, employeeId: 'E2', serialNumber: 'A', timestamp: '2024-01-02T00:00:00Z' },
      { academyId: 2, batteryLevel: 0.9, employeeId: 'E3', serialNumber: 'B', timestamp: '2024-01-01T00:00:00Z' }
    ]
    const result = service['groupBySerialNumber'](readings)
    expect(result.get('A')?.length).toBe(2)
    expect(result.get('B')?.length).toBe(1)
  })

  it('returns Unknown health status for single reading', () => {
    const readings: BatteryReading[] = [
      { academyId: 1, batteryLevel: 0.5, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-01T00:00:00Z' }
    ]
    const result = service.analyzeDevices(readings)
    expect(result[0].healthStatus).toBe('Unknown')
    expect(result[0].totalReadings).toBe(1)
  })

  it('calculates daily usage rate and health status', () => {
    const readings: BatteryReading[] = [
      { academyId: 1, batteryLevel: 1, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-01T00:00:00Z' },
      { academyId: 1, batteryLevel: 0.7, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-02T00:00:00Z' }
    ]
    const result = service.analyzeDevices(readings)
    expect(result[0].dailyUsageRate).toBeGreaterThan(0)
    expect(['Healthy', 'Needs Replacement', 'Unknown']).toContain(result[0].healthStatus)
  })

  it('calculates average daily usage with irregular intervals and charging events', () => {
  const readings: BatteryReading[] = [
    // 9 AM, 100%
    { academyId: 1, batteryLevel: 1.0, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-01T09:00:00Z' },
    // 9 PM, 90% (12 hours later, 10% drop)
    { academyId: 1, batteryLevel: 0.9, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-01T21:00:00Z' },
    // Next day 9 PM, 80% (24 hours later, 10% drop)
    { academyId: 1, batteryLevel: 0.8, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-02T21:00:00Z' },
    // Next day 10 PM, 100% (charging event, should be ignored)
    { academyId: 1, batteryLevel: 1.0, employeeId: 'E1', serialNumber: 'A', timestamp: '2024-01-02T22:00:00Z' }
  ]
  const result = service.analyzeDevices(readings)
  // Total discharge: 0.1 + 0.1 = 0.2 (20%)
  // Total time: 36 hours = 1.5 days
  // Daily usage: 20% / 1.5 = 13.33%
  expect(result[0].dailyUsageRate).toBeCloseTo(0.133, 2)
  expect(result[0].healthStatus).toBe('Healthy')
})
})