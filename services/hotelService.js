import { hotelModel } from "../models/hotelModel.js";
import { fileService } from "./fileService.js";

export const hotelService = {
  async createHotel(data) {
    try {
      const { name, city, stars, address, maps_url ,type} = data;
      if (!name || !city || !stars || !address) {
        throw new Error("Missing required fields");
      }
      return await hotelModel.create(name, city, stars, address, maps_url , type);
    } catch (error) {
      throw new Error("Error creating hotel: " + error.message);
    }
  },

  async getAll() {
    try {
      const hotels = await hotelModel.getAll();
      return hotels;
    } catch (error) {
      throw new Error("Error fetching hotels: " + error.message);
    }
  },

  async getByType(type) {
    try {
      const hotels = await hotelModel.getByType(type);
      return hotels;
    } catch (error) {
      throw new Error("Error fetching hotels: " + error.message);
    }
  },

  async getById(id) {
    try {
      const hotel = await hotelModel.getById(id);
      if (!hotel) throw new Error("Hotel not found");
      return hotel;
    } catch (error) {
      throw new Error(error.code === "22P02"
        ? "Invalid hotel ID format"
        : error.message
      );
    }
  },

  async updateHotelInfo(id, data) {
    try {
      const hotel = await this.getById(id); // sécurisé
      if (!hotel) throw new Error("Hotel not found");

      const updated = {
        name: data.name ?? hotel.name,
        city: data.city ?? hotel.city,
        stars: data.stars ?? hotel.stars,
        address: data.address ?? hotel.address,
        maps_url: data.maps_url ?? hotel.maps_url,
        type: data.type ?? hotel.type
      };

      return await hotelModel.updateInfo(id, updated);

    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* ----------------- ADD NEW IMAGES ------------------ */
  async addImages(id, files) {
    try {
      const hotel = await this.getById(id);
      console.log("Current hotel images:", files);
      const newImgs = fileService.saveImages("hotels", files);
      const finalImages = [...(hotel.images || []), ...newImgs];

      return await hotelModel.updateImages(id, finalImages);

    } catch (error) {
      throw new Error("Error adding images: " + error.message);
    }
  },

   /* ----------------- DELETE SOME IMAGES + ADD NEW ---------------- */
  async replaceImages(id, namesToRemove, newFiles) {
    try {
      const hotel = await this.getById(id);

      let images = [...(hotel.images || [])];

      // Si Postman envoie string "img.png"
      if (typeof namesToRemove === "string") {
        namesToRemove = [namesToRemove];
      }
      console.log("Names to remove:", namesToRemove);
      namesToRemove.forEach(name => {
        const index = images.findIndex(img => img.endsWith(name));
        if (index !== -1) {
          fileService.deleteImage(images[index]);
          images.splice(index, 1);
        }
      });
      // Temporary single name removal for testing car postman ne marche pas avec array
      // const index = images.findIndex(img => img.endsWith(namesToRemove)); // match sur nom
      // if (index !== -1) {
      //     fileService.deleteImage(images[index]);
      //     images.splice(index, 1);
      // }
      const newImages = fileService.saveImages("hotels", newFiles);
      images.push(...newImages);

      return await hotelModel.updateImages(id, images);

    } catch (error) {
      throw new Error("Error replacing images: " + error.message);
    }
  },

  /* ----------------- DELETE ONE IMAGE ---------------- */
  async deleteOneImage(id, index) {
    try {
      const hotel = await this.getById(id);

      let images = [...hotel.images];
      if (!images[index]) throw new Error("Invalid image index");

      fileService.deleteImage(images[index]);
      images.splice(index, 1);

      return await hotelModel.updateImages(id, images);

    } catch (error) {
      throw new Error("Error deleting image: " + error.message);
    }
  },

  /* ----------------- DELETE MANY BY NAME ---------------- */
  async deleteManyImage(id, names) {
    try {
      const hotel = await this.getById(id);

      let images = [...hotel.images];
      if (typeof names === "string") names = [names];

      names.forEach(name => {
        const index = images.findIndex(img => img.endsWith(name));
        if (index !== -1) {
          fileService.deleteImage(images[index]);
          images.splice(index, 1);
        }
      });

      return await hotelModel.updateImages(id, images);

    } catch (error) {
      throw new Error("Error deleting multiple images: " + error.message);
    }
  },



  /* ----------------- DELETE HOTEL ---------------- */
  async deleteHotel(id) {
    try {
      const hotel = await this.getById(id);
      (hotel.images || []).forEach((img) => fileService.deleteImage(img));
      await hotelModel.delete(id);

    } catch (error) {
      throw new Error("Error deleting hotel: " + error.message);
    }
  }
};

