import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardX, Leaf, Scale, Users } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Button, EmptyState, ErrorBanner, GradeBadge, Spinner } from '../../components/ui'
import { questionnaireApi } from '../../api/questionnaire'
import { apiErrorMessage } from '../../api/client'
import type { QuestionCategory, QuestionDTO, QuestionnaireStatusDTO } from '../../types'

const STEPS: { category: QuestionCategory; label: string; icon: typeof Leaf }[] = [
  { category: 'Environmental', label: 'Environmental', icon: Leaf },
  { category: 'Social', label: 'Social', icon: Users },
  { category: 'Governance', label: 'Governance', icon: Scale },
]

export function Questionnaire() {
  const [status, setStatus] = useState<QuestionnaireStatusDTO | null | undefined>(undefined)
  const [questions, setQuestions] = useState<QuestionDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<{ totalScore: number; esgGrade: string } | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([questionnaireApi.getMyStatus().catch(() => null), questionnaireApi.getQuestions()])
      .then(([s, q]) => {
        if (!active) return
        setStatus(s)
        setQuestions(q)
      })
      .catch((err) => active && setLoadError(apiErrorMessage(err, 'Could not load the questionnaire.')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const grouped = useMemo(() => {
    const map: Record<QuestionCategory, QuestionDTO[]> = { Environmental: [], Social: [], Governance: [] }
    for (const q of questions) map[q.category].push(q)
    return map
  }, [questions])

  if (loading) return <Spinner />

  if (loadError) return <ErrorBanner message={loadError} />

  if (status === null) {
    return (
      <div>
        <PageTitle />
        <EmptyState
          icon={<ClipboardX size={32} strokeWidth={1.5} />}
          title="No questionnaire assigned yet"
          body="An administrator needs to assign your ESG questionnaire before you can start answering. Check back soon, or reach out to your GreenVendor admin contact."
        />
      </div>
    )
  }

  if (status?.status === 'Submitted' || result) {
    const grade = result?.esgGrade ?? status?.esgGrade ?? null
    const score = result?.totalScore ?? status?.totalScore ?? null
    return (
      <div>
        <PageTitle />
        <div className={dash.card} style={{ maxWidth: '30rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <GradeBadge grade={grade} size="lg" />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{score != null ? score.toFixed(1) : '—'} / 100</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total GreenRatio score</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              background: 'var(--primary-light)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              color: '#0d6b3f',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            Your questionnaire has been submitted and can&apos;t be edited again. This score is now visible to
            buyers browsing the catalog.
          </div>
        </div>
      </div>
    )
  }

  const currentStep = STEPS[stepIdx]
  const currentQuestions = grouped[currentStep.category]
  const isLastStep = stepIdx === STEPS.length - 1
  const answeredInStep = currentQuestions.every((q) => answers[q.id])
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id])

  const submit = async () => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const res = await questionnaireApi.submit({
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId: Number(questionId),
          selectedOption,
        })),
      })
      setResult(res)
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Could not submit your answers. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageTitle />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const active = i === stepIdx
          const done = i < stepIdx
          return (
            <button
              key={step.category}
              onClick={() => setStepIdx(i)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: active ? 'var(--primary)' : 'var(--border-color)',
                background: active ? 'var(--primary-light)' : 'white',
                color: active ? 'var(--primary)' : done ? 'var(--text-dark)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              {step.label}
            </button>
          )
        })}
      </div>

      {submitError && <ErrorBanner message={submitError} />}

      <div className={dash.card}>
        {currentQuestions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No {currentStep.label.toLowerCase()} questions configured yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {currentQuestions.map((q, i) => (
              <div key={q.id}>
                <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
                  {i + 1}. {q.text}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.85rem',
                        border: '1px solid',
                        borderColor: answers[q.id] === opt ? 'var(--primary)' : '#e2e4e2',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        background: answers[q.id] === opt ? 'var(--primary-light)' : 'white',
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <Button variant="ghost" onClick={() => setStepIdx((i) => Math.max(0, i - 1))} disabled={stepIdx === 0}>
            Back
          </Button>

          {isLastStep ? (
            <Button onClick={submit} disabled={!allAnswered || submitting}>
              {submitting ? 'Submitting…' : 'Submit Questionnaire'}
            </Button>
          ) : (
            <Button onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))} disabled={!answeredInStep}>
              Next: {STEPS[stepIdx + 1]?.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function PageTitle() {
  return (
    <div className={dash.pageHeader}>
      <div>
        <h1 className={dash.pageTitle}>ESG Questionnaire</h1>
        <p className={dash.pageSubtitle}>
          Answer honestly across Environmental, Social, and Governance — your GreenRatio grade is calculated
          automatically from a weighted average (40 / 35 / 25).
        </p>
      </div>
    </div>
  )
}
