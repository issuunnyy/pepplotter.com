export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
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
];
