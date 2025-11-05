import { Router } from "express";
import telegramController from "../libs/telegram.lib.js";
const router = Router();


router.post("/telegram", (req, res) => {
    const  { message } = req.body;
    telegramController.parseMessage(message);
    res.status(200).json({ message: "Message received" });
});


export default router;