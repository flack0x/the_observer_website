import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'The Observer - Geopolitical Intelligence & Analysis';
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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f1419',
          backgroundImage: 'linear-gradient(135deg, #0f1419 0%, #1b3a57 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 40,
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c9a227"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 14c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
              <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#e8eaed',
              letterSpacing: '-0.02em',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            The Observer
          </h1>
          <p
            style={{
              fontSize: 28,
              color: '#9aa0a6',
              marginTop: 20,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Geopolitical Intelligence & Analysis
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 40,
              padding: '12px 24px',
              backgroundColor: 'rgba(201, 162, 39, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(201, 162, 39, 0.3)',
            }}
          >
            <span style={{ color: '#c9a227', fontSize: 18 }}>
              Independent Analysis • Strategic Insights • Global Coverage
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
