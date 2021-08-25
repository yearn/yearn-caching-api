import fetch from "cross-fetch";

export const sendMessage = (text) => {
  if (!process.env.TELEGRAM_CHAT_ID || !process.env.TELEGRAM_BOT_ID) {
    return;
  }
  const params = new URLSearchParams({
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: `API error:\n${text}`,
    disable_web_page_preview: "true",
  });
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_ID}/sendMessage?` + params;
  fetch(url);
};
