import { db } from '../db/client.js';
import { env } from '../config/env.js';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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
  const key = todayKey();
  await db.query(
    `insert into usage_daily (app_user_id, date_key, ${field}) values ($1, $2, 1)
     on conflict (app_user_id, date_key) do update set ${field} = usage_daily.${field} + 1`,
    [appUserId, key]
  );
}

export async function assertReviewAllowed(appUserId, isPremium) {
  const usage = await getDailyUsage(appUserId);
  const count = usage.review_count || 0;
  const limit = isPremium ? env.premiumDailySoftLimit : env.freeDailyLimit;
  if (count >= limit) {
    const error = new Error('Daily limit reached');
    error.statusCode = 429;
    error.code = 'DAILY_LIMIT';
    throw error;
  }
}

export async function assertConversationAllowed(appUserId, isPremium) {
  const usage = await getDailyUsage(appUserId);
  const count = usage.conversation_turn_count || 0;
  const limit = isPremium ? env.premiumConversationTurnsDaily : env.freeConversationTurnsDaily;
  if (count >= limit) {
    const error = new Error('Conversation daily limit reached');
    error.statusCode = 429;
    error.code = 'DAILY_LIMIT';
    throw error;
  }
}
