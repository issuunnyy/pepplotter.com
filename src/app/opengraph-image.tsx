import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = 'PepPlotter - Peptide Reconstitution & GLP-1 Half-Life Calculator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #030712 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.8)',
            }}
          />
          <span
            style={{
              color: '#10b981',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Clinical Harm-Reduction Engineering
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-1.5px',
            marginBottom: '16px',
          }}
        >
          PepPlotter
        </div>

        <p
          style={{
            fontSize: '26px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            margin: '0 0 36px 0',
          }}
        >
          Visual Peptide Reconstitution Calculator &amp; Pharmacokinetic Half-Life Plotter
        </p>

        <div
          style={{
            display: 'flex',
            gap: '18px',
          }}
        >
          <div
            style={{
              padding: '12px 26px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            U-100 / U-40 Syringe Visualizer
          </div>
          <div
            style={{
              padding: '12px 26px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#22d3ee',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Bateman Sub-Q PK Simulator
          </div>
          <div
            style={{
              padding: '12px 26px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#cbd5e1',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Zero Dosing-Data Logs
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
