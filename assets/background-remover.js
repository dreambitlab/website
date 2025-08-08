// Background Remover JavaScript
class BackgroundRemover {
    constructor() {
        this.originalImage = null;
        this.processedImage = null;
        this.currentBackground = 'transparent';
        this.isProcessing = false;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.processingStatus = document.getElementById('processing-status');
        this.imageEditor = document.getElementById('image-editor');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Image elements
        this.originalImageEl = document.getElementById('original-image');
        this.processedImageEl = document.getElementById('processed-image');
        this.originalInfo = document.getElementById('original-info');
        this.processedInfo = document.getElementById('processed-info');
        
        // Control elements
        this.toggleViewBtn = document.getElementById('toggle-view');
        this.resetBtn = document.getElementById('reset-btn');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Background options
        this.bgOptions = document.querySelectorAll('.bg-option');
        this.customColorInput = document.getElementById('custom-color');
        
        // Format options
        this.outputFormat = document.getElementById('output-format');
        this.qualitySlider = document.getElementById('quality-slider');
        this.qualityValue = document.getElementById('quality-value');
        this.qualitySelector = document.getElementById('quality-selector');
    }
    
    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Control events
        this.resetBtn.addEventListener('click', () => this.resetTool());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        
        // Background option events
        this.bgOptions.forEach(option => {
            option.addEventListener('click', () => this.selectBackground(option));
        });
        
        this.customColorInput.addEventListener('change', () => this.applyCustomColor());
        
        // Format events
        this.outputFormat.addEventListener('change', () => this.handleFormatChange());
        this.qualitySlider.addEventListener('input', () => this.updateQualityDisplay());
        
        // Initialize
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
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processFile(file);
        }
    }
    
    async processFile(file) {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.originalImage = file;
            
            // Show processing status
            this.showProcessingStatus();
            
            // Load and display original image
            await this.loadOriginalImage(file);
            
            // Simulate AI processing (in real implementation, this would call an AI service)
            await this.simulateBackgroundRemoval();
            
            // Show editor
            this.showEditor();
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showError('Failed to process image. Please try again.');
        } finally {
            this.isProcessing = false;
        }
    }
    
    showProcessingStatus() {
        this.uploadArea.style.display = 'none';
        this.imageEditor.style.display = 'none';
        this.processingStatus.style.display = 'block';
        
        // Animate progress
        this.animateProgress();
    }
    
    async animateProgress() {
        const steps = [
            { progress: 20, text: 'Analyzing image structure...' },
            { progress: 40, text: 'Detecting objects and subjects...' },
            { progress: 60, text: 'Identifying background areas...' },
            { progress: 80, text: 'Applying AI background removal...' },
            { progress: 100, text: 'Finalizing processed image...' }
        ];
        
        for (const step of steps) {
            await this.updateProgress(step.progress, step.text);
            await this.delay(800);
        }
    }
    
    updateProgress(percentage, text) {
        return new Promise(resolve => {
            this.progressFill.style.width = `${percentage}%`;
            this.progressText.textContent = text;
            setTimeout(resolve, 100);
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async loadOriginalImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.originalImageEl.src = e.target.result;
                this.originalImageEl.onload = () => {
                    this.updateImageInfo(this.originalInfo, file, this.originalImageEl);
                    resolve();
                };
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async simulateBackgroundRemoval() {
        // In a real implementation, this would call an AI service like Remove.bg API
        // For demo purposes, we'll create a simple demonstration

        return new Promise((resolve) => {
            // Wait a bit to simulate processing
            setTimeout(() => {
                // For demo, we'll just copy the original image and add a simple effect
                this.createDemoProcessedImage(resolve);
            }, 1000);
        });
    }

    createDemoProcessedImage(resolve) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to match original image
            canvas.width = this.originalImageEl.naturalWidth;
            canvas.height = this.originalImageEl.naturalHeight;

            // Create a simple demo effect - draw the image with a circular mask
            ctx.drawImage(this.originalImageEl, 0, 0);

            // Apply a simple circular mask to simulate background removal
            this.applyCircularMask(ctx, canvas);

            // Convert to blob and display
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    this.processedImageEl.src = url;
                    this.processedImageEl.onload = () => {
                        this.updateImageInfo(this.processedInfo, blob, this.processedImageEl);
                        resolve();
                    };
                    this.processedImageEl.onerror = () => {
                        console.error('Failed to load processed image');
                        resolve();
                    };
                } else {
                    console.error('Failed to create blob from canvas');
                    resolve();
                }
            }, 'image/png');
        } catch (error) {
            console.error('Error creating demo image:', error);
            resolve();
        }
    }

    applyCircularMask(ctx, canvas) {
        // Create a simple circular mask effect for demo
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.4;

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply circular mask
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const index = (y * canvas.width + x) * 4;

                // If pixel is outside the circle, make it transparent
                if (distance > radius) {
                    data[index + 3] = 0; // Set alpha to 0 (transparent)
                }
            }
        }

        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);
    }
    

    
    updateImageInfo(infoElement, file, imageElement) {
        const fileSize = this.formatFileSize(file.size || file);
        const dimensions = `${imageElement.naturalWidth} × ${imageElement.naturalHeight}`;
        
        infoElement.innerHTML = `
            <span class="file-size">${fileSize}</span>
            <span class="dimensions">${dimensions}</span>
        `;
    }
    
    formatFileSize(bytes) {
        if (typeof bytes !== 'number') return 'Unknown';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showEditor() {
        this.processingStatus.style.display = 'none';
        this.imageEditor.style.display = 'block';
        this.imageEditor.scrollIntoView({ behavior: 'smooth' });
    }
    
    selectBackground(option) {
        // Remove active class from all options
        this.bgOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        option.classList.add('active');
        
        const bgType = option.dataset.bg;
        this.currentBackground = bgType;
        
        if (bgType === 'custom') {
            this.customColorInput.click();
        } else {
            this.applyBackground(bgType);
        }
    }
    
    applyCustomColor() {
        const color = this.customColorInput.value;
        this.applyBackground('custom', color);
    }
    
    applyBackground(type, customColor = null) {
        const container = this.processedImageEl.parentElement;
        
        switch (type) {
            case 'transparent':
                container.style.background = '';
                container.classList.add('transparent-bg');
                break;
            case 'white':
                container.classList.remove('transparent-bg');
                container.style.background = 'white';
                break;
            case 'black':
                container.classList.remove('transparent-bg');
                container.style.background = 'black';
                break;
            case 'blue':
                container.classList.remove('transparent-bg');
                container.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                break;
            case 'green':
                container.classList.remove('transparent-bg');
                container.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
                break;
            case 'custom':
                container.classList.remove('transparent-bg');
                container.style.background = customColor || '#ff6b6b';
                break;
        }
    }
    
    handleFormatChange() {
        const format = this.outputFormat.value;
        if (format === 'jpeg') {
            this.qualitySelector.style.display = 'block';
        } else {
            this.qualitySelector.style.display = 'none';
        }
    }
    
    updateQualityDisplay() {
        this.qualityValue.textContent = this.qualitySlider.value;
    }
    
    downloadImage() {
        if (!this.processedImageEl.src) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = this.processedImageEl.naturalWidth;
        canvas.height = this.processedImageEl.naturalHeight;
        
        // Apply background if not transparent
        if (this.currentBackground !== 'transparent') {
            this.fillCanvasBackground(ctx, canvas);
        }
        
        // Draw the processed image
        ctx.drawImage(this.processedImageEl, 0, 0);
        
        // Convert and download
        const format = this.outputFormat.value;
        const quality = this.qualitySlider.value / 100;
        const mimeType = this.getMimeType(format);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `background-removed.${format === 'jpeg' ? 'jpg' : format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Image downloaded successfully!', 'success');
        }, mimeType, format === 'jpeg' ? quality : undefined);
    }
    
    fillCanvasBackground(ctx, canvas) {
        const container = this.processedImageEl.parentElement;
        const bgStyle = container.style.background;
        
        if (bgStyle.includes('gradient')) {
            // For gradients, use a solid color approximation
            ctx.fillStyle = this.currentBackground === 'blue' ? '#667eea' : '#4facfe';
        } else {
            ctx.fillStyle = bgStyle || 'white';
        }
        
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    getMimeType(format) {
        const mimeTypes = {
            'png': 'image/png',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp'
        };
        return mimeTypes[format] || 'image/png';
    }
    
    resetTool() {
        this.originalImage = null;
        this.processedImage = null;
        this.currentBackground = 'transparent';
        
        this.uploadArea.style.display = 'block';
        this.processingStatus.style.display = 'none';
        this.imageEditor.style.display = 'none';
        
        this.fileInput.value = '';
        this.progressFill.style.width = '0%';
        
        // Reset background options
        this.bgOptions.forEach(opt => opt.classList.remove('active'));
        this.bgOptions[0].classList.add('active'); // Select transparent
        
        this.showNotification('Tool reset successfully!', 'info');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        this.resetTool();
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
            max-width: 300px;
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

// Initialize the background remover when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.backgroundRemover = new BackgroundRemover();
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
