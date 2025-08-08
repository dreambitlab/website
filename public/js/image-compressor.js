// Image Compressor Tool JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const settingsSection = document.getElementById('settingsSection');
    const resultsSection = document.getElementById('resultsSection');
    const statusMessage = document.getElementById('statusMessage');
    const compressBtn = document.getElementById('compressBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsGrid = document.getElementById('resultsGrid');
    
    // Settings elements
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const formatSelect = document.getElementById('format');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const maintainAspectCheckbox = document.getElementById('maintainAspect');
    
    // State
    let selectedFiles = [];
    let compressedResults = [];
    
    // Initialize
    init();
    
    function init() {
        setupEventListeners();
        setupMobileMenu();
    }
    
    function setupEventListeners() {
        // Upload area events
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        
        // File input change
        fileInput.addEventListener('change', handleFileSelect);
        
        // Quality slider
        qualitySlider.addEventListener('input', updateQualityValue);
        
        // Compress button
        compressBtn.addEventListener('click', compressImages);
        
        // Download all button
        downloadAllBtn.addEventListener('click', downloadAllImages);
        
        // Reset button
        resetBtn.addEventListener('click', resetTool);
        
        // Maintain aspect ratio
        maintainAspectCheckbox.addEventListener('change', handleAspectRatioChange);
        widthInput.addEventListener('input', handleDimensionChange);
        heightInput.addEventListener('input', handleDimensionChange);
    }
    
    function setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (files.length > 0) {
            processFiles(files);
        } else {
            showStatus('Please drop only image files.', 'error');
        }
    }
    
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            processFiles(files);
        }
    }
    
    function processFiles(files) {
        selectedFiles = files;
        showStatus(`${files.length} image(s) selected`, 'success');
        settingsSection.style.display = 'block';
        settingsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show file previews
        displayFilePreviews(files);
    }
    
    function displayFilePreviews(files) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'file-previews';
        previewContainer.innerHTML = '<h4>Selected Images:</h4>';
        
        files.forEach((file, index) => {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            
            const info = document.createElement('div');
            info.className = 'file-info';
            info.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            `;
            
            preview.appendChild(img);
            preview.appendChild(info);
            previewContainer.appendChild(preview);
        });
        
        // Remove existing previews
        const existingPreviews = settingsSection.querySelector('.file-previews');
        if (existingPreviews) {
            existingPreviews.remove();
        }
        
        settingsSection.insertBefore(previewContainer, settingsSection.querySelector('.settings-grid'));
    }
    
    function updateQualityValue() {
        qualityValue.textContent = qualitySlider.value + '%';
    }
    
    function handleAspectRatioChange() {
        if (maintainAspectCheckbox.checked && widthInput.value && heightInput.value) {
            // Store the current aspect ratio
            const aspectRatio = parseFloat(widthInput.value) / parseFloat(heightInput.value);
            widthInput.dataset.aspectRatio = aspectRatio;
        }
    }
    
    function handleDimensionChange(e) {
        if (!maintainAspectCheckbox.checked) return;
        
        const aspectRatio = parseFloat(widthInput.dataset.aspectRatio);
        if (!aspectRatio) return;
        
        if (e.target === widthInput && widthInput.value) {
            heightInput.value = Math.round(parseFloat(widthInput.value) / aspectRatio);
        } else if (e.target === heightInput && heightInput.value) {
            widthInput.value = Math.round(parseFloat(heightInput.value) * aspectRatio);
        }
    }
    
    async function compressImages() {
        if (selectedFiles.length === 0) {
            showStatus('Please select images first.', 'error');
            return;
        }
        
        // Show loading state
        compressBtn.disabled = true;
        compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';
        showStatus('Compressing images...', 'info');
        
        try {
            const formData = new FormData();
            
            // Add files
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });
            
            // Add settings
            formData.append('quality', qualitySlider.value);
            formData.append('format', formatSelect.value);
            formData.append('width', widthInput.value || '');
            formData.append('height', heightInput.value || '');
            formData.append('maintainAspect', maintainAspectCheckbox.checked);
            
            const response = await fetch('/api/compress-images', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                compressedResults = result.images;
                displayResults(result.images);
                showStatus(`Successfully compressed ${result.images.length} image(s)!`, 'success');
                resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                showStatus(result.error || 'Compression failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Compression error:', error);
            showStatus('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Reset button state
            compressBtn.disabled = false;
            compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Images';
        }
    }
    
    function displayResults(images) {
        resultsGrid.innerHTML = '';
        
        images.forEach((image, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            
            const compressionRatio = ((image.originalSize - image.compressedSize) / image.originalSize * 100).toFixed(1);
            
            resultCard.innerHTML = `
                <div class="result-preview">
                    <img src="data:${image.mimeType};base64,${image.data}" alt="${image.filename}">
                </div>
                <div class="result-info">
                    <h4>${image.filename}</h4>
                    <div class="size-comparison">
                        <div class="size-item">
                            <span class="label">Original:</span>
                            <span class="value">${formatFileSize(image.originalSize)}</span>
                        </div>
                        <div class="size-item">
                            <span class="label">Compressed:</span>
                            <span class="value">${formatFileSize(image.compressedSize)}</span>
                        </div>
                        <div class="size-item savings">
                            <span class="label">Saved:</span>
                            <span class="value">${compressionRatio}%</span>
                        </div>
                    </div>
                    <button class="download-btn" onclick="downloadImage(${index})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;
            
            resultsGrid.appendChild(resultCard);
        });
    }
    
    // Make downloadImage available globally
    window.downloadImage = function(index) {
        const image = compressedResults[index];
        if (!image) return;
        
        const link = document.createElement('a');
        link.href = `data:${image.mimeType};base64,${image.data}`;
        link.download = image.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    function downloadAllImages() {
        compressedResults.forEach((image, index) => {
            setTimeout(() => {
                window.downloadImage(index);
            }, index * 100); // Small delay between downloads
        });
    }
    
    function resetTool() {
        selectedFiles = [];
        compressedResults = [];
        fileInput.value = '';
        settingsSection.style.display = 'none';
        resultsSection.style.display = 'none';
        statusMessage.innerHTML = '';
        
        // Reset form values
        qualitySlider.value = 80;
        qualityValue.textContent = '80%';
        formatSelect.value = 'original';
        widthInput.value = '';
        heightInput.value = '';
        maintainAspectCheckbox.checked = true;
        
        // Remove previews
        const existingPreviews = settingsSection.querySelector('.file-previews');
        if (existingPreviews) {
            existingPreviews.remove();
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function showStatus(message, type = 'info') {
        statusMessage.innerHTML = `
            <div class="status-${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;
        
        // Auto-hide after 5 seconds for success/info messages
        if (type !== 'error') {
            setTimeout(() => {
                statusMessage.innerHTML = '';
            }, 5000);
        }
    }
});
