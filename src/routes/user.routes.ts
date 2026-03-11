import { Router } from "express";
import { syncUser } from "../controllers/user.controller";

const router = Router();

router.post("/sync/user", syncUser);

export default router;