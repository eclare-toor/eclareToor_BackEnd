import express from "express";
import { bookingController } from "../controllers/bookingController.js";
import { authenticateToken, requireAnyRole , checkUserActive} from "../middleware/auth.js";

const router = express.Router();

// USER or ADMIN
router.post("/", authenticateToken, checkUserActive ,bookingController.create);

// USER or ADMIN (permissions handled inside service)
router.put("/:id", authenticateToken, checkUserActive ,bookingController.update);

// USER bookings
router.get("/mine", authenticateToken, checkUserActive ,bookingController.getMine);

// ADMIN only
router.get("/", authenticateToken, requireAnyRole(["admin"]), bookingController.getAll);

// ADMIN delete
router.delete("/:id", authenticateToken, requireAnyRole(["admin"]), bookingController.delete);
// Get bookings by trip (ADMIN only)
router.get("/trip/:tripId", authenticateToken, requireAnyRole(["admin"]), bookingController.getByTrip);

export default router;
