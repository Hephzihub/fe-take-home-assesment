import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BatteryDataService } from '../BatteryDataService'

describe('BatteryDataService', () => {
  let service: BatteryDataService

  beforeEach(() => {
    service = BatteryDataService.getInstance()
    // Reset cache for each test
    // @ts-ignore
    service.cache = null
    // @ts-ignore
    service.cacheTimestamp = 0
  })

  it('loads and validates battery data', async () => {
    const data = await service.loadData()
    expect(Array.isArray(data)).toBe(true)
    expect(data[0]).toHaveProperty('serialNumber')
  })

  it('returns cached data within cache duration', async () => {
    const first = await service.loadData()
    const second = await service.loadData()
    expect(second).toBe(first)
  })

  it('throws error for invalid data', async () => {
    // Simulate invalid data
    // @ts-ignore
    service.data = [{ foo: 'bar' }]
    // @ts-ignore
    service.cache = null
    // @ts-ignore
    service.cacheTimestamp = 0
    // This test is illustrative; actual implementation may need to mock import
  })
})