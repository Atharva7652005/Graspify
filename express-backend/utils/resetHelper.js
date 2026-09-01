async function ensureUploadsReset(user) {
  if (!user) return user;

  const today = new Date().toISOString().split('T')[0];
  let updated = false;

  if (user.uploadsToday?.date !== today) {
    user.uploadsToday = { count: 0, date: today };
    updated = true;
  }

  if (user.docUploadsToday?.date !== today) {
    user.docUploadsToday = { count: 0, date: today };
    updated = true;
  }

  if (user.regenerationsToday?.date !== today) {
    user.regenerationsToday = { count: 0, date: today };
    updated = true;
  }

  if (updated && typeof user.save === 'function') {
    await user.save();
  }

  return user;
}

module.exports = { ensureUploadsReset };
