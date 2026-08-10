// ============================================
// Local Telegram Polling Service
// Listens for messages on Telegram (e.g., "task 1", "task 2", "task 3")
// and responds immediately in local development.
// ============================================

import 'dotenv/config';
import { handleTelegramMessage } from '../src/app/api/telegram/webhook/route';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN is missing in .env!');
  process.exit(1);
}

let offset = 0;
console.log('🤖 Telegram Long-Polling Service Started...');
console.log('📱 You can now open Telegram and send commands like:');
console.log('   - "today"');
console.log('   - "task 1"');
console.log('   - "task 2"');
console.log('   - "task 3"\n');

async function pollUpdates() {
  while (true) {
    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message;

          if (msg && msg.text) {
            const chatId = msg.chat.id;
            const text = msg.text;
            const sender = msg.from?.first_name || 'User';

            console.log(`📩 [Received from ${sender} (Chat ${chatId})]: "${text}"`);
            await handleTelegramMessage(chatId, text);
            console.log(`✅ [Replied to ${sender}]\n`);
          }
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

pollUpdates();
