import { Router } from "express";
import telegramController from "../controllers/telegram.controller.js";
const router = Router();


router.post("/telegram", (req, res) => {
    const message = req.body;
    telegramController.receiveMessage(message);
    res.status(200).json({ message: "Message received" });
});



export default router;