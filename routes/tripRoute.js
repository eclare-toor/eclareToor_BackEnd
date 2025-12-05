import express from "express";
import multer from "multer";
import { authenticateToken, requireAnyRole } from "../middleware/auth.js";
import { tripController } from "../controllers/tripController.js";

const router = express.Router();
const upload = multer({ dest: "temp/" });
// reste test create , updateimages, replace images, delete images
// cree table hotel_relation + journee + relation hotel_journee
// CRUD
router.post("/", authenticateToken, requireAnyRole(["admin"]), upload.array("images"), tripController.create);
router.get("/", tripController.getAll);
router.get("/:id", tripController.getById);
router.put("/:id", authenticateToken, requireAnyRole(["admin"]), tripController.updateInfo);

// Images
router.post("/:id/images", authenticateToken, requireAnyRole(["admin"]), upload.array("images"), tripController.addImages);
router.put("/:id/images", authenticateToken, requireAnyRole(["admin"]), upload.array("images"), tripController.replaceImages);
router.delete("/:id/images", authenticateToken, requireAnyRole(["admin"]), tripController.deleteImages);

// Delete trip
router.delete("/:id", authenticateToken, requireAnyRole(["admin"]), tripController.deleteTrip);

export default router;
