import express from "express";
import { port } from "./libs/config.lib.js";
import webhooksRoute from "./routes/webhooks.route.js";
import cors from "cors";
import telegramController from "./libs/telegram.lib.js";
import {connectDB} from './libs/db.lib.js'
import Scrapper from "./libs/scrapper.lib.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
const scrapper = new Scrapper();
app.get("/", async (req, res) => {
    // const html = await scrapper.searchJobs();
    res.send(html);
});

app.use("/api/webhooks", webhooksRoute);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
    telegramController.init(`https://${process.env.HOST}/api/webhooks/telegram`);
});


