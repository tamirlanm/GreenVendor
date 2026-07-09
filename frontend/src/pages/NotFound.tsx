import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        gap: '0.75rem',
      }}
    >
      <Leaf size={36} color="var(--primary)" strokeWidth={1.5} />
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)' }}>Page not found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '26rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        to="/"
        style={{
          marginTop: '1rem',
          background: 'var(--primary)',
          color: 'white',
          fontWeight: 700,
          padding: '0.7rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
        }}
      >
        Back to home
      </Link>
    </div>
  )
}
