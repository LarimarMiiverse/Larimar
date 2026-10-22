// Wii U memo drawings. The portal reads them with wiiuMemo.getImage(true):
// base64 of a zlib-compressed TGA ("TGAZ", 320x120), which is what Miiverse
// itself submitted. (getImage(false) is a BMP, only good for a preview.)
// Decoded here and stored as PNG, with no image library involved.
const zlib = require('zlib');

const MAX_WIDTH = 400;
const MAX_HEIGHT = 240;

// Decodes a TGAZ painting to { width, height, rgba }, or returns null.
function decodeTgaz(base64) {
    let tga;
    try {
        tga = zlib.inflateSync(Buffer.from(String(base64), 'base64'), { maxOutputLength: 1024 * 1024 });
    } catch (err) {
        return null;
    }
    if (tga.length < 18) return null;

    const idLength = tga[0];
    const colorMapType = tga[1];
    const imageType = tga[2];
    const colorMapLength = tga.readUInt16LE(5);
    const colorMapEntryBits = tga[7];
    const width = tga.readUInt16LE(12);
    const height = tga.readUInt16LE(14);
    const bpp = tga[16];
    const topDown = (tga[17] & 0x20) !== 0;

    // Truecolor only: 2 = uncompressed, 10 = run-length encoded
    if ((imageType !== 2 && imageType !== 10) || (bpp !== 24 && bpp !== 32)) return null;
    if (width < 1 || height < 1 || width > MAX_WIDTH || height > MAX_HEIGHT) return null;

    const bytesPerPixel = bpp / 8;
    let pos = 18 + idLength + (colorMapType ? colorMapLength * Math.ceil(colorMapEntryBits / 8) : 0);
    const pixels = width * height;
    const rgba = Buffer.alloc(pixels * 4);

    function readPixel(dst) {
        const b = tga[pos];
        const g = tga[pos + 1];
        const r = tga[pos + 2];
        const a = bytesPerPixel === 4 ? tga[pos + 3] : 255;
        pos += bytesPerPixel;
        // TGA rows run bottom-up unless the descriptor says otherwise
        const x = dst % width;
        const y = topDown ? Math.floor(dst / width) : height - 1 - Math.floor(dst / width);
        rgba.writeUInt32BE(((r << 24) | (g << 16) | (b << 8) | a) >>> 0, (y * width + x) * 4);
    }

    let i = 0;
    if (imageType === 2) {
        if (pos + pixels * bytesPerPixel > tga.length) return null;
        while (i < pixels) readPixel(i++);
    } else {
        while (i < pixels) {
            if (pos >= tga.length) return null;
            const header = tga[pos++];
            const count = (header & 0x7f) + 1;
            if (i + count > pixels || pos + bytesPerPixel > tga.length) return null;
            if (header & 0x80) {
                const start = pos;
                for (let n = 0; n < count; n++) {
                    pos = start;
                    readPixel(i++);
                }
            } else {
                if (pos + count * bytesPerPixel > tga.length) return null;
                for (let n = 0; n < count; n++) readPixel(i++);
            }
        }
    }

    return { width, height, rgba };
}

const CRC_TABLE = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
});

function crc32(buf) {
    let c = -1;
    for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}

function encodePng({ width, height, rgba }) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    const stride = width * 4;
    const raw = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = 0; // filter: none
        rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

// base64 TGAZ from the memo -> PNG buffer, or null if it isn't a valid drawing
function paintingToPng(base64) {
    if (!base64) return null;
    const image = decodeTgaz(base64);
    return image ? encodePng(image) : null;
}

module.exports = { paintingToPng, decodeTgaz, encodePng };
