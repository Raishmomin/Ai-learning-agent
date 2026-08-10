// ============================================
// Send Day 1 Tasks to Telegram
// ============================================

import 'dotenv/config';
import { sendTelegramNotification } from '../src/lib/notifications/telegram';

async function testSend() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log('🤖 Bot Token:', token ? `${token.substring(0, 12)}...` : 'MISSING');
  console.log('👤 Chat ID:', chatId || 'MISSING');

  const message = `🎉 *AI Learning Accelerator — Day 1 Tasks*\n\n` +
    `1. 🗣️ *Beginner English*: Daily Routines & Present Simple Tense (A1)\n` +
    `2. 📖 *Vocabulary*: Everyday Workplace Words\n` +
    `3. 🧠 *Deep Technical*: JavaScript Event Loop & Microtasks Masterclass\n` +
    `4. 🏗️ *Case Study*: Booking.com 1M Bookings/Day Architecture\n` +
    `5. 💻 *Coding Challenge*: JWT Auth System & Two-Pointer Algorithm\n` +
    `6. 🚨 *Production Incident*: DB Connection Pool Exhaustion Debugging\n\n` +
    `🚀 Open Dashboard: http://localhost:3000/dashboard`;

  const success = await sendTelegramNotification(message);

  if (success) {
    console.log('✅ Telegram message SENT successfully to your phone!');
  } else {
    console.log('⚠️ Could not send Telegram message.');
  }
}

testSend().catch(console.error);
