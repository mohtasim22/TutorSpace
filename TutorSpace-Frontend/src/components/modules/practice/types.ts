export type PracticeQuestion = {
  type: "mcq" | "short_answer"
  question: string
  options: string[]
  answer: string
  explanation: string
}

export type PracticeSet = {
  id: string
  title: string
  questions: PracticeQuestion[]
  is_published: boolean
  /** Set when a student generated this quiz for themselves. */
  student_id?: string | null
  createdAt: string
  course?: { name?: string }
  material?: { title?: string }
}

export type MaterialSummary = {
  overview: string
  key_points: string[]
  key_terms: { term: string; meaning: string }[]
}

export type Material = {
  id: string
  title: string
  file_url: string
  summary?: MaterialSummary | null
  summary_at?: string | null
  course?: { name?: string }
}

/** Only PDFs can be summarised or turned into a quiz. Mirrors the API rule. */
export const isPdf = (url: string) => /\.pdf($|\?)/i.test(url)
