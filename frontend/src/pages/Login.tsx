import { useForm } from 'react-hook-form'

import styles from './login.module.css'

export function Login() {

    const { register, handleSubmit } = useForm()

    const onSubmit = (data: any) => {
        console.log("Form submitted!", data);
        alert(`Attempting to login with email: ${data.email}`);
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
                                <h3>Smart Matching</h3>
                                <p>Let our ML service match you with suppliers that fit your business needs.</p>
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


                    <form onSubmit={handleSubmit(onSubmit)}>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Email Address</label>
                            
                            <input 
                                type='email'
                                className={styles.formInput}
                                {...register('email')}
                                placeholder='you@company.com'
                                required
                            />
                        </div>


                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Password</label>
                            <input 
                                type='password'
                                className={styles.formInput}
                                {...register('password')}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type='submit' className={styles.submitButton}>
                            Sign in with Email
                        </button>

                    </form>

                </div>

            </div>

        </div>
    )

}

