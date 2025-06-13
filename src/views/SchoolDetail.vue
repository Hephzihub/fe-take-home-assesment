<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Search, School, Tablet } from 'lucide-vue-next'
import type { ProcessedDevice } from '@/types'
import DeviceCard from '@/components/DeviceCard.vue'
import { useBatteryStore } from '@/stores/battery';
import { storeToRefs } from 'pinia';

const { prioritizedSchools: schools } = storeToRefs(useBatteryStore())
const { getRiskLevel, getRiskBadgeColor } = useBatteryStore()

// Router
const route = useRoute()

// Reactive state
const searchQuery = ref('')
const selectedHealthFilter = ref('')
const sortBy = ref<keyof ProcessedDevice>('dailyUsageRate')

// Computed properties
const school = computed(() => {
  const academyId = route.params.academyId as string
  return schools.value.find(s => s.academyId.toString() === academyId) || null
})

const filteredDevices = computed(() => {
  if (!school.value) return []
  
  let filtered = [...school.value.devices]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(device => 
      device.serialNumber.toLowerCase().includes(query)
    )
  }

  // Apply health status filter
  if (selectedHealthFilter.value) {
    filtered = filtered.filter(device => 
      device.healthStatus === selectedHealthFilter.value
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value]
    const bValue = b[sortBy.value]

    if (sortBy.value === 'dailyUsageRate') {
      return (bValue as number) - (aValue as number) // Descending for usage rate
    } else if (sortBy.value === 'currentBatteryLevel') {
      return (aValue as number) - (bValue as number) // Ascending for battery level
    } else if (sortBy.value === 'lastReading') {
      return new Date(bValue as string).getTime() - new Date(aValue as string).getTime() // Most recent first
    } else {
      return String(aValue).localeCompare(String(bValue)) // Alphabetical
    }
  })

  return filtered
})
</script>

<template>
  <div v-if="school" class="space-y-6">
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <router-link
          to="/"
          class="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowLeft class="h-4 w-4 mr-1" />
          Back to Dashboard
        </router-link>
        <div class="text-right">
          <span 
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="getRiskBadgeColor(school)"
          >
            {{ getRiskLevel(school) }} Priority
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-2">
          <div class="flex items-center mb-2">
            <School class="h-8 w-8 text-blue-600 mr-3" />
            <h1 class="text-3xl font-bold text-gray-900">Academy {{ school.academyId }}</h1>
          </div>
          <p class="text-gray-600">Device battery status and replacement needs</p>
        </div>

        <!-- Summary Cards -->
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-gray-900">{{ school.totalDevices }}</div>
          <div class="text-sm text-gray-600">Total Devices</div>
        </div>
        
        <div class="bg-red-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ school.unhealthyDevices }}</div>
          <div class="text-sm text-red-600">Need Replacement</div>
          <div class="text-xs text-red-500 mt-1">{{ Math.round(school.unhealthyPercentage) }}%</div>
        </div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-5 flex-wrap">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by serial number..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          <select
            v-model="selectedHealthFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Devices</option>
            <option value="Needs Replacement">Needs Replacement</option>
            <option value="Healthy">Healthy</option>
            <option value="Unknown">Unknown Status</option>
          </select>

          <select
            v-model="sortBy"
            class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dailyUsageRate">Sort by Usage Rate</option>
            <option value="currentBatteryLevel">Sort by Battery Level</option>
            <option value="serialNumber">Sort by Serial Number</option>
            <option value="lastReading">Sort by Last Reading</option>
          </select>
        </div>

        <div class="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
          <span>Showing {{ filteredDevices.length }} of {{ school.devices.length }} devices</span>
        </div>
      </div>
    </div>

    <!-- Devices Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DeviceCard
        v-for="device in filteredDevices"
        :key="device.serialNumber"
        :device="device"
      />
    </div>

    <!-- Empty State -->
    <div v-if="filteredDevices.length === 0" class="text-center py-12">
      <Tablet class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
    </div>

    <!-- Summary Statistics -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Device Health Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ school.healthyDevices }}</div>
          <div class="text-sm text-gray-600 mt-1">Healthy Devices</div>
          <div class="text-xs text-gray-500">&lt; 30% daily usage</div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-red-600">{{ school.unhealthyDevices }}</div>
          <div class="text-sm text-gray-600 mt-1">Need Replacement</div>
          <div class="text-xs text-gray-500">≥ 30% daily usage</div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ school.unknownDevices }}</div>
          <div class="text-sm text-gray-600 mt-1">Unknown Status</div>
          <div class="text-xs text-gray-500">Insufficient data</div>
        </div>
      </div>
    </div>
  </div>

  <!-- School Not Found -->
  <div v-else class="text-center py-12">
    <School class="mx-auto h-12 w-12 text-gray-400" />
    <h3 class="mt-2 text-sm font-medium text-gray-900">School not found</h3>
    <p class="mt-1 text-sm text-gray-500">The requested school could not be found.</p>
    <router-link
      to="/"
      class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
    >
      <ArrowLeft class="h-4 w-4 mr-2" />
      Back to Dashboard
    </router-link>
  </div>
</template>