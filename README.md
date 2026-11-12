# Canopy Stress Scout

Act as a Senior Frontend Architect. Design and build a modern, responsive web application for an AI-powered agricultural monitoring platform:

"SIH25099: Crop Stress Early Warning System".

Tech Stack:

- Frontend: React (or clean HTML5/CSS3 with Tailwind CSS) + Lucide Icons + Chart.js / Recharts.

- Backend Integration: Connects via REST API to FastAPI endpoints (/predict, /analytics, /health).

Page Layout & Components:

1. Navigation & Top Bar:

   - System title, farm selector, live date/time, and status indicator.

2. Dashboard Overview:

   - KPI metric cards: Total Fields Monitored, Critical Stress Alerts, Nitrogen Deficiency Index, Model Confidence Score.

3. Interactive Analysis Workspace:

   - Dual-file dropzone for Aerial RGB and NIR imagery.

   - Real-time sliders for detection threshold and overlay mask opacity.

   - Before/After interactive slider (split view between RGB aerial photo and AI segmented stress heatmap).

4. Spectral & Health Insights:

   - NDVI (Normalized Difference Vegetation Index) estimation graph.

   - Severity distribution gauge (Healthy vs Mild vs Critical).

5. Agricultural Prescription Box:

   - Step-by-step agronomist advisory (fertilizer type, targeted spray coordinates, scheduled re-scan date).

   - "Export PDF Report" button for field officers and farmers.

Design Style: Clean agtech SaaS aesthetic, high-contrast dark/light mode support, crisp data visualizations, and mobile-responsive layout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/00b60d2f-174a-4bdb-bf00-fd405e1e0b85).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
