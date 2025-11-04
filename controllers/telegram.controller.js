import axios from "axios";
import { telegramBotToken } from "../libs/config.util.js";
import userModel from "../models/user.model.js";

class TelegramController {
  constructor() {
    this.telegramBotToken = telegramBotToken;
    this.apiUrl = `https://api.telegram.org/bot${this.telegramBotToken}`;
  }

  async init(webhookUrl) {
    try {
      const response = await axios.post(`${this.apiUrl}/setWebhook`, {
        url: webhookUrl,
      });
      console.log("WebHook set Successfully");
      return response.data;
    } catch (error) {
      console.error("Error initializing Telegram bot:", error.message);
      throw error;
    }
  }

  async sendMessage(chatId, message) {
    const response = await axios.post(`${this.apiUrl}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });
    return response.data;
  }

  async parseMessage(message) {
    const { from, chat, text } = message;
    if (!from?.id || !chat?.id) {
      return;
    }
    if (text[0] == "/") {
      await this.replyCommands(chat, text);
    } else {
      await this.replyAi(chat.id, text);
    }
  }

  async replyCommands(chat, text) {
    try {
      let responseText = "";
      const commandText = text.split(" ");

      switch (commandText[0]) {
        case "/start":
          await this.__createUser(chat.id, chat.username, chat.first_name);
          responseText =
            "👋 Welcome to the Job Listener!\n\nPlease share your resume text to store it.\n\nYou can also use the /help command to get started.";
          break;

        case "/help":
          responseText =
            "🧭 Here are my commands:\n/start - Start the bot\n/help - Get help\n/about - Learn about me\n/resume - Upload your resume text";
          break;

        case "/about":
          responseText =
            "🤖 I am a job listener bot that analyzes your resume using AI and notifies you when matching jobs are found!";
          break;

        case "/resume":
          const resumeText = text.split(" ").slice(1).join(" ");
          if (!resumeText) {
            responseText =
              "❗ Please provide your resume text after the command.\nExample: /resume Full Stack Developer skilled in React and Node.js";
          } else {
            await this._updateResume(chat.id, resumeText);
            responseText = "✅ Resume saved successfully!";
          }
          break;

        default:
          responseText =
            "❌ Unknown command.\nUse /help to see the available commands.";
      }

      const response = await this.sendMessage(chat.id, responseText);
      return response;
    } catch (error) {
      console.error("Error replying to command:", error.message);
      await this.sendMessage(
        chat.id,
        "⚠️ Internal error. Please try again later."
      );
    }
  }

  async replyAi(chatId, text) {}

  async __createUser(userId, userName, fullName) {
    try {
      const response = await userModel.updateOne(
        {
          userId,
        },
        {
          $set: {
            userName,
            fullName,
          },
        },
        { upsert: true }
      );
      if (!response) {
        await this.sendMessage(
          userId,
          "Failed to create user. Please report to admin"
        );
      }
    } catch (error) {
      console.error(error.message);
      await this.sendMessage(userId, "Backend Error");
    }
  }

  async _updateResume(userId, resumeText) {
    try {
      const response = await userModel.updateOne(
        {
          userId,
        },
        {
          $set: {
            resumeText,
          },
        }
      );
      if (response) {
        await this.sendMessage(userId, "You can ask Resume Related questions");
      } else {
        await this.sendMessage(userId, "User Error");
      }
    } catch (error) {
      console.error(error.message);
    }
  }
}

const telegramController = new TelegramController(telegramBotToken);

export default telegramController;
