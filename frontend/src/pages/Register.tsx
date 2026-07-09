import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

import styles from './login.module.css'
import { useAuth, homeRouteForRole } from '../context/AuthContext'
import { apiErrorMessage } from '../api/client'
import { ErrorBanner } from '../components/ui'
import { INDUSTRIES, type Industry } from '../types'

const schema = z
  .object({
    role: z.enum(['Supplier', 'Buyer']),
    companyName: z.string().min(2, 'Company name is required'),
    industry: z.string().min(1, 'Select an industry'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Buyer', industry: 'Manufacturing' },
  })

  const role = watch('role')

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const assignedRole = await registerUser({
        email: data.email,
        password: data.password,
        role: data.role,
        companyName: data.companyName,
        industry: data.industry as Industry,
      })
      navigate(homeRouteForRole(assignedRole), { replace: true })
    } catch (err) {
      setServerError(apiErrorMessage(err, 'Could not create your account. Please try again.'))
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.leftColumn}>
          <h2 className={styles.bannerTitle}>Join the ESG-transparent B2B marketplace</h2>
          <div className={styles.benefitList}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitNumber}>1</div>
              <div className={styles.benefitText}>
                <h3>List or discover in minutes</h3>
                <p>Suppliers list products, buyers browse a scored catalog — no spreadsheets.</p>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitNumber}>2</div>
              <div className={styles.benefitText}>
                <h3>Your GreenRatio score</h3>
                <p>A transparent Environmental / Social / Governance breakdown, visible to buyers.</p>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitNumber}>3</div>
              <div className={styles.benefitText}>
                <h3>Free to get started</h3>
                <p>Create an account, complete your profile, and you&apos;re live.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <h1 className={styles.loginTitle}>Create your account</h1>
          <p className={styles.loginSubtitle}>Choose how you&apos;ll use GreenVendor</p>

          {serverError && <ErrorBanner message={serverError} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.roleToggle}>
              <div
                className={clsx(styles.roleOption, role === 'Buyer' && styles.roleOptionActive)}
                onClick={() => setValue('role', 'Buyer')}
              >
                I&apos;m a Buyer
                <small>Sourcing from suppliers</small>
              </div>
              <div
                className={clsx(styles.roleOption, role === 'Supplier' && styles.roleOptionActive)}
                onClick={() => setValue('role', 'Supplier')}
              >
                I&apos;m a Supplier
                <small>Listing products</small>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Company Name</label>
              <input
                type="text"
                className={styles.formInput}
                {...register('companyName')}
                placeholder="Acme Manufacturing LLP"
              />
              {errors.companyName && <p className={styles.fieldError}>{errors.companyName.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Industry</label>
              <select className={styles.formInput} {...register('industry')}>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {errors.industry && <p className={styles.fieldError}>{errors.industry.message}</p>}
            </div>

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
                placeholder="At least 8 characters"
              />
              {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Confirm Password</label>
              <input
                type="password"
                className={styles.formInput}
                {...register('confirmPassword')}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className={styles.fieldError}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className={styles.spin} /> : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
