// Image Converter JavaScript
class ImageConverter {
    constructor() {
        this.uploadedFiles = [];
        this.convertedImages = [];
        this.isConverting = false;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.conversionSettings = document.getElementById('conversion-settings');
        this.imagePreview = document.getElementById('image-preview');
        this.previewContainer = document.getElementById('preview-container');
        this.progressContainer = document.getElementById('progress-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.outputFormat = document.getElementById('output-format');
        this.qualitySlider = document.getElementById('quality-slider');
        this.qualityValue = document.getElementById('quality-value');
        this.convertBtn = document.getElementById('convert-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.maintainAspectRatio = document.getElementById('maintain-aspect-ratio');
        this.qualityGroup = document.getElementById('quality-group');
    }
    
    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Settings events
        this.outputFormat.addEventListener('change', () => this.handleFormatChange());
        this.qualitySlider.addEventListener('input', () => this.updateQualityDisplay());
        this.convertBtn.addEventListener('click', () => this.convertImages());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        // Initialize quality display
        this.updateQualityDisplay();
        this.handleFormatChange();
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        this.processFiles(files);
    }
    
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }
    
    processFiles(files) {
        if (files.length === 0) return;
        
        // Filter only image files
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showNotification('Please select valid image files.', 'error');
            return;
        }
        
        this.uploadedFiles = [...this.uploadedFiles, ...imageFiles];
        this.showSettings();
        this.displayImagePreviews();
    }
    
    showSettings() {
        this.conversionSettings.style.display = 'block';
        this.imagePreview.style.display = 'block';
    }
    
    displayImagePreviews() {
        this.previewContainer.innerHTML = '';
        
        this.uploadedFiles.forEach((file, index) => {
            const imageCard = this.createImageCard(file, index);
            this.previewContainer.appendChild(imageCard);
        });
    }
    
    createImageCard(file, index) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.index = index;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            card.innerHTML = `
                <div class="image-card__header">
                    <span class="image-card__name">${file.name}</span>
                    <span class="image-card__status status--processing">Ready</span>
                </div>
                <div class="image-card__content">
                    <div class="image-preview-container">
                        <h4>Original</h4>
                        <img src="${e.target.result}" alt="Original image">
                        <div class="image-info">
                            ${this.formatFileSize(file.size)} • ${file.type.split('/')[1].toUpperCase()}
                        </div>
                    </div>
                    <div class="image-preview-container">
                        <h4>Converted</h4>
                        <div class="converted-placeholder">
                            <i class="fas fa-image" style="font-size: 3rem; color: var(--border-color);"></i>
                            <p style="color: var(--text-secondary); margin-top: 1rem;">Click convert to see result</p>
                        </div>
                    </div>
                </div>
                <div class="image-card__actions">
                    <button class="btn btn--secondary btn--small remove-btn" onclick="imageConverter.removeImage(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        return card;
    }
    
    removeImage(index) {
        this.uploadedFiles.splice(index, 1);
        this.convertedImages.splice(index, 1);
        
        if (this.uploadedFiles.length === 0) {
            this.clearAll();
        } else {
            this.displayImagePreviews();
        }
    }
    
    handleFormatChange() {
        const format = this.outputFormat.value;
        // Show quality slider only for lossy formats
        if (format === 'jpeg' || format === 'webp') {
            this.qualityGroup.style.display = 'block';
        } else {
            this.qualityGroup.style.display = 'none';
        }
    }
    
    updateQualityDisplay() {
        this.qualityValue.textContent = this.qualitySlider.value;
    }
    
    async convertImages() {
        if (this.isConverting || this.uploadedFiles.length === 0) return;
        
        this.isConverting = true;
        this.convertBtn.disabled = true;
        this.convertBtn.innerHTML = '<div class="loading-spinner"></div> Converting...';
        
        this.progressContainer.style.display = 'block';
        this.convertedImages = [];
        
        const format = this.outputFormat.value;
        const quality = this.qualitySlider.value / 100;
        
        for (let i = 0; i < this.uploadedFiles.length; i++) {
            const file = this.uploadedFiles[i];
            const progress = ((i + 1) / this.uploadedFiles.length) * 100;
            
            this.updateProgress(progress, `Converting ${file.name}...`);
            this.updateImageCardStatus(i, 'processing', 'Converting...');
            
            try {
                const convertedBlob = await this.convertImage(file, format, quality);
                const convertedFile = new File([convertedBlob], 
                    this.getConvertedFileName(file.name, format), 
                    { type: convertedBlob.type }
                );
                
                this.convertedImages[i] = convertedFile;
                this.updateImageCardStatus(i, 'completed', 'Completed');
                this.displayConvertedImage(i, convertedFile);
                
            } catch (error) {
                console.error('Conversion error:', error);
                this.updateImageCardStatus(i, 'error', 'Error');
                this.showNotification(`Failed to convert ${file.name}`, 'error');
            }
        }
        
        this.progressContainer.style.display = 'none';
        this.isConverting = false;
        this.convertBtn.disabled = false;
        this.convertBtn.innerHTML = '<i class="fas fa-magic"></i> Convert Images';

        // Show download all button if multiple images
        if (this.convertedImages.length > 1) {
            this.showDownloadAllButton();
        }

        this.showNotification('Conversion completed!', 'success');
    }
    
    async convertImage(file, format, quality) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0);
                
                // Convert to desired format
                const mimeType = this.getMimeType(format);
                const qualityParam = (format === 'jpeg' || format === 'webp') ? quality : undefined;
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert image'));
                    }
                }, mimeType, qualityParam);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    getMimeType(format) {
        const mimeTypes = {
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp'
        };
        return mimeTypes[format] || 'image/jpeg';
    }
    
    getConvertedFileName(originalName, format) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const extensions = {
            'jpeg': 'jpg',
            'png': 'png',
            'webp': 'webp',
            'gif': 'gif',
            'bmp': 'bmp'
        };
        return `${nameWithoutExt}.${extensions[format] || 'jpg'}`;
    }
    
    displayConvertedImage(index, convertedFile) {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (!card) return;
        
        const convertedContainer = card.querySelector('.image-preview-container:last-child');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            convertedContainer.innerHTML = `
                <h4>Converted</h4>
                <img src="${e.target.result}" alt="Converted image">
                <div class="image-info">
                    ${this.formatFileSize(convertedFile.size)} • ${convertedFile.type.split('/')[1].toUpperCase()}
                </div>
                <button class="btn btn--primary btn--small download-btn" onclick="imageConverter.downloadImage(${index})">
                    <i class="fas fa-download"></i> Download
                </button>
            `;
        };
        reader.readAsDataURL(convertedFile);
    }
    
    downloadImage(index) {
        const convertedFile = this.convertedImages[index];
        if (!convertedFile) return;
        
        const url = URL.createObjectURL(convertedFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = convertedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }
    
    updateImageCardStatus(index, status, text) {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (!card) return;
        
        const statusElement = card.querySelector('.image-card__status');
        statusElement.className = `image-card__status status--${status}`;
        statusElement.textContent = text;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showDownloadAllButton() {
        // Check if button already exists
        if (document.getElementById('download-all-btn')) return;

        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.id = 'download-all-btn';
        downloadAllBtn.className = 'btn btn--primary';
        downloadAllBtn.innerHTML = '<i class="fas fa-download"></i> Download All as ZIP';
        downloadAllBtn.style.marginTop = 'var(--spacing-lg)';
        downloadAllBtn.style.width = '100%';

        downloadAllBtn.addEventListener('click', () => this.downloadAllAsZip());

        this.imagePreview.appendChild(downloadAllBtn);
    }

    async downloadAllAsZip() {
        // For now, download individually since JSZip requires additional setup
        // In a real implementation, you would use JSZip library
        this.showNotification('Downloading all images individually...', 'info');

        this.convertedImages.forEach((file, index) => {
            if (file) {
                setTimeout(() => {
                    this.downloadImage(index);
                }, index * 500); // Stagger downloads
            }
        });
    }

    clearAll() {
        this.uploadedFiles = [];
        this.convertedImages = [];
        this.conversionSettings.style.display = 'none';
        this.imagePreview.style.display = 'none';
        this.progressContainer.style.display = 'none';
        this.previewContainer.innerHTML = '';
        this.fileInput.value = '';

        // Remove download all button if it exists
        const downloadAllBtn = document.getElementById('download-all-btn');
        if (downloadAllBtn) {
            downloadAllBtn.remove();
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the image converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageConverter = new ImageConverter();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
