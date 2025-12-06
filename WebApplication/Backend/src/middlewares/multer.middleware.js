import multer from "multer";
import fs from "fs";
import path from "path";


const uploadFolder = "./public";
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith("image") ||
        file.mimetype.startsWith("video") ||
        file.mimetype.startsWith("audio")
    ) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"), false);
    }
};


export const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    fileFilter,
});


export const uploadMultipleFiles = upload.array("media", 10);
