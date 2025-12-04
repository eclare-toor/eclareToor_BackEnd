import express from "express";
import multer from "multer";
import { hotelController } from "../controllers/hotelController.js";
import { authenticateToken , requireAnyRole} from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "temp/" });
// router.use(authenticateToken);

router.post("/", authenticateToken , requireAnyRole(["admin"]) , hotelController.create);
router.get("/", hotelController.getAll);
router.get("/:id", hotelController.getById);
router.put("/:id", authenticateToken , requireAnyRole(["admin"]) ,hotelController.updateInfo);

// Add new images
router.post("/:id/images",authenticateToken , requireAnyRole(["admin"]) , upload.array("images"), hotelController.addImages);

// Replace (delete some + add new)
router.put("/:id/images", authenticateToken , requireAnyRole(["admin"]) ,upload.array("images"), hotelController.replaceImages);

// Delete single image
router.delete("/:id/images", authenticateToken , requireAnyRole(["admin"]) , hotelController.deleteImage);

// Delete hotel
router.delete("/:id", authenticateToken , requireAnyRole(["admin"]) , hotelController.deleteHotel);

export default router;
