import { Router } from "express";
import { allContacts, checkUser ,onboardUser} from "../controllers/AuthController.js";

const router=Router()
router.post("/check-user",checkUser)
router.post('/onboarding',onboardUser)
router.get("/get-all-contacts/:from",allContacts)
export default router;