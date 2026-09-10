/**
 * Dantewada ITI Student Tracking System - Shared Application Configuration
 */

const APP_CONFIG = {
  APP_NAME: 'Dantewada ITI Student Tracking System',
  PORTAL_TITLE: 'Dantewada ITI - Rozgar Vibhag Portal',
  DISTRICT: 'Dantewada',
  STATE: 'Chhattisgarh',
  CURRENT_ACADEMIC_YEAR: '2024-25',

  // Google Sheets Integration (Connected to Live Sheet)
  GOOGLE_SHEET: {
    ID: '1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0',
    URL: 'https://docs.google.com/spreadsheets/d/1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0/edit?usp=sharing',
    TABS: {
      ITI_MANAGEMENT: { name: 'ITI Management', gid: '0' },
      TRADE_MANAGEMENT: { name: 'Trade Management', gid: '1179972132' },
      STUDENT_REGISTRATION: { name: 'Student Registration', gid: '96239547' },
      STUDENT_STATUS_TRACKING: { name: 'Student Status Tracking', gid: '645142661' },
      EMPLOYMENT_TRACKING: { name: 'Employment Tracking Module', gid: '473534489' }
    },
    // Optional Google Apps Script Web App Deployment URL for direct POST write access
    APPS_SCRIPT_WEB_APP_URL: ''
  },
  
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
