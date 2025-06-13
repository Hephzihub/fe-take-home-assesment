import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import { BatteryDataService } from '@/services/BatteryDataService';
import { BatteryAnalysisService } from '@/services/BatteryAnalysisService';
import { SchoolPrioritizationService } from '@/services/SchoolPrioritizationService';
import type { BatteryReading, ProcessedDevice, SchoolSummary } from '@/types';

export const useBatteryStore = defineStore('battery', () => {
  const batteryDataService = BatteryDataService.getInstance();
  const batteryAnalysisService = new BatteryAnalysisService();
  const schoolPrioritizationService = new SchoolPrioritizationService();

  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const prioritizedSchools = ref<SchoolSummary[]>([]);

  const loadData = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Load raw battery data
      const batteryReadings = await batteryDataService.loadData();

      // Analyze devices
      const processedDevices = batteryAnalysisService.analyzeDevices(batteryReadings);

      // Prioritize schools
      const schools = schoolPrioritizationService.prioritizeSchools(processedDevices);

      prioritizedSchools.value = schools;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load battery data';
      console.error('Error loading data:', err);
    } finally {
      loading.value = false;
    }
  };

  const getRiskLevel = (school: SchoolSummary | null): string => {
    if (!school) return 'Unknown';
    return schoolPrioritizationService.getSchoolRiskLevel(school);
  };

  const getRiskBadgeColor = (school: SchoolSummary | null): string => {
    const riskLevel = getRiskLevel(school);
    switch (riskLevel) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    loading,
    error,
    prioritizedSchools,
    loadData,
    getRiskLevel,
    getRiskBadgeColor
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBatteryStore, import.meta.hot));
}
