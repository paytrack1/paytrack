# PayTrack Lite

An offline-first POS and payment verification app for Nigerian merchants.

## Problem
Nigerian merchants lose money daily to fake transfer screenshots and unverified POS payments.

## Solution
PayTrack Lite lets merchants record every sale offline, then automatically verifies transfers and POS payments through the Interswitch Transaction Search API when online.

## Features
- Record sales offline (works with zero internet)
- Auto-sync and verify payments via Interswitch API
- Fake transfer detection
- Sales history with weekly chart
- Export sales data as CSV
- PWA — installable on any device
- MongoDB cloud backup

## Tech Stack
- Frontend: React, Zustand, Dexie (IndexedDB), TailwindCSS, Vite PWA
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas + IndexedDB (offline)
- Payment Verification: Interswitch Transaction Search API

## Live Links
- Frontend: https://paytracklite.vercel.app
- Backend: https://paytrack-lite-backend.onrender.com

## Team
- Chibueze Ebubechukwu Peter — Full Stack (Frontend + Backend)

## How to Run Locally
```bash
# Frontend
npm install
npm run dev

# Backend
cd paytrack-lite-backend
npm install
node index.js
```
