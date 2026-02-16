import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          gap: '3px',
        }}
      >
        <div
          style={{
            width: '4px',
            height: '20px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            width: '4px',
            height: '14px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            width: '4px',
            height: '20px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
