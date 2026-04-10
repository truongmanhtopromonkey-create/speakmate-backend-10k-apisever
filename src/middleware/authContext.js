export function authContext(req, _res, next) {
  req.appUserId = req.header('x-user-id') || req.body?.userId || 'anonymous';
  req.isPremium = String(req.header('x-premium-user') || 'false') === 'true';
  next();
}
