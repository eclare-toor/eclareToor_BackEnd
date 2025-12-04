import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

export const fileService = {
  ensureDir(folder) {
    const dir = path.join(process.cwd(), "uploads", folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  },

  saveImages(folder, files) {
    this.ensureDir(folder);

    const saved = [];

    files.forEach((file) => {
      const ext = path.extname(file.originalname);
      const filename = `${nanoid()}${ext}`;
      const dest = path.join(process.cwd(), "uploads", folder, filename);
      fs.renameSync(file.path, dest);
      saved.push(`/uploads/${folder}/${filename}`);
    });

    return saved;
  },

  deleteImage(filePath) {
    const full = path.join(process.cwd(), filePath);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
};
