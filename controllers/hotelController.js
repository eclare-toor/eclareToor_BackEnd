import { hotelService } from "../services/hotelService.js";

//mainare recuprer les images=> sucrite
export const hotelController = {
  create: async (req, res) => {
    try {
      const hotel = await hotelService.createHotel(req.body);
      res.status(201).json(hotel);
    } catch (e) {
      res.status(500).json({ 
        success: false,
        error: e.message 
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const hotels = await hotelService.getAll();
      res.json(hotels);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "An error occurred while fetching hotels"
      });
    }
  },

  getByType: async (req, res) => {
    try {
      const hotels = await hotelService.getByType(req.params.type);
      res.json(hotels);
    } catch (error) {
      console.error(error);
      res.status(404).json({
        success: false,
        message: error.message || "An error occurred while fetching hotel"
      });
    }
  },

  getById: async (req, res) => {
    try {
      const hotel = await hotelService.getById(req.params.id);
      res.json(hotel);
    } catch (error) {
      console.error(error);
      res.status(404).json({
        success: false,
        message: error.message || "An error occurred while fetching hotel"
      });
    }
  },

  updateInfo: async (req, res) => {
    try {
      const updatedHotel = await hotelService.updateHotelInfo(req.params.id, req.body);
      res.json(updatedHotel);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message || "An error occurred while updating hotel info"
      });
    }
  },


  addImages: async (req, res) => {
    try{
      const addImages = await hotelService.addImages(req.params.id, req.files);
      res.json(addImages);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message || "An error occurred while adding images"
      });
    }
  },

  replaceImages: async (req, res) => {
    try {
      // const namesToRemove = JSON.parse(req.body.namesToRemove); // ex: "[0,2]"
      // console.log(namesToRemove);
      // console.log(req.body.namesToRemove);
      res.json(await hotelService.replaceImages(req.params.id, req.body.namesToRemove, req.files));
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message || "An error occurred while replacing images"
      });
    }
  },

  deleteImage: async (req, res) => {
    try {
      const result = await hotelService.deleteManyImage(req.params.id, req.body.names);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message || "An error occurred while deleting image"
      });
    }
  },

  deleteHotel: async (req, res) => {
    try {
      await hotelService.deleteHotel(req.params.id);
      res.json({ message: "Hotel deleted" });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error.message || "An error occurred while deleting hotel"
      });
    }
  }
};
