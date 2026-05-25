import process from "node:process"
import cloudinary from "../config/cloudinary.js"
import multer from "multer"
import { Readable } from "stream"

const storage = multer.memoryStorage()

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

export const uploadToCloudinary = async function(fileBuffer) {
  return new Promise(function(resolve, reject) {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shopalotghana",
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      },
      function(error, result) {
        if (error) reject(error)
        else resolve(result)
      }
    )
    const readable = new Readable()
    readable.push(fileBuffer)
    readable.push(null)
    readable.pipe(stream)
  })
}

export default upload