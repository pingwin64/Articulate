import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          borderRadius: '40px',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '80px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            width: '16px',
            height: '56px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            width: '16px',
            height: '80px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
