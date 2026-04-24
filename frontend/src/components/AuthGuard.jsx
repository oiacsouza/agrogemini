import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';

/**
 * AuthGuard — wraps components that require authentication.
 *
 * Props:
 *   requiredRoles  — array of tipo_usuario codes allowed (e.g. ['UP','UC','ADM'])
 *   onUnauthorized — callback when user lacks auth/permission
 *   fallback       — optional loading element
 */
export function AuthGuard({ children, requiredRoles, onUnauthorized, fallback }) {
  const [status, setStatus] = useState('loading'); // loading | authorized | unauthorized

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      setStatus('unauthorized');
      return;
    }

    // Check role if requiredRoles specified
    if (requiredRoles && requiredRoles.length > 0) {
      const user = authService.getUser();
      if (!user || !requiredRoles.includes(user.tipo_usuario)) {
        setStatus('unauthorized');
        return;
      }
    }

    setStatus('authorized');
  }, [requiredRoles]);

  if (status === 'loading') {
    return fallback || <AuthLoadingScreen />;
  }

  if (status === 'unauthorized') {
    if (onUnauthorized) {
      // Use setTimeout to avoid state update during render
      setTimeout(() => onUnauthorized(), 0);
    }
    return null;
  }

  return children;
}

/**
 * Minimal loading screen shown while checking auth.
 */
function AuthLoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #1e293b',
          borderTop: '3px solid #10b981',
          borderRadius: '50%',
          animation: 'authSpin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Verificando autenticação...
        </p>
      </div>
      <style>{`
        @keyframes authSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
