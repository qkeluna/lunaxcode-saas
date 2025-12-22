import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Lunaxcode - Web Development Agency Philippines';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a2e 50%, #2d1b4e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gradient circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          }}
        />

        {/* Logo/Brand */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 24,
            letterSpacing: '-2px',
          }}
        >
          Lunaxcode
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#e2e8f0',
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          Web Development Agency
        </div>

        {/* Location & Pricing */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span>Metro Manila, Philippines</span>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ color: '#a78bfa' }}>From PHP8,000</span>
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: 48,
          }}
        >
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#c4b5fd',
              fontSize: 18,
            }}
          >
            AI-Powered PRD
          </div>
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#93c5fd',
              fontSize: 18,
            }}
          >
            Fixed Pricing
          </div>
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#86efac',
              fontSize: 18,
            }}
          >
            Fast Delivery
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
