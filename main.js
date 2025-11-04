import express from "express";
import { port } from "./libs/config.util.js";
import webhooksRoute from "./routes/webhooks.route.js";
import cors from "cors";
import telegramController from "./controllers/telegram.controller.js";
import {connectDB} from './libs/db.lib.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/api/webhooks", webhooksRoute);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
    telegramController.init(`https://${process.env.HOST}/api/webhooks/telegram`);
});


