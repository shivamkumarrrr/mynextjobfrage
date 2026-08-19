/**
 * Shapes of the runtime-fetched quiz config (`quizzes/<id>.json`) and of the
 * webhook payload. The payload half is an external integration contract —
 * other systems already consume it, so field names and nesting are frozen.
 */

export type QuestionType = 'single_select' | 'multi_select' | 'text_input';

export interface AnswerOption {
  text: string;
  points?: number | null;
  exclusive?: boolean;
}

export interface Question {
  id: string;
  category: string;
  type: QuestionType;
  question: string;
  answers?: AnswerOption[];
  maxPoints?: number;
  correctAnswer?: number;
  placeholder?: string;
  hint?: string;
  points?: number | null;
  image?: string;
}

export interface Category {
  label: string;
  weight: number;
}

export interface Tier {
  id: string;
  label: string;
  min: number;
}

export interface KnockoutRule {
  type?: 'AND' | 'OR';
  rules?: KnockoutRule[];
  questionId?: string;
  answerIndex?: number | number[];
}

export interface KnockoutFlagConfig {
  id: string;
  description: string;
  rules?: KnockoutRule;
}

export interface LeadField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  half?: boolean;
  placeholder?: string;
  help?: string;
  errorMessage?: string;
}

export interface LeadFormConfig {
  heading?: string;
  subtitle?: string;
  submitLabel?: string;
  salutation?: boolean;
  salutationLabel?: string;
  whatsappOptIn?: boolean | string;
  privacyNote?: string;
  fields?: LeadField[];
}

export interface Branding {
  primary?: string;
  accent?: string;
  bg?: string;
  text?: string;
  radius?: string;
  font?: string;
  logoUrl?: string;
  heroImage?: string;
  thankYouImage?: string;
}

export interface ThankYouConfig {
  headline?: string;
  body?: string;
  footerNote?: string;
  share?: { whatsapp?: boolean; linkedin?: boolean; facebook?: boolean };
  shareUrl?: string;
  shareText?: string;
}

export interface ScoringConfig {
  rejectThreshold?: number;
  matchScreen?: { headline?: string; body?: string };
  rejectScreen?: { headline?: string; body?: string; showShare?: boolean };
}

export interface QuizConfig {
  quizId?: string;
  quizVersion?: string;
  language?: { pronoun?: string };
  topbarLabel?: string;
  progressLabel?: string;
  continueLabel?: string;
  branding?: Branding;
  job?: { title?: string; company?: string };
  steps?: { id: string; label: string }[];
  welcome?: { intro?: string; metaText?: string; startButton?: string };
  categories?: Record<string, Category>;
  tiers?: Tier[];
  scoring?: ScoringConfig;
  knockoutFlags?: KnockoutFlagConfig[];
  questions?: Question[];
  leadForm?: LeadFormConfig;
  thankYou?: ThankYouConfig;
  webhook?: { url?: string };
}

/** One recorded answer — this is also the payload's `answers[]` element shape. */
export interface AnswerRecord {
  questionId: string;
  questionText: string;
  answer: string;
  answerIndex: number | number[] | null;
  points: number | null;
  category: string;
  isCorrect?: boolean;
}

export interface CategoryScore {
  score: number;
  weight: number;
  weighted: number;
  label: string;
}

export interface Scoring {
  total: number;
  tier: { id: string; label: string; min: number } | null;
  categories: Record<string, CategoryScore>;
  hasKnockout: boolean;
}

export interface KnockoutFlagResult {
  id: string;
  description: string;
  triggered: boolean;
}

export interface Candidate {
  salutation: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  message: string;
  whatsappOptIn: boolean;
}

export interface PayloadMeta {
  device: string;
  completionTimeSeconds: number;
  referrer: string;
  userAgent: string;
}

export interface WebhookPayload {
  quizId: string | null;
  quizVersion: string;
  timestamp: string;
  candidate: Candidate | null;
  scoring: Scoring;
  knockoutFlags: KnockoutFlagResult[];
  answers: AnswerRecord[];
  meta: PayloadMeta | Record<string, never>;
  result?: { passed: boolean; rejected: boolean; rejectionReason: string | null };
}

/**
 * The single evaluation of a completed quiz: computed once when the last
 * question is answered, then read by BOTH the routing decision and the webhook
 * payload. Nothing recomputes scoring downstream.
 */
export interface QuizResult {
  scoring: Scoring;
  knockoutFlags: KnockoutFlagResult[];
  passed: boolean;
  rejectionReason: string | null;
}
