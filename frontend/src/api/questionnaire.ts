import { api } from './client'
import { normalizeQuestionCategory, normalizeQuestionnaireStatus } from './enumMap'
import type { EsgScoreResultDTO, QuestionDTO, QuestionnaireStatusDTO, SubmitQuestionnaireRequest } from '../types'

export const questionnaireApi = {
  getQuestions: () =>
    api
      .get<QuestionDTO[]>('/questionnaire/questions')
      .then((r) => r.data.map((q) => ({ ...q, category: normalizeQuestionCategory(q.category) }))),

  // The backend returns 200 with an empty body when no questionnaire has
  // been assigned to this supplier yet (see AdminController.CreateQuestionnaire).
  getMyStatus: () =>
    api.get<QuestionnaireStatusDTO | null>('/questionnaire/my').then((r) =>
      r.data ? { ...r.data, status: normalizeQuestionnaireStatus(r.data.status) } : null,
    ),

  submit: (payload: SubmitQuestionnaireRequest) =>
    api.post<EsgScoreResultDTO>('/questionnaire/submit', payload).then((r) => r.data),
}
