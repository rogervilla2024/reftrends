import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'RefTrends - Referee Statistics & Betting Analytics';
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
          fontSize: 48,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '48px',
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#22c55e',
            }}
          >
            RefTrends
          </span>
        </div>
        <div
          style={{
            fontSize: '36px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Referee Statistics & Betting Analytics
        </div>
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
            }}
          >
            <span style={{ fontSize: '32px', color: '#22c55e', fontWeight: 'bold' }}>500+</span>
            <span style={{ fontSize: '18px', color: '#71717a' }}>Referees</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
            }}
          >
            <span style={{ fontSize: '32px', color: '#22c55e', fontWeight: 'bold' }}>8</span>
            <span style={{ fontSize: '18px', color: '#71717a' }}>Leagues</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
            }}
          >
            <span style={{ fontSize: '32px', color: '#22c55e', fontWeight: 'bold' }}>10K+</span>
            <span style={{ fontSize: '18px', color: '#71717a' }}>Matches</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
