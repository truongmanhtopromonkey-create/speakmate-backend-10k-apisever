import { db } from '../db/client.js';
import { env } from '../config/env.js';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function assertUsageField(field) {
  const allowed = new Set(['review_count', 'conversation_turn_count', 'tts_count', 'stt_count']);
  if (!allowed.has(field)) {
    const error = new Error('Invalid usage field');
    error.statusCode = 500;
    error.code = 'INVALID_USAGE_FIELD';
    throw error;
  }
}

function normalizeFeatureKey(featureKey) {
  const key = String(featureKey || '').trim();
  const allowed = new Set(['speaking_practice', 'quick_drill', 'ai_conversation', 'tts_voice']);
  return allowed.has(key) ? key : 'speaking_practice';
}

let featureTrialTableReady;
async function ensureFeatureTrialTable() {
  if (!featureTrialTableReady) {
    featureTrialTableReady = db.query(`
      create table if not exists usage_feature_trials (
        app_user_id text not null,
        feature_key text not null,
        count int not null default 0,
        updated_at timestamptz not null default now(),
        primary key (app_user_id, feature_key)
      )
    `);
  }
  return featureTrialTableReady;
}

export async function getOrCreateUser(appUserId, isPremium) {
  const existing = await db.query('select * from users where app_user_id = $1 limit 1', [appUserId]);
  if (existing.rows[0]) {
    await db.query('update users set last_active_at = now(), is_premium = $2 where app_user_id = $1', [appUserId, Boolean(isPremium)]);
    return { ...existing.rows[0], is_premium: Boolean(isPremium) };
  }

  const inserted = await db.query(
    'insert into users (app_user_id, is_premium) values ($1, $2) returning *',
    [appUserId, Boolean(isPremium)]
  );
  return inserted.rows[0];
}

export async function getDailyUsage(appUserId) {
  const key = todayKey();
  const result = await db.query(
    `insert into usage_daily (app_user_id, date_key)
     values ($1, $2)
     on conflict (app_user_id, date_key) do update set app_user_id = excluded.app_user_id
     returning *`,
    [appUserId, key]
  );
  return result.rows[0];
}

export async function incrementUsage(appUserId, field) {
  assertUsageField(field);
  const key = todayKey();
  await db.query(
    `insert into usage_daily (app_user_id, date_key, ${field}) values ($1, $2, 1)
     on conflict (app_user_id, date_key) do update set ${field} = usage_daily.${field} + 1`,
    [appUserId, key]
  );
}

export async function getFeatureTrialCount(appUserId, featureKey) {
  await ensureFeatureTrialTable();
  const normalized = normalizeFeatureKey(featureKey);
  const result = await db.query(
    'select count from usage_feature_trials where app_user_id = $1 and feature_key = $2 limit 1',
    [appUserId, normalized]
  );
  return Number(result.rows[0]?.count || 0);
}

export async function incrementFeatureTrial(appUserId, featureKey) {
  await ensureFeatureTrialTable();
  const normalized = normalizeFeatureKey(featureKey);
  await db.query(
    `insert into usage_feature_trials (app_user_id, feature_key, count)
     values ($1, $2, 1)
     on conflict (app_user_id, feature_key)
     do update set count = usage_feature_trials.count + 1, updated_at = now()`,
    [appUserId, normalized]
  );
}

function limitError(message, code = 'DAILY_LIMIT') {
  const error = new Error(message);
  error.statusCode = 429;
  error.code = code;
  return error;
}

async function assertFeatureTrialAllowed(appUserId, featureKey) {
  const count = await getFeatureTrialCount(appUserId, featureKey);
  if (count >= env.freeTrialLimitPerFeature) {
    throw limitError('Free trial limit reached', 'FREE_TRIAL_LIMIT');
  }
}

export async function assertReviewAllowed(appUserId, isPremium, featureKey = 'speaking_practice') {
  if (isPremium) {
    const usage = await getDailyUsage(appUserId);
    const count = usage.review_count || 0;
    if (count >= env.premiumDailySoftLimit) {
      throw limitError('Premium daily review soft limit reached');
    }
    return;
  }

  await assertFeatureTrialAllowed(appUserId, featureKey);
}

export async function assertConversationAllowed(appUserId, isPremium) {
  if (isPremium) {
    const usage = await getDailyUsage(appUserId);
    const count = usage.conversation_turn_count || 0;
    if (count >= env.premiumConversationTurnsDaily) {
      throw limitError('Conversation daily limit reached');
    }
    return;
  }

  await assertFeatureTrialAllowed(appUserId, 'ai_conversation');
}

export async function assertTtsAllowed(appUserId, isPremium) {
  if (isPremium) {
    const usage = await getDailyUsage(appUserId);
    const count = usage.tts_count || 0;
    if (count >= env.premiumTtsDaily) {
      throw limitError('Premium daily voice limit reached');
    }
    return;
  }

  await assertFeatureTrialAllowed(appUserId, 'tts_voice');
}
