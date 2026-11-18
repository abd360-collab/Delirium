
import multer from "multer";
import { AppError } from "../errors/AppError.js";



const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },

    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new AppError(
                    "INVALID_IMAGE_TYPE",
                    "Only JPEG, PNG and WebP images are allowed.",
                    400,
                ),
            );
        }

        callback(null, true);
    },
});

export const uploadSingleImage = upload.single("image");
