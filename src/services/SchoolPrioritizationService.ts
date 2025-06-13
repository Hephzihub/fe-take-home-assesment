import type { ProcessedDevice, SchoolSummary } from "@/types";

export class SchoolPrioritizationService {
  
  prioritizeSchools(devices: ProcessedDevice[]): SchoolSummary[] {
    // Group devices by academy/school
    const schoolDevices = this.groupDevicesBySchool(devices);
    const schoolSummaries: SchoolSummary[] = [];

    // Create school summaries with risk metrics
    for (const [academyId, devicesForSchool] of schoolDevices.entries()) {
      const summary = this.createSchoolSummary(academyId, devicesForSchool);
      schoolSummaries.push(summary);
    }

    // Sort schools by priority (highest risk first)
    return this.sortSchoolsByPriority(schoolSummaries);
  }

  private groupDevicesBySchool(devices: ProcessedDevice[]): Map<number, ProcessedDevice[]> {
    const grouped = new Map<number, ProcessedDevice[]>();
    
    for (const device of devices) {
      if (!grouped.has(device.academyId)) {
        grouped.set(device.academyId, []);
      }
      grouped.get(device.academyId)!.push(device);
    }

    return grouped;
  }

  private createSchoolSummary(academyId: number, devices: ProcessedDevice[]): SchoolSummary {
    const totalDevices = devices.length;
    const unhealthyDevices = devices.filter(d => d.healthStatus === 'Needs Replacement').length;
    const healthyDevices = devices.filter(d => d.healthStatus === 'Healthy').length;
    const unknownDevices = devices.filter(d => d.healthStatus === 'Unknown').length;
    
    const unhealthyPercentage = totalDevices > 0 ? (unhealthyDevices / totalDevices) * 100 : 0;

    return {
      academyId,
      totalDevices,
      unhealthyDevices,
      healthyDevices,
      unknownDevices,
      unhealthyPercentage,
      devices: [...devices] // Create a copy
    };
  }

  private sortSchoolsByPriority(schools: SchoolSummary[]): SchoolSummary[] {
    return schools.sort((a, b) => {
      // Primary sort: Number of unhealthy devices (descending)
      if (a.unhealthyDevices !== b.unhealthyDevices) {
        return b.unhealthyDevices - a.unhealthyDevices;
      }
      
      // Secondary sort: Percentage of unhealthy devices (descending)
      if (a.unhealthyPercentage !== b.unhealthyPercentage) {
        return b.unhealthyPercentage - a.unhealthyPercentage;
      }
      
      // Tertiary sort: Total number of devices (descending - larger schools get priority)
      return b.totalDevices - a.totalDevices;
    });
  }

  getRiskScore(school: SchoolSummary): number {
    // Risk score combines absolute numbers and percentages
    // Higher score = higher priority
    const absoluteWeight = 0.6;
    const percentageWeight = 0.4;
    
    const absoluteScore = school.unhealthyDevices * 10; // Scale up absolute numbers
    const percentageScore = school.unhealthyPercentage;
    
    return (absoluteScore * absoluteWeight) + (percentageScore * percentageWeight);
  }

  getSchoolRiskLevel(school: SchoolSummary): 'Critical' | 'High' | 'Medium' | 'Low' {
    const riskScore = this.getRiskScore(school);
    
    if (riskScore >= 50) return 'Critical';
    if (riskScore >= 25) return 'High';
    if (riskScore >= 10) return 'Medium';
    return 'Low';
  }
}