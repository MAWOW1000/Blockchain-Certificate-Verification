import { Router } from "express";
import {
  issueCertificate,
  listCertificates,
  getCertificate,
  revokeCertificate,
} from "../controllers/certificateController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("ISSUER", "ADMIN"), issueCertificate);
router.get("/", authenticate, requireRole("ISSUER", "ADMIN"), listCertificates);
router.get("/:certificateId", getCertificate);
router.post("/:certificateId/revoke", authenticate, requireRole("ISSUER", "ADMIN"), revokeCertificate);

export default router;
