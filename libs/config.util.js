import dotenv from "dotenv";

dotenv.config();


const port = process.env.PORT || 3000;
const openaiApiKey = process.env.OPENAI_API_KEY;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

if(!port || !openaiApiKey || !telegramBotToken) {
    throw new Error("PORT or OPENAI_API_KEY or TELEGRAM_BOT_TOKEN is not set");
}
export { port, openaiApiKey, telegramBotToken };