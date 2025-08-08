const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet());
app.use(cors());
app.use(compression());
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

app.use(express.static('.'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/image-converter', (req, res) => {
    res.sendFile(path.join(__dirname, 'image-converter.html'));
});

app.get('/background-remover', (req, res) => {
    res.sendFile(path.join(__dirname, 'background-remover.html'));
});

app.get('/age-calculator', (req, res) => {
    res.sendFile(path.join(__dirname, 'age-calculator.html'));
});

app.get('/png-to-jpg-converter', (req, res) => {
    res.sendFile(path.join(__dirname, 'png-to-jpg-converter.html'));
});

app.post('/api/convert-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const { format, quality } = req.body;
        const inputPath = req.file.path;
        const outputFormat = format || 'jpeg';
        const imageQuality = parseInt(quality) || 85;

        let sharpInstance = sharp(inputPath);

        if (outputFormat === 'jpeg') {
            sharpInstance = sharpInstance.jpeg({ quality: imageQuality });
        } else if (outputFormat === 'png') {
            sharpInstance = sharpInstance.png({ compressionLevel: 9 });
        } else if (outputFormat === 'webp') {
            sharpInstance = sharpInstance.webp({ quality: imageQuality });
        }

        const outputPath = path.join('temp', `converted-${Date.now()}-${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}.${outputFormat}`);
        
        if (!fs.existsSync('temp')) {
            fs.mkdirSync('temp');
        }

        await sharpInstance.toFile(outputPath);

        fs.unlinkSync(inputPath);

        res.json({
            success: true,
            downloadUrl: `/${outputPath}`,
            filename: path.basename(outputPath)
        });

    } catch (error) {
        console.error('Image conversion error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Image conversion failed' });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`🚀 MultiTools Hub server running in ${NODE_ENV} mode`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    if (NODE_ENV === 'production') {
        console.log('✅ Production optimizations enabled');
    }
});

module.exports = app;