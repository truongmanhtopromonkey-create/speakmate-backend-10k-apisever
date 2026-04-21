import { z } from 'zod';
import { normalizeLearningLanguage, normalizeLocale, SUPPORTED_UI_LANGUAGES } from '../lib/language.js';

const uiLanguageSchema = z.preprocess(
  value => normalizeLocale(value),
  z.enum(SUPPORTED_UI_LANGUAGES)
);

const learningLanguageSchema = z.preprocess(
  value => normalizeLearningLanguage(value),
  z.string().min(2)
);

export const reviewSpeakingRequestSchema = z.object({
  transcript: z.string().trim().min(1),
  topicTitle: z.string().trim().min(1),
  uiLanguage: uiLanguageSchema.default('en'),
  learningLanguage: learningLanguageSchema.default('en'),
  source: z.enum(['speaking_practice', 'quick_drill', 'practice', 'challenge']).optional().default('speaking_practice')
});

export const conversationMessagePayloadSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1)
});

export const conversationReplyRequestSchema = z.object({
  mode: z.string().trim().min(1),
  goal: z.string().trim().optional().nullable(),
  roleplay: z.string().trim().optional().nullable(),
  userMessage: z.string().trim().min(1),
  history: z.array(conversationMessagePayloadSchema).default([]),
  uiLanguage: uiLanguageSchema.default('en'),
  learningLanguage: learningLanguageSchema.default('en')
});

export const conversationVoiceRequestSchema = z.object({
  mode: z.string().trim().min(1),
  goal: z.string().trim().optional().nullable(),
  roleplay: z.string().trim().optional().nullable(),
  history: z.array(conversationMessagePayloadSchema).default([]),
  uiLanguage: uiLanguageSchema.default('en'),
  learningLanguage: learningLanguageSchema.default('en')
});

export const ttsRequestSchema = z.object({
  text: z.string().trim().min(1),
  voice: z.string().trim().default('alloy')
});

export const reviewSpeakingResponseSchema = z.object({
  correctedText: z.string(),
  aiScore: z.number().int(),
  pronunciationScore: z.number().int(),
  grammarScore: z.number().int(),
  fluencyScore: z.number().int(),
  vocabularyScore: z.number().int(),
  summary: z.string(),
  overallRating: z.string(),
  praise: z.array(z.string()),
  improvements: z.array(z.object({
    original: z.string(),
    better: z.string(),
    reason: z.string()
  })),
  pronunciationWords: z.array(z.object({
    word: z.string(),
    tip: z.string()
  })),
  nextStep: z.string(),
  errors: z.array(z.object({
    original: z.string(),
    suggestion: z.string(),
    type: z.string(),
    explanation: z.string()
  })),
  meta: z.object({
    cached: z.boolean().optional(),
    isPremium: z.boolean().optional(),
    isFallback: z.boolean().optional()
  }).optional(),
  advancedAnswer: z.string().nullable().optional()
});

export const conversationReplyResponseSchema = z.object({
  reply: z.string(),
  correctedUserText: z.string().nullable().optional(),
  quickFeedback: z.string().nullable().optional(),
  suggestedReplies: z.array(z.string()).optional().default([]),
  score: z.object({
    grammar: z.number().int(),
    fluency: z.number().int(),
    naturalness: z.number().int()
  }).nullable().optional(),
  pronunciation: z.object({
    hardWords: z.array(z.string()),
    tip: z.string()
  }).nullable().optional(),
  isFallback: z.boolean().optional(),
  userTranscript: z.string().optional()
});
