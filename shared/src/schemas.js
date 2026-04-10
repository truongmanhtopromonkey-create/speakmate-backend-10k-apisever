import { z } from 'zod';

export const reviewSpeakingRequestSchema = z.object({
  transcript: z.string().min(1),
  topicTitle: z.string().min(1)
});

export const conversationMessagePayloadSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1)
});

export const conversationReplyRequestSchema = z.object({
  mode: z.string().min(1),
  goal: z.string().optional().nullable(),
  roleplay: z.string().optional().nullable(),
  userMessage: z.string().min(1),
  history: z.array(conversationMessagePayloadSchema).default([])
});

export const ttsRequestSchema = z.object({
  text: z.string().min(1),
  voice: z.string().default('alloy')
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
  isFallback: z.boolean().optional()
});
