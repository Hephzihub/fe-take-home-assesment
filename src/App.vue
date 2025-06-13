<script setup lang="ts">
import { ref } from 'vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { Battery, AlertTriangle } from 'lucide-vue-next';
import { useBatteryStore } from './stores/battery';
import { storeToRefs } from 'pinia';

const { loadData } = useBatteryStore()
const { loading, error, prioritizedSchools } = storeToRefs(useBatteryStore())

const mobileMenuOpen = ref(false)

// Initialize data on mount
onMounted(() => {
  loadData();
});
</script>

<template>
<header class="bg-white shadow-sm border-b">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center py-4">
      <div class="flex items-center">
        <Battery class="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
        <router-link
          to="/"
          class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 hover:text-blue-600 leading-[0] transition-colors"
        >
          <span class="hidden sm:inline">Battery Monitoring Dashboard</span>
          <span class="sm:hidden">Battery Monitor</span>
        </router-link>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-8">
        <router-link
          to="/"
          class="px-3 py-2 text-sm font-medium transition-colors"
          :class="
            $route.name === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          School Dashboard
        </router-link>
        <span
          v-if="$route.name === 'school-detail'"
          class="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
        >
          <span class="hidden lg:inline">School {{ $route.params.academyId }} Details</span>
          <span class="lg:hidden">School Details</span>
        </span>
      </nav>

      <!-- Mobile Menu Button -->
      <button 
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle menu"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200 pt-4 pb-4">
      <nav class="flex flex-col space-y-2">
        <router-link
          to="/"
          class="px-3 py-2 text-base font-medium rounded-md transition-colors"
          :class="
            $route.name === 'dashboard'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          "
          @click="mobileMenuOpen = false"
        >
          School Dashboard
        </router-link>
        <span
          v-if="$route.name === 'school-detail'"
          class="px-3 py-2 text-base font-medium text-blue-600 bg-blue-50 rounded-md"
        >
          School {{ $route.params.academyId }} Details
        </span>
      </nav>
    </div>
  </div>
</header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-lg text-gray-600">Loading battery data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <AlertTriangle class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error Loading Data</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          <button
            @click="loadData"
            class="mt-3 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Router View -->

    <RouterView v-else />
  </main>
  <VueQueryDevtools />
</template>
