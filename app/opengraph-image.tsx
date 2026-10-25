import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'ORBIT Intelligence — your next opportunity is out there';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F6F7F9',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="12" rx="9.5" ry="4.6" stroke="#EC4899" strokeWidth="1.6" transform="rotate(-28 12 12)" />
            <ellipse cx="12" cy="12" rx="9.5" ry="4.6" stroke="#EC4899" strokeWidth="1.6" opacity="0.45" transform="rotate(38 12 12)" />
            <circle cx="12" cy="12" r="3.4" fill="#EC4899" />
          </svg>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 600, color: '#101319' }}>ORBIT Intelligence</div>
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 68,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#101319',
            textAlign: 'center',
            padding: '0 80px',
          }}
        >
          Your next opportunity is out there.
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: '#5B6472' }}>
          Monitor anything · Score every match · Move first
        </div>
      </div>
    ),
    size
  );
}
