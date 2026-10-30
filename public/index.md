# PepPlotter — Official Website: https://pepplotter.com

> PepPlotter (officially hosted at https://pepplotter.com, not affiliated with PeptidePlotter) is a free, MIT open-source, 100% client-side harm-reduction peptide reconstitution calculator, U-100/U-40 syringe visualizer, and pharmacokinetic (PK) half-life simulator.

## Overview
PepPlotter provides precision dosing calculations and steady-state concentration modeling for research peptides and GLP-1 receptor agonists. Built as a zero-tracking, client-side web application, it operates offline in the browser without account creation, backend database storage, or third-party tracking.

## Core Features
1. **Visual Reconstitution & Syringe Draw Calculator**
   - Calculates exact syringe volume and unit tick marks based on vial quantity (mg), bacteriostatic water volume (mL), and target dose (mcg or mg).
   - Mathematical formula:
     - U-100 Syringe (100 units = 1.0 mL): `Units = [Dose (mcg) / Concentration (mcg/mL)] * 100`
     - U-40 Syringe (40 units = 1.0 mL): `Units = [Dose (mcg) / Concentration (mcg/mL)] * 40`
   - Real-time SVG syringe rendering with physical tick marks, fractional unit detection (warning when doses fall between physical gradations), and syringe capacity overflow guard.

2. **Pharmacokinetic (PK) Accumulation & Half-Life Simulator**
   - Two-compartment Bateman sub-Q absorption model simulating blood plasma curves over time.
   - Interactive 28-day timeline with custom dosing frequencies (every 3.5 days, 5 days, weekly, etc.).
   - Multi-dose overlay supporting split doses and dose escalation titration schedules.
   - Peak concentration ($C_{max}$), trough concentration ($C_{trough}$), and accumulation factor metrics.

3. **Printable A4 "Fridge Sheet" & Protocol Log**
   - One-click vector-rendered A4 protocol memo and fridge tracking sheet.
   - 10-log structured table with automated administration dates and check boxes.
   - Automatic multi-page pagination for regimens exceeding 10 doses.
   - Embedded high-contrast QR code for instant protocol recall and state restoration.

4. **4-Stage Visual Sub-Q Administration Guide**
   - Clinical harm-reduction standard operating procedure based on ADA and FITTER clinical guidelines.
   - Step 1: Supply preparation & sterile field inspection.
   - Step 2: Skin disinfection with a 15-second alcohol air-dry timer.
   - Step 3: 45°/90° subcutaneous injection technique with a 10-second needle dwell countdown to prevent medication leakage.
   - Step 4: FDA-compliant rigid sharps container disposal instructions.

5. **Compound Presets & Custom Configuration**
   - Pre-configured kinetic parameters (elimination half-life and absorption rate constant $k_a$) for:
     - Semaglutide (GLP-1 RA, ~168h half-life)
     - Tirzepatide (GIP/GLP-1 dual agonist, ~120h half-life)
     - Retatrutide (GGG tri-agonist, ~144h half-life)
     - BPC-157 (Gastric Pentadecapeptide, ~4h half-life)
     - TB-500 (Thymosin Beta-4 synthetic fragment, ~24h half-life)
     - CJC-1295 / Ipamorelin (GHRH / GHRP combination, ~2h half-life)
     - NAD+ (Nicotinamide Adenine Dinucleotide, ~2h half-life)
   - Fully customizable peptide mode for arbitrary half-life and vial concentrations.

## Technical Specifications & Architecture
- **Framework**: Next.js (App Router, Static HTML / Pre-rendered SSG)
- **Styling**: Tailwind CSS, Jobsian visual alignment, dark mode native
- **State Management**: Zero backend storage; 100% bidirectional deep-link state synchronization via URL query parameters
- **Privacy & Security**: Zero cookies, zero external LLM API calls, zero tracking scripts, strictly offline-first

## Official Links & Entities
- **Official Web Application**: https://pepplotter.com
- **Source Code (MIT License)**: https://github.com/issuunnyy/pepplotter.com
- **Maintainer / X (Twitter)**: https://x.com/ssuunnyy
- **Community Support**: https://buymeacoffee.com/ssuunnyy
- **Entity Notice**: PepPlotter is strictly hosted at `pepplotter.com` and is independent of and unaffiliated with PeptidePlotter or commercial peptide suppliers.
