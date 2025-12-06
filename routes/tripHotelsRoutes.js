import express from "express";
import { authenticateToken ,requireAnyRole } from "../middleware/auth.js";
import { tripHotelsController } from "../controllers/tripHotelsController.js";

const router = express.Router();

router.post("/:tripId/hotels",
  authenticateToken,
  requireAnyRole(["admin"]),
  tripHotelsController.add
);

router.get("/:tripId/hotels", tripHotelsController.getByTrip);

router.delete("/:tripId/hotels/:hotelId",
  authenticateToken,
  requireAnyRole(["admin"]),
  tripHotelsController.delete
);


router.put(
  "/:tripId/hotels/:hotelId",
  authenticateToken,
  requireAnyRole(["admin"]),
  tripHotelsController.update
);


export default router;
