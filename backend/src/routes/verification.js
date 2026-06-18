import { Router } from "express";
import multer from "multer";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { verifyCertificate, verifyByUpload } from "../controllers/verificationController.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: resolve(__dirname, "../../uploads/tmp") });

const router = Router();

router.get("/:certificateId", verifyCertificate);
router.post("/upload", upload.single("certificate"), verifyByUpload);

export default router;
