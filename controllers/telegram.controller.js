import { telegramBotToken } from "../libs/config.util.js";


class TelegramController {
    constructor() {
        this.telegramBotToken = telegramBotToken;
        this.apiUrl = `https://api.telegram.org/bot${this.telegramBotToken}`; 
    }

    async sendMessage(chatId, message) {
        const response = await axios.post(`${this.apiUrl}/sendMessage`, {
            chat_id: chatId,
            text: message
        }); 
        return response.data;
    }

    async receiveMessage(message) {
        console.log(message);
    }
}

const telegramController = new TelegramController(telegramBotToken);

export default telegramController;