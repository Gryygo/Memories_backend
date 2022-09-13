import express from "express";
import { postSignin, postSignup } from "../controllers/users.js";

const router = express.Router();

router.post("/signin", postSignin);
router.post("/signup", postSignup);

export default router;
