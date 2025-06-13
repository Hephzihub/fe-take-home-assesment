<script setup lang="ts">
import { computed } from 'vue'
import { Tablet, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-vue-next'
import type { ProcessedDevice } from '@/types'

// Props
const props = defineProps<{
  device: ProcessedDevice
}>()

// Computed properties
const batteryLevel = computed(() => Math.round(props.device.currentBatteryLevel * 100))
const usageRate = computed(() => props.device.dailyUsageRate)

// Methods
const formatUsageRate = (rate: number): string => {
  if (rate === 0) return 'Unknown'
  return `${(rate * 100).toFixed(1)}%`
}

const formatLastReading = (timestamp: string): string => {
  const date = new Date(timestamp);

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
};

const getHealthBorderColor = (): string => {
  switch (props.device.healthStatus) {
    case 'Needs Replacement': return 'border-red-500'
    case 'Healthy': return 'border-green-500'
    case 'Unknown': return 'border-yellow-500'
    default: return 'border-gray-300'
  }
}

const getHealthBadgeColor = (): string => {
  switch (props.device.healthStatus) {
    case 'Needs Replacement': return 'bg-red-100 text-red-800'
    case 'Healthy': return 'bg-green-100 text-green-800'
    case 'Unknown': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getHealthBackgroundColor = (): string => {
  switch (props.device.healthStatus) {
    case 'Needs Replacement': return 'bg-red-50'
    case 'Healthy': return 'bg-green-50'
    case 'Unknown': return 'bg-yellow-50'
    default: return 'bg-gray-50'
  }
}

const getHealthTextColor = (): string => {
  switch (props.device.healthStatus) {
    case 'Needs Replacement': return 'text-red-800'
    case 'Healthy': return 'text-green-800'
    case 'Unknown': return 'text-yellow-800'
    default: return 'text-gray-800'
  }
}

const getHealthIconColor = (): string => {
  switch (props.device.healthStatus) {
    case 'Needs Replacement': return 'text-red-600'
    case 'Healthy': return 'text-green-600'
    case 'Unknown': return 'text-yellow-600'
    default: return 'text-gray-600'
  }
}

const getHealthIcon = () => {
  switch (props.device.healthStatus) {
    case 'Needs Replacement': return AlertTriangle
    case 'Healthy': return CheckCircle
    case 'Unknown': return HelpCircle
    default: return HelpCircle
  }
}

const getHealthDescription = (): string => {
  switch (props.device.healthStatus) {
    case 'Needs Replacement': 
      return `High battery consumption (${formatUsageRate(usageRate.value)}/day) - Schedule replacement`
    case 'Healthy': 
      return `Normal battery consumption (${formatUsageRate(usageRate.value)}/day) - Device is healthy`
    case 'Unknown': 
      return 'Insufficient data to determine battery health status'
    default: 
      return 'Status unknown'
  }
}

const getBatteryLevelColor = (): string => {
  if (batteryLevel.value <= 20) return 'text-red-600'
  if (batteryLevel.value <= 50) return 'text-yellow-600'
  return 'text-green-600'
}

const getBatteryBarColor = (): string => {
  if (batteryLevel.value <= 20) return 'bg-red-500'
  if (batteryLevel.value <= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getUsageRateColor = (): string => {
  if (props.device.healthStatus === 'Unknown') return 'text-gray-500'
  return usageRate.value >= 0.30 ? 'text-red-600' : 'text-green-600'
}

// Usage rate visualization helpers
const getUsageBarWidth = (): number => {
  if (props.device.healthStatus === 'Unknown') return 0
  // Scale to show rates up to 50% (100% width = 50% daily usage)
  // This makes the 30% threshold visible at 60% width
  return Math.min((usageRate.value / 0.50) * 100, 100)
}

const getThresholdPosition = (): number => {
  // 30% threshold should appear at 60% of the bar width (30/50 * 100)
  return (0.30 / 0.50) * 100
}
</script>

<template>
  <div 
    class="bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 p-5"
    :class="getHealthBorderColor()"
  >
    <!-- Device Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center">
        <Tablet class="h-6 w-6 text-gray-500 mr-2" />
        <div>
          <h3 class="text-sm font-medium text-gray-900 font-mono">
            {{ device.serialNumber }}
          </h3>
          <p class="text-xs text-gray-500 mt-1">{{ device.totalReadings }} readings</p>
        </div>
      </div>
      
      <span 
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        :class="getHealthBadgeColor()"
      >
        {{ device.healthStatus }}
      </span>
    </div>

    <!-- Battery Level Indicator later -->

    <!-- Usage Statistics -->
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Daily Usage Rate</span>
        <div class="text-right">
          <span 
            class="text-sm font-semibold"
            :class="getUsageRateColor()"
          >
            {{ formatUsageRate(device.dailyUsageRate) }}
          </span>
          <div class="text-xs text-gray-500">per day</div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Last Reading</span>
        <span class="text-sm text-gray-900">{{ formatLastReading(device.lastReading) }}</span>
      </div>
    </div>

    <!-- Usage Rate Visualization later -->

    <!-- Health Status Details -->
    <div class="mt-4 p-3 rounded-md text-xs" :class="getHealthBackgroundColor()">
      <div class="flex items-center">
        <component 
          :is="getHealthIcon()"
          class="h-4 w-4 mr-2"
          :class="getHealthIconColor()"
        />
        <span class="font-medium" :class="getHealthTextColor()">
          {{ getHealthDescription() }}
        </span>
      </div>
    </div>
  </div>
</template>