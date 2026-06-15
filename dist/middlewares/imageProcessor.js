import sharp from "sharp";
import fs from "fs";
import path from "path";
const MIN_W = Number(process.env.IMAGE_MIN_WIDTH ?? 1280);
const MIN_H = Number(process.env.IMAGE_MIN_HEIGHT ?? 720);
const MAX_W = Number(process.env.IMAGE_MAX_WIDTH ?? 1920);
const MAX_H = Number(process.env.IMAGE_MAX_HEIGHT ?? 1080);
const MAX_KB = Number(process.env.IMAGE_MAX_KB ?? 400); // target cap in KB
const MIN_QUALITY = Number(process.env.IMAGE_MIN_QUALITY ?? 50);
const START_QUALITY = Number(process.env.IMAGE_START_QUALITY ?? 85);
const QUALITY_STEP = Number(process.env.IMAGE_QUALITY_STEP ?? 10);
async function processFileAtPath(filePath) {
    const input = await fs.promises.readFile(filePath);
    const meta = await sharp(input).metadata();
    let resizeOptions = null;
    if ((meta.width ?? 0) < MIN_W || (meta.height ?? 0) < MIN_H) {
        // Too small → upscale to at least 1280x720 using cover to guarantee both dims >= min
        resizeOptions = {
            width: MIN_W,
            height: MIN_H,
            fit: "cover",
            withoutEnlargement: false,
        };
    }
    else if ((meta.width ?? 0) > MAX_W || (meta.height ?? 0) > MAX_H) {
        // Too large → downscale inside 1920x1080
        resizeOptions = {
            width: MAX_W,
            height: MAX_H,
            fit: "inside",
            withoutEnlargement: true,
        };
    }
    let quality = START_QUALITY;
    let buffer;
    while (true) {
        let instance = sharp(input);
        if (resizeOptions)
            instance = instance.resize(resizeOptions);
        buffer = await instance.webp({ quality, effort: 4 }).toBuffer();
        if (buffer.length <= MAX_KB * 1024 || quality <= MIN_QUALITY)
            break;
        quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
        if (quality === MIN_QUALITY) {
            // one last encode at min quality already done, break next loop
            // but ensure we don't infinite loop
            if (buffer.length <= MAX_KB * 1024)
                break;
            else
                break; // accept best-effort
        }
    }
    return { buffer, format: "webp" };
}
function replaceExt(filePath, newExt) {
    const parsed = path.parse(filePath);
    return path.join(parsed.dir, `${parsed.name}${newExt.startsWith(".") ? newExt : "." + newExt}`);
}
export const processSingleImage = () => async (req, res, next) => {
    try {
        if (!req.file || !req.file.path)
            return next();
        // Skip processing for non-image uploads (e.g. video files)
        if (req.file.mimetype && !req.file.mimetype.startsWith("image/"))
            return next();
        const originalPath = req.file.path;
        const { buffer, format } = await processFileAtPath(originalPath);
        const newPath = replaceExt(originalPath, `.${format}`);
        await fs.promises.writeFile(newPath, buffer);
        // Remove original file if path/ext changed
        if (newPath !== originalPath && fs.existsSync(originalPath)) {
            await fs.promises.unlink(originalPath).catch(() => { });
        }
        // Update req.file to point to processed file
        req.file.path = newPath;
        req.file.size = buffer.length;
        req.file.mimetype = `image/${format}`;
        req.file.filename = path.basename(newPath);
        next();
    }
    catch (err) {
        next(err);
    }
};
export const processImageFields = (fieldNames = []) => async (req, res, next) => {
    try {
        if (!req.files)
            return next();
        for (const field of fieldNames) {
            const arr = req.files[field];
            if (Array.isArray(arr)) {
                for (const file of arr) {
                    if (file && file.path) {
                        // skip non-image files (videos etc.)
                        if (file.mimetype && !file.mimetype.startsWith("image/"))
                            continue;
                        const { buffer, format } = await processFileAtPath(file.path);
                        const newPath = replaceExt(file.path, `.${format}`);
                        await fs.promises.writeFile(newPath, buffer);
                        if (newPath !== file.path && fs.existsSync(file.path)) {
                            await fs.promises.unlink(file.path).catch(() => { });
                        }
                        file.path = newPath;
                        file.size = buffer.length;
                        file.mimetype = `image/${format}`;
                        file.filename = path.basename(newPath);
                    }
                }
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
export default {
    processSingleImage,
    processImageFields,
};
