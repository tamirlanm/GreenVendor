import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import styles from './login.module.css'
import { useAuth, homeRouteForRole } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'
import { ErrorBanner } from '../components/ui'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const role = await login(data)
      const redirectTo = (location.state as { from?: Location })?.from?.pathname
      navigate(redirectTo || homeRouteForRole(role), { replace: true })
    } catch (err) {
      setServerError(apiErrorMessage(err, 'Invalid email or password.'))
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.leftColumn}>
          <h2 className={styles.bannerTitle}>Find your perfect suitable supplier</h2>
          <div className={styles.benefitList}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitNumber}>1</div>
              <div className={styles.benefitText}>
                <h3>Verified ESG Profiles</h3>
                <p>Access transparent, checked sustainability metrics from potential suppliers</p>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitNumber}>2</div>
              <div className={styles.benefitText}>
                <h3>Powerful Filtering</h3>
                <p>Search and filter suppliers by industry, ESG grade, and pricing to find the right fit.</p>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitNumber}>3</div>
              <div className={styles.benefitText}>
                <h3>Quick Verification</h3>
                <p>Complete the full ESG questionnaire in less than 10 minutes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <h1 className={styles.loginTitle}>Welcome Back</h1>
          <p className={styles.loginSubtitle}>Sign in to access your GreenVendor account</p>

          {serverError && <ErrorBanner message={serverError} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                className={styles.formInput}
                {...register('email')}
                placeholder="you@company.com"
              />
              {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <input
                type="password"
                className={styles.formInput}
                {...register('password')}
                placeholder="••••••••"
              />
              {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className={styles.spin} /> : 'Sign in with Email'}
            </button>
          </form>

          <p className={styles.switchText}>
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
