import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use an absolute path for the destination
        const uploadPath = path.resolve(__dirname, "../../public/temp");
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Use a unique filename to prevent overwrites
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({ storage: storage })