# Battery Health Monitoring App

## Overview

This project is a Vue 3 web application designed to help field support teams identify schools and devices with battery issues, prioritizing which schools to visit first. It analyzes a week's worth of battery data for teacher tablets, highlighting devices in need of battery replacement based on their average daily battery usage.

## Features

- Loads and analyzes battery data from `battery.json`
- Identifies devices that need battery replacement (average daily usage > 30%)
- Ranks schools by the number of unhealthy devices
- Provides device-level and school-level summaries
- Search, filter, and sort devices within each school
- Modern, responsive UI built with Vue 3 and Tailwind CSS
- Automated unit tests for core services and logic using Vitest

## Core Analysis Algorithm

The `BatteryAnalysisService` is the heart of the application's battery health assessment. Here's how it works:

### Discharge Segment Detection
1. **Chronological Sorting**: All battery readings for a device are sorted by timestamp
2. **Charging Event Detection**: The service identifies when charging occurs (battery level increases between readings)
3. **Segment Creation**: Continuous discharge periods are isolated as separate segments, split by charging events

### Daily Usage Calculation
For each discharge segment:
- Calculate total battery drop: `startBatteryLevel - endBatteryLevel`
- Calculate segment duration in hours
- Convert to daily rate: `(batteryDrop / durationHours) * 24`
- Weight each segment by its duration for final averaging

### Example
If a device shows:
- 20% battery drop over 36 hours = 13.33% daily usage rate
- 15% battery drop over 24 hours = 15% daily usage rate

The final rate would be weighted by duration, giving more influence to the longer 36-hour segment.

---

### Battery Health Calculation
The `BatteryAnalysisService` implements a sophisticated battery analysis algorithm:

- **Discharge Segment Approach**: Rather than averaging individual intervals, the service identifies continuous discharge segments by detecting charging events (battery level increases)
- **Weighted Analysis**: Each discharge segment is analyzed independently, calculating the total battery drop over the segment's duration, then converting to a daily usage rate
- **Segment Weighting**: Longer discharge segments have more influence on the final calculation, providing more accurate results for devices with varied usage patterns
- **Daily Usage Rate**: Calculated as `(totalBatteryDrop / totalHours) * 24` for each segment, then weighted by segment duration
- **Edge Case Handling**: 
  - If only one reading exists for a device, its health status is "Unknown"
  - Impossible usage rates (>100% daily) are flagged as "Unknown"
  - Devices with no valid discharge data return 0% usage rate

### Unhealthy Device
- Any device with average daily battery usage > 30% is flagged as "Needs Replacement"

### Data Handling
- Data is loaded from a local JSON file and processed in-memory (no backend/API calls)

### Testing
- Core business logic and services are covered by unit tests using Vitest

### UI/UX
- Designed for clarity and usability, not pixel-perfect fidelity

### Browser Support
- Latest version of Chrome

### Deployment issues
- I made am edit on vite.config and src/config/env.ts. This allowed the project run smoothly

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm (or use npm/yarn if preferred)

### Install Dependencies
```bash
npm install
```
*Or use `npm install` or `yarn install` if you prefer.*

### Run the Development Server
```bash
npm dev
```
*Or use `npm run dev` or `yarn dev`.*

The app will be available at http://localhost:5173 by default.

### Run Tests
```bash
npm test
```
*Or use `npx vitest` or `npm run test`.*

## Project Structure

```
├── public           # public files
├── src/
│   ├── services/          # Business logic and data analysis
│   │   |── BatteryAnalysisService.ts  # Core battery analysis logic
|   |   ├── __test__/                  # Unit tests for services
│   ├── components/        # Reusable UI components
│   ├── views/             # Main app screens
│   ├── stores/            # Pinia stores for state management
│   └── types/             # TypeScript type definitions
│   └── data/              # Main data source
└── __test__/              # Unit tests for services
```

## Scope & Future Work

### Not implemented:
- Authentication, real API integration, or persistent storage
- Advanced error handling for corrupted data
- Mobile-specific optimizations

### Future improvements:
- Add E2E tests (e.g., with Cypress)
- Enhance UI/UX with more detailed device history
- Add export/reporting features

## How to Continue

- Add more tests for edge cases and UI components
- Integrate with a backend API if needed
- Collaborate with a designer for improved UX

## Author

Oluwasegun Adedeji