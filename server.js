const express = require('express');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware
app.use(express.static('public', {
    maxAge: NODE_ENV === 'production' ? '1d' : '0' // Cache static files in production
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers for production
if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
    });
}

// Set view engine (if using template engines in the future)
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Tool routes (placeholders for future implementation)
app.get('/image-converter', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Image Converter - Multitoolspro</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div style="padding: 100px 20px; text-align: center;">
                <h1>Image Converter</h1>
                <p>This tool is coming soon! Convert images between different formats.</p>
                <a href="/" style="color: #2563eb; text-decoration: none;">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/image-compressor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'image-compressor.html'));
});

app.get('/age-calculator', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'age-calculator.html'));
});

app.get('/html-to-text', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html-to-text.html'));
});

// Legal pages (placeholders)
app.get('/privacy', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Privacy Policy - Multitoolspro</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div style="padding: 100px 20px; max-width: 800px; margin: 0 auto;">
                <h1>Privacy Policy</h1>
                <p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information.</p>
                <h2>Information We Collect</h2>
                <p>We do not collect personal information unless you voluntarily provide it.</p>
                <h2>How We Use Information</h2>
                <p>Any information collected is used solely to provide our services.</p>
                <a href="/" style="color: #2563eb; text-decoration: none;">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/terms', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Terms of Service - Multitoolspro</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div style="padding: 100px 20px; max-width: 800px; margin: 0 auto;">
                <h1>Terms of Service</h1>
                <p>By using our services, you agree to these terms and conditions.</p>
                <h2>Use of Services</h2>
                <p>Our tools are provided free of charge for personal and commercial use.</p>
                <h2>Limitations</h2>
                <p>We are not liable for any damages resulting from the use of our tools.</p>
                <a href="/" style="color: #2563eb; text-decoration: none;">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// API endpoints (for future tool implementations)
app.post('/api/convert-image', (req, res) => {
    res.json({ message: 'Image conversion API endpoint - Coming soon!' });
});

app.post('/api/compress-images', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No images uploaded'
            });
        }

        const { quality = 80, format = 'original', width, height, maintainAspect = 'true' } = req.body;
        const results = [];

        for (const file of req.files) {
            try {
                let sharpInstance = sharp(file.buffer);

                // Get original image metadata
                const metadata = await sharpInstance.metadata();
                const originalSize = file.size;

                // Handle resizing if dimensions are provided
                if (width || height) {
                    const resizeOptions = {};

                    if (width) resizeOptions.width = parseInt(width);
                    if (height) resizeOptions.height = parseInt(height);

                    if (maintainAspect === 'false') {
                        resizeOptions.fit = 'fill';
                    }

                    sharpInstance = sharpInstance.resize(resizeOptions);
                }

                // Determine output format
                let outputFormat = format === 'original' ? metadata.format : format;
                let mimeType = `image/${outputFormat}`;

                // Apply compression based on format
                let compressedBuffer;
                const qualityValue = parseInt(quality);

                switch (outputFormat) {
                    case 'jpeg':
                    case 'jpg':
                        compressedBuffer = await sharpInstance
                            .jpeg({ quality: qualityValue, progressive: true })
                            .toBuffer();
                        mimeType = 'image/jpeg';
                        break;
                    case 'png':
                        compressedBuffer = await sharpInstance
                            .png({ quality: qualityValue, progressive: true })
                            .toBuffer();
                        mimeType = 'image/png';
                        break;
                    case 'webp':
                        compressedBuffer = await sharpInstance
                            .webp({ quality: qualityValue })
                            .toBuffer();
                        mimeType = 'image/webp';
                        break;
                    default:
                        // For other formats, use the original format with quality adjustment
                        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                            compressedBuffer = await sharpInstance
                                .jpeg({ quality: qualityValue, progressive: true })
                                .toBuffer();
                            mimeType = 'image/jpeg';
                        } else if (metadata.format === 'png') {
                            compressedBuffer = await sharpInstance
                                .png({ quality: qualityValue })
                                .toBuffer();
                            mimeType = 'image/png';
                        } else {
                            compressedBuffer = await sharpInstance
                                .jpeg({ quality: qualityValue, progressive: true })
                                .toBuffer();
                            mimeType = 'image/jpeg';
                        }
                }

                // Generate filename
                const originalName = file.originalname;
                const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
                const filename = `${nameWithoutExt}_compressed.${extension}`;

                results.push({
                    filename,
                    originalSize,
                    compressedSize: compressedBuffer.length,
                    data: compressedBuffer.toString('base64'),
                    mimeType
                });

            } catch (error) {
                console.error(`Error processing ${file.originalname}:`, error);
                // Continue with other files even if one fails
            }
        }

        if (results.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'Failed to process any images'
            });
        }

        res.json({
            success: true,
            images: results,
            message: `Successfully compressed ${results.length} image(s)`
        });

    } catch (error) {
        console.error('Image compression error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during image compression'
        });
    }
});

app.post('/api/calculate-age', (req, res) => {
    try {
        const { birthDate, birthTime, referenceDate, referenceTime } = req.body;

        if (!birthDate) {
            return res.status(400).json({
                success: false,
                error: 'Birth date is required'
            });
        }

        // Parse dates
        const birth = new Date(birthDate + (birthTime ? `T${birthTime}` : 'T00:00:00'));
        const reference = referenceDate
            ? new Date(referenceDate + (referenceTime ? `T${referenceTime}` : 'T00:00:00'))
            : new Date();

        // Validate dates
        if (isNaN(birth.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid birth date'
            });
        }

        if (isNaN(reference.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reference date'
            });
        }

        if (birth > reference) {
            return res.status(400).json({
                success: false,
                error: 'Birth date cannot be in the future'
            });
        }

        // Calculate age
        const ageData = calculateDetailedAge(birth, reference);

        res.json({
            success: true,
            age: ageData
        });

    } catch (error) {
        console.error('Age calculation error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during age calculation'
        });
    }
});

// Detailed age calculation function
function calculateDetailedAge(birthDate, referenceDate) {
    const birth = new Date(birthDate);
    const reference = new Date(referenceDate);

    // Calculate exact age components
    let years = reference.getFullYear() - birth.getFullYear();
    let months = reference.getMonth() - birth.getMonth();
    let days = reference.getDate() - birth.getDate();
    let hours = reference.getHours() - birth.getHours();
    let minutes = reference.getMinutes() - birth.getMinutes();

    // Adjust for negative values
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        months--;
        const lastMonth = new Date(reference.getFullYear(), reference.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    // Calculate total values
    const totalDays = Math.floor((reference - birth) / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor((reference - birth) / (1000 * 60 * 60));
    const totalMinutes = Math.floor((reference - birth) / (1000 * 60));
    const totalMonths = years * 12 + months;

    // Calculate next birthday
    const nextBirthday = new Date(reference.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= reference) {
        nextBirthday.setFullYear(reference.getFullYear() + 1);
    }

    const daysToNextBirthday = Math.ceil((nextBirthday - reference) / (1000 * 60 * 60 * 24));
    const monthsToNextBirthday = Math.floor(daysToNextBirthday / 30.44); // Average days per month
    const remainingDaysToNextBirthday = Math.floor(daysToNextBirthday % 30.44);

    // Fun facts calculations
    const heartbeats = Math.floor(totalMinutes * 70); // Average 70 beats per minute
    const earthDistance = Math.floor(totalDays * 2.6); // Earth travels ~2.6 million km per day around sun
    const weekends = Math.floor(totalDays / 7) * 2; // Approximate weekends

    return {
        exact: {
            years,
            months,
            days,
            hours,
            minutes
        },
        totals: {
            years,
            months: totalMonths,
            days: totalDays,
            hours: totalHours,
            minutes: totalMinutes
        },
        nextBirthday: {
            date: nextBirthday.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            daysUntil: daysToNextBirthday,
            monthsUntil: monthsToNextBirthday,
            remainingDays: remainingDaysToNextBirthday
        },
        funFacts: {
            heartbeats: heartbeats.toLocaleString(),
            earthDistance: earthDistance.toLocaleString(),
            weekends: weekends.toLocaleString(),
            sunrises: totalDays.toLocaleString()
        }
    };
}

app.post('/api/html-to-text', (req, res) => {
    try {
        const { html, options = {} } = req.body;

        if (!html) {
            return res.status(400).json({
                success: false,
                error: 'HTML content is required'
            });
        }

        // Default options
        const {
            preserveLineBreaks = true,
            removeExtraSpaces = true,
            convertEntities = true
        } = options;

        // Convert HTML to text
        let text = convertHtmlToText(html, {
            preserveLineBreaks,
            removeExtraSpaces,
            convertEntities
        });

        // Calculate statistics
        const stats = {
            originalLength: html.length,
            convertedLength: text.length,
            charactersRemoved: html.length - text.length,
            wordCount: text.trim() ? text.trim().split(/\s+/).length : 0
        };

        res.json({
            success: true,
            text: text,
            stats: stats
        });

    } catch (error) {
        console.error('HTML to text conversion error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during conversion'
        });
    }
});

// HTML to Text conversion function
function convertHtmlToText(html, options = {}) {
    const {
        preserveLineBreaks = true,
        removeExtraSpaces = true,
        convertEntities = true
    } = options;

    let text = html;

    // Convert HTML entities first if requested
    if (convertEntities) {
        const entityMap = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&apos;': "'",
            '&nbsp;': ' ',
            '&copy;': '©',
            '&reg;': '®',
            '&trade;': '™',
            '&hellip;': '...',
            '&mdash;': '—',
            '&ndash;': '–',
            '&lsquo;': "'",
            '&rsquo;': "'",
            '&ldquo;': '"',
            '&rdquo;': '"'
        };

        // Replace named entities
        for (const [entity, replacement] of Object.entries(entityMap)) {
            text = text.replace(new RegExp(entity, 'gi'), replacement);
        }

        // Replace numeric entities (&#123; and &#x1A;)
        text = text.replace(/&#(\d+);/g, (match, dec) => {
            return String.fromCharCode(parseInt(dec, 10));
        });
        text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        });
    }

    // Handle block elements that should create line breaks
    if (preserveLineBreaks) {
        const blockElements = [
            'div', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'li', 'ul', 'ol', 'blockquote', 'pre', 'hr', 'table',
            'tr', 'td', 'th', 'section', 'article', 'header', 'footer',
            'main', 'aside', 'nav'
        ];

        blockElements.forEach(tag => {
            // Add line breaks before and after block elements
            text = text.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '\n');
            text = text.replace(new RegExp(`</${tag}>`, 'gi'), '\n');
        });

        // Handle self-closing br tags
        text = text.replace(/<br\s*\/?>/gi, '\n');
    }

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Clean up whitespace
    if (removeExtraSpaces) {
        // Replace multiple spaces with single space
        text = text.replace(/[ \t]+/g, ' ');

        // Replace multiple line breaks with double line breaks (paragraph separation)
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Remove leading/trailing whitespace from each line
        text = text.split('\n').map(line => line.trim()).join('\n');

        // Remove empty lines at the beginning and end
        text = text.replace(/^\n+/, '').replace(/\n+$/, '');
    }

    return text;
}

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page Not Found - Multitoolspro</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div style="padding: 100px 20px; text-align: center;">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/" style="color: #2563eb; text-decoration: none;">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Error - Multitoolspro</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div style="padding: 100px 20px; text-align: center;">
                <h1>500 - Server Error</h1>
                <p>Something went wrong on our end. Please try again later.</p>
                <a href="/" style="color: #2563eb; text-decoration: none;">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Multitoolspro server is running on http://localhost:${PORT}`);
    console.log(`📱 The website is mobile-responsive and ready to use!`);
    console.log(`🛠️  Available tools (coming soon):`);
    console.log(`   • Image Converter: http://localhost:${PORT}/image-converter`);
    console.log(`   • Image Compressor: http://localhost:${PORT}/image-compressor`);
    console.log(`   • Age Calculator: http://localhost:${PORT}/age-calculator`);
    console.log(`   • HTML to Text: http://localhost:${PORT}/html-to-text`);
});

module.exports = app;
