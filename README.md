# Dantewada ITI Student Tracking System

A centralized vocational student tracking, employment monitoring, and administration portal developed for the Directorate of Employment, Government of Chhattisgarh (Dantewada District).

## 🚀 Overview

The system provides end-to-end tracking for ITI students across 4 Government ITIs in Dantewada District:
- **Govt. ITI Dantewada**
- **Govt. ITI Geedam**
- **Govt. ITI Katekalyan**
- **Govt. ITI Kuakonda**

## 📂 Professional Project Directory Structure

```
Dantewada_ITI_Tracking_System/
│
├── index.html                  # Main Dashboard (Root)
├── server.js                   # Zero-dependency Node.js HTTP server
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore rules
│
└── src/
    │
    ├── css/
    │   └── style.css           # Global unified styles & responsive theme
    │
    ├── js/
    │   ├── config.js           # Shared app configuration (API, institutions, trades)
    │   ├── common.js           # Global UI utilities (sidebar drawer, accordion, toasts)
    │   ├── script.js           # Dashboard Chart.js & metrics logic
    │   ├── students.js         # Student registry & filter handlers
    │   ├── add-student.js      # Student registration form handlers
    │   ├── bulk-upload.js      # Drag-and-drop spreadsheet import & validation
    │   ├── employment.js       # Career tracking, salary & placement modal
    │   ├── followups.js        # Contact history logs & scheduled alerts
    │   ├── reports.js          # Report generator & CSV export
    │   ├── downloads.js        # Export center preview table & data download
    │   ├── admin.js            # ITI, academic year, trade & user management
    │   └── profile.js          # Officer administrative profile & edit modal
    │
    ├── pages/
    │   ├── students.html       # All Students Registry
    │   ├── add-student.html    # Add Student Form
    │   ├── bulk-upload.html    # Bulk Upload Center
    │   ├── employment.html     # Employment Tracking
    │   ├── followups.html      # Student Follow-ups
    │   ├── reports.html        # Analytical Reports
    │   ├── downloads.html      # Data Download Center
    │   ├── admin.html          # Administration & Settings
    │   └── profile.html        # Officer Profile
    │
    └── assets/
        ├── images/             # Static images
        └── icons/              # Static icons
```

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3 (Modern Flexbox & CSS Grid, responsive design)
- **Scripting**: Vanilla JavaScript (ES6+)
- **Visualization**: Chart.js (via CDN)
- **Server**: Lightweight zero-dependency Node.js HTTP server (`server.js`)

## 💻 Running the Portal Locally

Run with Node.js:
```bash
node server.js
```
Then open your browser and navigate to:
```
http://localhost:3000
```
