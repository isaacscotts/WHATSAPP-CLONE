import { Router } from "express";
import { addImageMessage, addMessage, addVoiceMessage, getAllMessagges } from "../controllers/MessageController.js";
import multer from "multer";

const router=Router()
const uploadImage=multer({dest:"uploads/images"})
const uploadAudio=multer({dest:"uploads/recordings"})
router.post("/add-message",addMessage)
router.get("/all-messages/:from/:to",getAllMessagges)
router.post("/add-image-message/:from/:to",uploadImage.single("image"),addImageMessage)
router.post('/add-voice-message/:from/:to',uploadAudio.single("audio"),addVoiceMessage)
export default router