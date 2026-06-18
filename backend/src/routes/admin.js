import { Router } from "express";
import { listIssuers, approveIssuer, removeIssuer } from "../controllers/adminController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/issuers", listIssuers);
router.post("/issuers/:id/approve", approveIssuer);
router.post("/issuers/:id/remove", removeIssuer);

export default router;
