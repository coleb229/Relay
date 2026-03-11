export interface AttemptAnswerInput {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
}

export interface GradedAnswer {
  questionId: string;
  isCorrect: boolean;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
}

export interface AttemptResult {
  id: string;
  score: number;
  submittedAt: string;
  answers: GradedAnswer[];
}
