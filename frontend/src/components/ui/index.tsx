import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { AlertCircle, Inbox } from 'lucide-react'
import styles from './ui.module.css'

export function Spinner() {
  return (
    <div className={styles.spinnerRow}>
      <div className={styles.spinner} />
    </div>
  )
}

interface EmptyStateProps {
  title: string
  body?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, body, icon, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>{icon ?? <Inbox size={32} strokeWidth={1.5} />}</div>
      <div className={styles.emptyStateTitle}>{title}</div>
      {body && <p className={styles.emptyStateBody}>{body}</p>}
      {action}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className={styles.errorBanner}>
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </div>
  )
}

const GRADE_CLASS: Record<string, string> = {
  A: styles.gradeA,
  B: styles.gradeB,
  C: styles.gradeC,
  D: styles.gradeD,
  F: styles.gradeF,
}

export function GradeBadge({ grade, size = 'sm' }: { grade?: string | null; size?: 'sm' | 'lg' }) {
  const cls = grade ? GRADE_CLASS[grade] ?? styles.gradeNone : styles.gradeNone
  return (
    <span className={clsx(styles.gradeBadge, size === 'lg' ? styles.gradeBadgeLg : styles.gradeBadgeSm, cls)}>
      {grade ?? '–'}
    </span>
  )
}

const STATUS_CLASS: Record<string, string> = {
  Pending: styles.statusPending,
  Confirmed: styles.statusConfirmed,
  Rejected: styles.statusRejected,
  Completed: styles.statusCompleted,
  Draft: styles.statusDraft,
  InProgress: styles.statusInProgress,
  Submitted: styles.statusSubmitted,
}

export function StatusPill({ status }: { status: string }) {
  return <span className={clsx(styles.statusPill, STATUS_CLASS[status] ?? styles.statusDraft)}>{status}</span>
}

export function VerifiedPill({ verified }: { verified: boolean }) {
  return (
    <span className={clsx(styles.statusPill, verified ? styles.statusVerified : styles.statusUnverified)}>
      {verified ? 'Verified' : 'Unverified'}
    </span>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'md' | 'sm'
  full?: boolean
}

export function Button({ variant = 'primary', size = 'md', full, className, ...rest }: ButtonProps) {
  const variantClass =
    variant === 'primary' ? styles.btnPrimary : variant === 'danger' ? styles.btnDanger : styles.btnGhost
  return (
    <button
      className={clsx(styles.btn, variantClass, size === 'sm' && styles.btnSm, full && styles.btnFull, className)}
      {...rest}
    />
  )
}
