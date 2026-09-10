/**
 * Dantewada ITI Student Tracking System - Shared Application Configuration
 */

const APP_CONFIG = {
  APP_NAME: 'Dantewada ITI Student Tracking System',
  PORTAL_TITLE: 'Dantewada ITI - Rozgar Vibhag Portal',
  DISTRICT: 'Dantewada',
  STATE: 'Chhattisgarh',
  CURRENT_ACADEMIC_YEAR: '2024-25',
  
  // Base endpoint for Google Sheets / Backend Web App API integration
  API_BASE_URL: '',
  
  // Available Government ITIs in District
  ITIS: [
    { id: 'ITI-01', name: 'Govt. ITI Dantewada', block: 'Dantewada' },
    { id: 'ITI-02', name: 'Govt. ITI Geedam', block: 'Geedam' },
    { id: 'ITI-03', name: 'Govt. ITI Katekalyan', block: 'Katekalyan' },
    { id: 'ITI-04', name: 'Govt. ITI Kuakonda', block: 'Kuakonda' }
  ],

  // Academic Sessions
  ACADEMIC_YEARS: ['2024-25', '2023-24', '2022-23', '2021-22'],

  // Approved Core Trades
  TRADES: ['Electrician', 'Fitter', 'COPA', 'Welder', 'Mechanic Diesel']
};

// Make accessible globally
window.APP_CONFIG = APP_CONFIG;
