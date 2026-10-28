# PepPlotter (Open-Source Edition)

<div align="center">

![PepPlotter Banner](https://pepplotter.com/og-image.png)

### Precision Peptide Reconstitution Calculator & Pharmacokinetic Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Live App](https://img.shields.io/badge/Web%20App-pepplotter.com-10b981.svg)](https://pepplotter.com)

**[Visit Live Tool](https://pepplotter.com)** • **[Report an Issue](https://github.com/issuunnyy/pepplotter.com/issues)** • **[☕ Support PepPlotter](https://buymeacoffee.com/ssuunnyy)** • **[Documentation](https://pepplotter.com)**

</div>

---

## 📌 Overview

**PepPlotter** is a modern, high-precision web utility designed for laboratory researchers, clinicians, and individuals administering subcutaneous peptides (such as Semaglutide, Tirzepatide, Retatrutide, BPC-157, and other research compounds).

It eliminates dangerous dilution, drawing, and dosing errors by combining:
1. **Precision Reconstitution Math** with real-time SVG syringe draw markers.
2. **Pharmacokinetic (PK) Accumulation Simulator** modeling Bateman subcutaneous absorption and elimination curves.
3. **Step-by-Step Clinical Sub-Q Visual Protocol** adhering to FITTER & ADA clinical harm-reduction standards.
4. **Zero Dosing-Data Logs** where all calculations are performed 100% on the client side.

---

## ✨ Key Features

- **💉 Dynamic Syringe Visualizer**: Interactive SVG render of standard U-100 (1.0mL / 0.5mL / 0.3mL) and U-40 insulin syringes with accurate plunger fill depths and unit ticks.
- **📈 Bateman Sub-Q Pharmacokinetic Simulator**: Smooth spline pharmacokinetic curves that simulate true subcutaneous slow-release absorption rather than unphysical instant-absorption spikes.
- **🔄 Multi-Dose & Split-Dosing Simulation**: Simulate once-weekly or twice-weekly split-dose regimens with customizable timeline spans (14 to 60 days).
- **🛡️ 4-Stage Clinical Sub-Q Visual Guide**: Symmetrical clinical protocol paired with interactive 15-second air-drying and 10-second needle dwell timers.
- **📄 One-Click Calendar Sync & Fridge Sheet**: Export recurring injection reminders to Google Calendar, Apple Calendar (.ics), or generate an optimized, single-page printable fridge cheat sheet.
- **🔒 Harm-Reduction Safety Guards**: Hard mathematical barriers preventing draw requests that exceed syringe capacity or vial volume limits.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Lucide Icons
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Charts & Geometry**: Custom SVG & Canvas Pharmacokinetic Math
- **Deployment**: [Cloudflare Pages / Workers](https://pages.cloudflare.com/) (Edge Static Architecture)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.0.0 or higher recommended)
- `npm` or `pnpm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/issuunnyy/pepplotter.com.git
   cd pepplotter.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Export

To create an optimized production build:

```bash
npm run build
```

To test the production build locally:

```bash
npm run start
```

---

## 🛡️ Medical & Research Disclaimer

PepPlotter is an independent mathematical simulation and harm-reduction educational tool created solely for laboratory research and educational verification. It does not provide medical advice, diagnosis, or prescription instructions. Always consult a licensed healthcare professional before administering any compound.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
