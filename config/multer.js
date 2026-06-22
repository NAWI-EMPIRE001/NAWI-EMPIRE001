// ======================================================
// 👑 NAWI-EMPIRE001 - MEDIA UPLOAD ENGINE
// FILE: config/multer.js
// PURPOSE: Centralized Multer Configuration
// ======================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ======================================================
// ENSURE UPLOAD DIRECTORIES EXIST
// ======================================================

const uploadDirectories = [
    'uploads/profiles',
    'uploads/marketplace',
    'uploads/verification',
    'uploads/forge',
    'uploads/sonic',
    'uploads/culinary',
    'uploads/aesthetic',
    'uploads/temp'
];

uploadDirectories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ======================================================
// STORAGE ENGINE
// ======================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        let folder = 'uploads/temp';

        // Profile images
        if (file.fieldname === 'avatar') {
            folder = 'uploads/profiles';
        }

        // Marketplace assets
        else if (
            file.fieldname === 'productImages' ||
            file.fieldname === 'marketImages'
        ) {
            folder = 'uploads/marketplace';
        }

        // KYC / Verification
        else if (
            file.fieldname === 'identityDocument' ||
            file.fieldname === 'verificationFile'
        ) {
            folder = 'uploads/verification';
        }

        // Diamondback Forge
        else if (
            file.fieldname === 'forgeAsset'
        ) {
            folder = 'uploads/forge';
        }

        // Sonic Ledger
        else if (
            file.fieldname === 'audioFile'
        ) {
            folder = 'uploads/sonic';
        }

        // Culinary Matrix
        else if (
            file.fieldname === 'mealImage'
        ) {
            folder = 'uploads/culinary';
        }

        // Aesthetic Nexus
        else if (
            file.fieldname === 'portfolioImage'
        ) {
            folder = 'uploads/aesthetic';
        }

        cb(null, folder);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [

        // Images
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',

        // Videos
        'video/mp4',
        'video/webm',

        // Audio
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',

        // Documents
        'application/pdf'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Unsupported file type: ${file.mimetype}`
            ),
            false
        );
    }
};

// ======================================================
// MULTER INSTANCE
// ======================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// ======================================================
// EXPORT ENGINE
// ======================================================

module.exports = upload;