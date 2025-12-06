import express from "express";
import { authenticateToken , requireAnyRole} from "../middleware/auth.js";
import { tripItineraryController } from "../controllers/tripItineraryController.js";

const router = express.Router();

router.post("/:tripId/itinerary",
  authenticateToken,
  requireAnyRole(["admin"]),
  tripItineraryController.addMany
);

router.get("/:tripId/itinerary", tripItineraryController.getByTrip);

router.delete("/:id/itinerary",
  authenticateToken,
  requireAnyRole(["admin"]),
  tripItineraryController.delete
);

router.put(
  "/:tripId/itinerary/:id",
  authenticateToken,
  requireAnyRole(["admin"]),
  tripItineraryController.update
);

export default router;
