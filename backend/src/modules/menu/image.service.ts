


import cloudinaryClient from "../../config/cloudinary.js";
import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";

type UploadImageInput = {
    buffer: Buffer;
    mimeType: string;
};

type CloudinaryUploadResult = {
    secure_url: string;
    public_id: string;
};

function uploadBuffer(
    buffer: Buffer,
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const stream = cloudinaryClient.uploader.upload_stream(
            {
                folder: "delirium/menu-items",
                resource_type: "image",
                transformation: [
                    {
                        quality: "auto",
                        fetch_format: "auto",
                    },
                ],
            },
            (error, result) => {
                if (error || !result) {
                    reject(error ?? new Error("Image upload failed"));
                    return;
                }

                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            },
        );

        stream.end(buffer);
    });
}

export const imageService = {
    async uploadMenuImage(input: UploadImageInput) {
        try {
            const result = await uploadBuffer(input.buffer);

            return {
                imageUrl: result.secure_url,
                publicId: result.public_id,
            };
        } catch {
            throw new AppError(
                ERROR_CODES.INTERNAL_SERVER_ERROR,
                "Failed to upload image. Please try again.",
                500,
            );
        }
    },
};
