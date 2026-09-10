# Dantewada ITI Student Tracking System

A centralized vocational student tracking, employment monitoring, and administration portal developed for the Directorate of Employment, Government of Chhattisgarh (Dantewada District).

## 🚀 Overview

The system provides end-to-end tracking for ITI students across 4 Government ITIs in Dantewada District:
- **Govt. ITI Dantewada**
- **Govt. ITI Geedam**
- **Govt. ITI Katekalyan**
- **Govt. ITI Kuakonda**

## 📂 System Architecture & Modules

The portal is architected into 10 dedicated, independent modules:

1. **Dashboard (`index.html`)**: District overview, 6 KPI cards, 4 analytical charts (ITI enrollment, career outcomes donut, trade distribution, year-wise trends).
2. **Student Registry (`students.html`)**: Searchable and filterable student directory with status badges and detail view modals.
3. **Add Student (`add-student.html`)**: Comprehensive 3-section student registration form with data quality validation rules.
4. **Bulk Upload (`bulk-upload.html`)**: Drag-and-drop Excel/CSV spreadsheet importer with automated verification and summary metrics.
5. **Employment Tracking (`employment.html`)**: Student placement outcomes, verified employers, designations, and salary range records.
6. **Follow-ups (`followups.html`)**: Communication history tracking (Call/WhatsApp logs, remarks, and scheduled follow-up alerts).
7. **Reports (`reports.html`)**: Advanced report generator with 4 filters (Year, ITI, Trade, Employment Status), quick cards, and CSV export.
8. **Download Center (`downloads.html`)**: Export facility with preview table and Excel/CSV download capability.
9. **Administration (`admin.html`)**: System configuration for ITI management, Academic sessions, Vocational trades, and Portal user permissions.
10. **Officer Profile (`profile.html`)**: Dedicated administrative officer profile with contact details, administrative milestones timeline, and edit modal.

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
