import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Articulate — Read One Word at a Time';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '12px',
              height: '80px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.5)',
            }}
          />
          <div
            style={{
              width: '12px',
              height: '56px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.5)',
              marginTop: '12px',
            }}
          />
          <div
            style={{
              width: '12px',
              height: '80px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.5)',
            }}
          />
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          Read one word at a time.
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#999999',
          }}
        >
          Understand everything.
        </div>
      </div>
    ),
    { ...size }
  );
}
