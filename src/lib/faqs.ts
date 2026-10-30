export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: 'What is the official website for PepPlotter?',
    answer:
      'The only official website for PepPlotter is https://pepplotter.com. It is an independent, free, and MIT open-source harm-reduction calculator hosted on GitHub (github.com/issuunnyy/pepplotter.com) and is not affiliated with PeptidePlotter or any commercial peptide vendors.',
  },
  {
    question: 'How do you calculate peptide reconstitution (mixing BAC water)?',
    answer:
      'Formula: Syringe Units = (Target Dose [mcg] / ((Vial Powder [mg] / BAC Water [mL]) * 1000)) * Syringe Units/mL (100 for U-100). For example, adding 2 mL of BAC water to a 5 mg vial yields a concentration of 2.5 mg/mL (2,500 mcg/mL). To administer a 250 mcg dose: (250 / 2,500) * 100 = 10 units on a standard U-100 insulin syringe (0.10 mL).',
  },
  {
    question: 'How many units is 250 mcg (0.25 mg) of Semaglutide on a U-100 syringe?',
    answer:
      'Formula: Syringe Units = (250 mcg / 2,500 mcg/mL) * 100 = 10 Units (0.10 mL) for a standard 5 mg vial reconstituted with 2.0 mL BAC water. If reconstituted with 1.0 mL BAC water (concentration 5.0 mg/mL), 250 mcg equals exactly (250 / 5,000) * 100 = 5 units (0.05 mL).',
  },
  {
    question: 'What is the half-life of Tirzepatide (Mounjaro / Zepbound)?',
    answer:
      'Formula: Steady-State Time = 5 * t_half ≈ 5 * 120 hours = 25 days (approx. 4 weeks), with an elimination half-life of approximately 5 days (120 hours). Because it is administered weekly, plasma concentration accumulates over 4 weeks until rate of elimination matches rate of administration.',
  },
  {
    question: 'What is the half-life of Semaglutide (Ozempic / Wegovy)?',
    answer:
      'Formula: Steady-State Time = 5 * t_half ≈ 5 * 168 hours = 35 days (approx. 5 weeks), with an elimination half-life of approximately 7 days (168 hours). Due to this long half-life, clinical protocols titrate every 4 weeks to avoid sudden drug accumulation and severe gastrointestinal side effects.',
  },
  {
    question: 'Why do research protocols use "Split-Dosing" for GLP-1 agonists?',
    answer:
      'Formula: Serum Concentration Fluctuation Index = (C_max - C_min) / C_average, where dividing weekly doses into two 3.5-day injections dampens peak spikes by ~35%. This reduces peak-driven nausea and vomiting while elevating end-of-week trough levels to maintain consistent appetite regulation.',
  },
  {
    question: 'What is the difference between a U-100 and a U-40 insulin syringe?',
    answer:
      'Formula: Volume (mL) = Syringe Units / 100 (for U-100, where 1 unit = 0.01 mL) vs. Volume (mL) = Syringe Units / 40 (for U-40, where 1 unit = 0.025 mL). Standard peptide research utilizes U-100 syringes; injecting 10 units on a U-40 syringe delivers 0.25 mL (2.5x more volume than intended on U-100).',
  },
  {
    question: 'How much Bacteriostatic Water should I add to a 5 mg or 10 mg vial?',
    answer:
      'Formula: Concentration (mg/mL) = Total Vial Powder (mg) / Volume of Water (mL). Adding 2.0 mL to a 5 mg vial yields 2.5 mg/mL (10 units = 250 mcg). Adding 2.0 mL to a 10 mg vial yields 5.0 mg/mL (10 units = 500 mcg). Standardizing on 2.0 mL provides simple decimal math and prevents high-concentration drawing errors.',
  },
  {
    question: 'How should reconstituted peptides be stored?',
    answer:
      'Formula / Temperature Standard: Maintain strictly between 2°C and 8°C (36°F to 46°F) under continuous refrigeration. Reconstituted peptide solutions must never be frozen, kept protected from UV light exposure, and swirled gently without shaking to preserve tertiary protein structure.',
  },
  {
    question: 'What is the half-life of Retatrutide and when does it reach steady state?',
    answer:
      'Clinical pharmacokinetic studies report a terminal elimination half-life of approximately 6 days (134–165 hours) for Retatrutide, supporting once-weekly subcutaneous dosing. Based on standard 4–5 half-life pharmacokinetics, steady-state plasma concentration is approached after approximately 3.5 to 4.5 weeks of consistent weekly administration. Individual clearance and titration regimens will affect actual plasma accumulation; this calculator provides mathematical modeling for educational evaluation only.',
  },
  {
    question: 'How many doses are in one vial, and how long will it last?',
    answer:
      'Formula: Total Doses = Vial Powder Amount (mcg) ÷ Target Dose (mcg). For example, a 5 mg vial contains 5,000 mcg: at a 250 mcg target dose, it provides 5,000 ÷ 250 = 20 doses. A 10 mg vial provides 40 doses and a 15 mg vial provides 60 doses at that same target. Adding more bacteriostatic water does NOT change the total number of doses; it only changes the liquid concentration and syringe units per injection. Vial duration is total doses divided by your weekly injection frequency. Actual usable doses may run slightly lower due to syringe dead space and priming loss.',
  },
  {
    question: 'Why do mg and mcg units frequently lead to dangerous 10x dosing errors?',
    answer:
      'Because 1 milligram (mg) equals 1,000 micrograms (mcg), a single misplaced decimal point multiplies or divides the dose tenfold. For example, in a 5 mg vial mixed with 2 mL BAC water, a target dose of 250 mcg (0.25 mg) draws exactly 10 units on a U-100 syringe. If that target is mistakenly read as 2,500 mcg (2.5 mg), the identical arithmetic yields 100 units—ten times the intended medication. Always convert milligrams to micrograms first (multiply by 1,000) before dividing, and verify your syringe markings with a visual calculator.',
  },
  {
    question: 'Why does the calculator block calculations when a dose exceeds syringe capacity?',
    answer:
      'The calculator enforces an inline Capacity & Overdose Safety Block to prevent dangerous administration errors. A standard U-100 insulin syringe holds a maximum of 100 units (1.0 mL). If your combination of high target dose and dilute water volume requires drawing more than the syringe barrel can physically hold (e.g., >100 units), the tool immediately stops calculation and marks the input as blocked. A blocked status is a clinical stop sign indicating you must dilute with less water, split the dose across multiple syringes, or re-verify prescribed dose parameters.',
  },
  {
    question: 'How do you measure a 2.5-unit dose on a standard U-100 syringe?',
    answer:
      'On a standard U-100 syringe, each minor graduation mark represents 1 unit (0.01 mL). A 2.5-unit dose (e.g., 250 mcg from a 10 mg / 1.0 mL vial) is positioned exactly halfway between the 2nd and 3rd unit tick marks. Align the leading edge of the black plunger seal precisely centered between the two graduations. If reading half-unit increments causes eye strain or dosage uncertainty, reconstituting with 2.0 mL BAC water instead delivers a clean 5-unit whole-tick injection (0.05 mL).',
  },
  {
    question: 'Why must reconstituted peptides only be gently swirled and never vigorously shaken?',
    answer:
      'Synthetic peptides and GLP-1 analogues consist of delicate amino acid chains folded into specific three-dimensional conformations. Vigorously shaking a vial generates micro-bubbles and extreme mechanical shear stress at the air-water interface, which can denature and aggregate the fragile peptide bonds, destroying compound potency. Always inject BAC water slowly down the tilted glass wall of the vial and swirl in a gentle horizontal orbit until the powder dissolves clear.',
  },
  {
    question: 'Why is subcutaneous site rotation necessary, and what is the 2-inch navel rule?',
    answer:
      'Injecting repeatedly into the same injection spot causes lipohypertrophy—thickened, scarred fatty deposits that severely impair peptide absorption kinetics and cause unpredictable blood glucose or appetite fluctuations. FITTER and ADA clinical protocols advise rotating weekly between the left lower abdomen, right lower abdomen, and outer thigh. Injections must stay at least 2 inches (5 cm) away from the navel because peri-umbilical tissue contains dense fibrous fascia and vascular networks that increase bruising risk.',
  },
];
