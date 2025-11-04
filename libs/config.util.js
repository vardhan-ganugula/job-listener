import dotenv from "dotenv";

dotenv.config();


const port = process.env.PORT || 3000;
const openaiApiKey = process.env.OPENAI_API_KEY;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const mongodbURI = process.env.MONGODB_URI;

if(!port || !openaiApiKey || !telegramBotToken || !mongodbURI) {
    throw new Error("ENV Error");
}
export { port, openaiApiKey, telegramBotToken,mongodbURI };