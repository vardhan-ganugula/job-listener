import OpenAI from "openai";
import { openaiApiKey } from "./config.lib.js";

class AI {
  constructor(key = openaiApiKey, model = "gemini-2.0-flash", baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/') {
    this.openAi = new OpenAI({
      apiKey: key,
      baseURL: baseURL,
    });
    this.__model = model;
  }

  async extractResumeDetails(text) {
    const response = await this.openAi.chat.completions.create({
      model: this.__model,
      messages: [
        {
          role: "system",
          content: `You are a precise Telegram message analyzer. 
Your task is to extract structured job-related details from short or informal Telegram messages. 
Return the result strictly as a valid JSON object containing any of the following fields if available:

{
  "keyword": String,
  "location": String,
  "experienceLevel": String,
  "remote": String,
  "jobType": String,
  "easyApply": Boolean
}

Guidelines:
- Messages may be short or written informally, so infer meaning carefully (e.g., “WFH” = remote, “onsite” = on-site).
- Include only the fields that are clearly mentioned or confidently inferred.
- Do not include any field that is not found or uncertain.
- "location" by default is India
- "keyword" should describe the role or position (e.g., "Frontend Developer", "Python Intern").
- "remote" can be values like "remote", "hybrid", or "onsite".
- "easyApply" should be true if the message mentions easy/quick apply; otherwise, omit it.
- The output must be **strictly a JSON object** with no extra text, formatting, or explanation and also no array format.
`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });
    return response.choices[0].message.content
  }
}

const aiModel = new AI();

export default aiModel;
