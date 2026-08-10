// ============================================
// Telegram Notification Service
// Sends daily briefings, reminders, and performance reports via Telegram Bot API
// ============================================

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Notification (Simulated)]:\n' + message);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Telegram Error ${res.status}]: ${errText}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Telegram Notification Failed]:', err);
    return false;
  }
}
