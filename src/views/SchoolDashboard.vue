<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, ChevronRight, Battery } from 'lucide-vue-next'
import type { SchoolSummary } from '@/types'
import { useBatteryStore } from '@/stores/battery';
import { storeToRefs } from 'pinia';

const { prioritizedSchools: schools } = storeToRefs(useBatteryStore())
const { getRiskLevel, getRiskBadgeColor } = useBatteryStore()

// Reactive state
const searchQuery = ref('')
const selectedRiskFilter = ref('')

// Computed properties
const totalSchools = computed(() => schools.value.length)

const totalUnhealthyDevices = computed(() => 
  schools.value.reduce((sum, school) => sum + school.unhealthyDevices, 0)
)

const filteredSchools = computed(() => {
  let filtered = schools.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(school => 
      school.academyId.toString().includes(query)
    )
  }

  // Apply risk level filter
  if (selectedRiskFilter.value) {
    filtered = filtered.filter(school => 
      getRiskLevel(school) === selectedRiskFilter.value
    )
  }

  return filtered
})

// Methods
const getRiskBorderColor = (school: SchoolSummary): string => {
  const riskLevel = getRiskLevel(school)
  switch (riskLevel) {
    case 'Critical': return 'border-red-500'
    case 'High': return 'border-orange-500'
    case 'Medium': return 'border-yellow-500'
    case 'Low': return 'border-green-500'
    default: return 'border-gray-300'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex flex-wrap gap-5 items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">School Priority Dashboard</h2>
          <p class="mt-1 text-sm text-gray-600">
            Schools ranked by battery replacement needs - highest priority first
          </p>
        </div>
        <div class="flex items-center gap-5">
          <div class="text-right">
            <div class="text-2xl font-bold text-gray-900">{{ totalSchools }}</div>
            <div class="text-sm text-gray-600">Total Schools</div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-red-600">{{ totalUnhealthyDevices }}</div>
            <div class="text-sm text-gray-600">Devices Need Replacement</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center flex-wrap gap-5">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by Academy ID..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          <select
            v-model="selectedRiskFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div class="hidden sm:block text-sm text-gray-600">
          Showing {{ filteredSchools.length }} of {{ schools.length }} schools
        </div>
      </div>
    </div>

    <!-- Schools Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <router-link
        v-for="school in filteredSchools"
        :key="school.academyId"
        :to="`/school/${school.academyId}`"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 transform hover:scale-105"
        :class="getRiskBorderColor(school)"
      >
        <div class="p-6">
          <!-- School Header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Academy {{ school.academyId }}
              </h3>
              <div class="mt-1">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getRiskBadgeColor(school)"
                >
                  {{ getRiskLevel(school) }} Priority
                </span>
              </div>
            </div>
            <ChevronRight class="h-5 w-5 text-gray-400" />
          </div>

          <!-- Device Statistics -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Devices</span>
              <span class="font-semibold">{{ school.totalDevices }}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Need Replacement</span>
              <span class="font-semibold text-red-600">{{ school.unhealthyDevices }}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Healthy</span>
              <span class="font-semibold text-green-600">{{ school.healthyDevices }}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Unknown Status</span>
              <span class="font-semibold text-yellow-600">{{ school.unknownDevices }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Battery Health Overview</span>
              <span>{{ Math.round(school.unhealthyPercentage) }}% need replacement</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="flex h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-red-500" 
                  :style="{ width: `${school.unhealthyPercentage}%` }"
                ></div>
                <div 
                  class="bg-green-500" 
                  :style="{ width: `${(school.healthyDevices / school.totalDevices) * 100}%` }"
                ></div>
                <div 
                  class="bg-yellow-500" 
                  :style="{ width: `${(school.unknownDevices / school.totalDevices) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-if="filteredSchools.length === 0" class="text-center py-12">
      <Battery class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No schools found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
    </div>
  </div>
</template>