const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const archiver = require('archiver');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const convertLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many conversion requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to conversion endpoints
app.use('/api/convert', convertLimit);

// Ensure required directories exist
const ensureDirectories = async () => {
    const dirs = ['uploads', 'temp'];
    for (const dir of dirs) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 20 // Maximum 20 files at once
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only PNG files are allowed!'), false);
        }
    }
});

// Serve static files
app.use(express.static('.'));

// Convert PNG to JPG endpoint
app.post('/api/convert', upload.array('images', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No files uploaded' 
            });
        }

        const quality = parseInt(req.body.quality) || 80;
        
        // Validate quality range
        if (quality < 1 || quality > 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quality must be between 1 and 100' 
            });
        }

        const convertedFiles = [];
        const timestamp = Date.now();

        // Convert each PNG file to JPG
        for (const file of req.files) {
            try {
                const outputFilename = `converted-${timestamp}-${path.parse(file.originalname).name}.jpg`;
                const outputPath = path.join('temp', outputFilename);

                await sharp(file.path)
                    .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background for transparency
                    .jpeg({ quality: quality })
                    .toFile(outputPath);

                convertedFiles.push(outputFilename);

                // Clean up uploaded file
                await fs.unlink(file.path);
            } catch (error) {
                console.error(`Error converting ${file.originalname}:`, error);
                // Clean up uploaded file even if conversion failed
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error cleaning up uploaded file:', unlinkError);
                }
            }
        }

        if (convertedFiles.length === 0) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to convert any files' 
            });
        }

        let zipFile = null;

        // Create ZIP file if multiple files were converted
        if (convertedFiles.length > 1) {
            zipFile = `converted-images-${timestamp}.zip`;
            const zipPath = path.join('temp', zipFile);

            await createZipFile(convertedFiles, zipPath);
        }

        // Schedule cleanup after 30 minutes
        setTimeout(async () => {
            await cleanupFiles([...convertedFiles, zipFile].filter(Boolean));
        }, 30 * 60 * 1000);

        res.json({
            success: true,
            message: `Successfully converted ${convertedFiles.length} file(s)`,
            files: convertedFiles,
            zipFile: zipFile
        });

    } catch (error) {
        console.error('Conversion error:', error);
        
        // Clean up any uploaded files on error
        if (req.files) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error cleaning up file:', unlinkError);
                }
            }
        }

        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during conversion' 
        });
    }
});

// Download endpoint
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join('temp', filename);

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ 
                success: false, 
                message: 'File not found' 
            });
        }

        // Set appropriate headers
        const ext = path.extname(filename).toLowerCase();
        if (ext === '.zip') {
            res.setHeader('Content-Type', 'application/zip');
        } else if (ext === '.jpg' || ext === '.jpeg') {
            res.setHeader('Content-Type', 'image/jpeg');
        }

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Stream the file
        const fileStream = require('fs').createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Error downloading file' 
                });
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Create ZIP file from multiple converted images
async function createZipFile(filenames, zipPath) {
    return new Promise((resolve, reject) => {
        const output = require('fs').createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Best compression
        });

        output.on('close', () => {
            console.log(`ZIP created: ${zipPath} (${archive.pointer()} total bytes)`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // Add each file to the archive
        for (const filename of filenames) {
            const filePath = path.join('temp', filename);
            archive.file(filePath, { name: filename });
        }

        archive.finalize();
    });
}

// Clean up temporary files
async function cleanupFiles(filenames) {
    for (const filename of filenames) {
        if (filename) {
            try {
                const filePath = path.join('temp', filename);
                await fs.unlink(filePath);
                console.log(`Cleaned up: ${filename}`);
            } catch (error) {
                console.error(`Error cleaning up ${filename}:`, error);
            }
        }
    }
}

// Clean up old files on startup (files older than 1 hour)
async function cleanupOldFiles() {
    try {
        const files = await fs.readdir('temp');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join('temp', file);
            const stats = await fs.stat(filePath);
            
            if (now - stats.mtime.getTime() > oneHour) {
                await fs.unlink(filePath);
                console.log(`Cleaned up old file: ${file}`);
            }
        }
    } catch (error) {
        console.error('Error cleaning up old files:', error);
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB per file.'
            });
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 20 files at once.'
            });
        }
    }

    if (error.message === 'Only PNG files are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Only PNG files are allowed.'
        });
    }

    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Initialize and start server
async function startServer() {
    try {
        await ensureDirectories();
        await cleanupOldFiles();
        
        app.listen(PORT, () => {
            console.log(`PNG to JPG Converter server running on port ${PORT}`);
            console.log(`Open http://localhost:${PORT}/png-to-jpg-converter.html to use the tool`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();