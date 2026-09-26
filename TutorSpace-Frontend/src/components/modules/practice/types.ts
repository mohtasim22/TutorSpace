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
  createdAt: string
  course?: { name?: string }
  material?: { title?: string }
}
