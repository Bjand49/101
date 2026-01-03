import { useEffect, useState } from 'react';
import { loadingService } from '../services/loadingService';

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingService.subscribe(setIsLoading);
    return unsubscribe;
  }, []);

  // Only show a small toast for requests that take
  // longer than a short threshold, so quick actions
  // in the game won't flash a loader.
  useEffect(() => {
    let timeoutId: number | undefined;

    if (isLoading) {
      timeoutId = globalThis.setTimeout(() => {
        setShowToast(true);
      }, 400); // only show after 400ms
    } else {
      setShowToast(false);
    }

    return () => {
      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  if (!showToast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: '1.25rem',
        bottom: '1.25rem',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '0.9rem 1.3rem',
          borderRadius: '0.75rem',
          backgroundColor: 'white',
          boxShadow: '0 10px 30px rgba(15,23,42,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#0f172a',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '1.25rem',
            height: '1.25rem',
            borderRadius: '999px',
            border: '2px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            animation: 'loading-spinner 0.75s linear infinite',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}
          >
            Loading data
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '0.1rem',
            }}
          >
            This may take a moment.
          </span>
        </div>
      </div>
      <style>
        {`
          @keyframes loading-spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
