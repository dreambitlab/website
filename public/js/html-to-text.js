// HTML to Text Converter JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const htmlInput = document.getElementById('htmlInput');
    const textOutput = document.getElementById('textOutput');
    const convertBtn = document.getElementById('convertBtn');
    const resetBtn = document.getElementById('resetBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const fileInput = document.getElementById('fileInput');
    
    // Option checkboxes
    const preserveLineBreaks = document.getElementById('preserveLineBreaks');
    const removeExtraSpaces = document.getElementById('removeExtraSpaces');
    const convertEntities = document.getElementById('convertEntities');
    
    // Counter elements
    const inputCharCount = document.getElementById('inputCharCount');
    const inputWordCount = document.getElementById('inputWordCount');
    const outputCharCount = document.getElementById('outputCharCount');
    const outputWordCount = document.getElementById('outputWordCount');
    const conversionStatus = document.getElementById('conversionStatus');

    // Update character and word counts
    function updateCounts() {
        const inputText = htmlInput.value;
        const outputText = textOutput.value;
        
        // Input counts
        inputCharCount.textContent = inputText.length.toLocaleString();
        inputWordCount.textContent = inputText.trim() ? inputText.trim().split(/\s+/).length.toLocaleString() : '0';
        
        // Output counts
        outputCharCount.textContent = outputText.length.toLocaleString();
        outputWordCount.textContent = outputText.trim() ? outputText.trim().split(/\s+/).length.toLocaleString() : '0';
    }

    // Convert HTML to Text
    async function convertHtmlToText() {
        const html = htmlInput.value.trim();
        
        if (!html) {
            showStatus('Please enter some HTML content to convert.', 'error');
            return;
        }

        // Show loading state
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
        textOutput.classList.add('loading');

        try {
            const options = {
                preserveLineBreaks: preserveLineBreaks.checked,
                removeExtraSpaces: removeExtraSpaces.checked,
                convertEntities: convertEntities.checked
            };

            const response = await fetch('/api/html-to-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ html, options })
            });

            const result = await response.json();

            if (result.success) {
                textOutput.value = result.text;
                textOutput.classList.add('success');
                
                const stats = result.stats;
                showStatus(`Converted successfully! Removed ${stats.charactersRemoved.toLocaleString()} characters.`, 'success');
                
                setTimeout(() => {
                    textOutput.classList.remove('success');
                }, 2000);
            } else {
                showStatus(result.error || 'Conversion failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            showStatus('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Reset button state
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convert HTML to Text';
            textOutput.classList.remove('loading');
            updateCounts();
        }
    }

    // Show status message
    function showStatus(message, type = 'info') {
        conversionStatus.textContent = message;
        conversionStatus.className = `conversion-status ${type}`;
        
        setTimeout(() => {
            conversionStatus.textContent = '';
            conversionStatus.className = 'conversion-status';
        }, 5000);
    }

    // Copy to clipboard
    async function copyToClipboard() {
        const text = textOutput.value;
        
        if (!text) {
            showStatus('No text to copy. Please convert some HTML first.', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            copyBtn.classList.add('copy-success');
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            showStatus('Text copied to clipboard!', 'success');
            
            setTimeout(() => {
                copyBtn.classList.remove('copy-success');
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 1000);
        } catch (error) {
            // Fallback for older browsers
            textOutput.select();
            document.execCommand('copy');
            showStatus('Text copied to clipboard!', 'success');
        }
    }

    // Download as text file
    function downloadText() {
        const text = textOutput.value;
        
        if (!text) {
            showStatus('No text to download. Please convert some HTML first.', 'error');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showStatus('Text file downloaded!', 'success');
    }

    // Paste from clipboard
    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            htmlInput.value = text;
            updateCounts();
            showStatus('Content pasted from clipboard!', 'success');
        } catch (error) {
            showStatus('Unable to paste from clipboard. Please paste manually.', 'error');
        }
    }

    // Clear input
    function clearInput() {
        htmlInput.value = '';
        updateCounts();
        showStatus('Input cleared.', 'info');
    }

    // Clear output
    function clearOutput() {
        textOutput.value = '';
        updateCounts();
        showStatus('Output cleared.', 'info');
    }

    // Reset all
    function resetAll() {
        htmlInput.value = '';
        textOutput.value = '';
        preserveLineBreaks.checked = true;
        removeExtraSpaces.checked = true;
        convertEntities.checked = true;
        updateCounts();
        showStatus('All fields reset.', 'info');
    }

    // Handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        if (!file.type.includes('text') && !file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
            showStatus('Please select a valid HTML or text file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            htmlInput.value = e.target.result;
            updateCounts();
            showStatus(`File "${file.name}" loaded successfully!`, 'success');
        };
        reader.onerror = function() {
            showStatus('Error reading file. Please try again.', 'error');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    }

    // Event listeners
    convertBtn.addEventListener('click', convertHtmlToText);
    resetBtn.addEventListener('click', resetAll);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadText);
    pasteBtn.addEventListener('click', pasteFromClipboard);
    clearInputBtn.addEventListener('click', clearInput);
    clearOutputBtn.addEventListener('click', clearOutput);
    uploadFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);

    // Update counts on input
    htmlInput.addEventListener('input', updateCounts);
    textOutput.addEventListener('input', updateCounts);

    // Auto-convert on option change (optional)
    [preserveLineBreaks, removeExtraSpaces, convertEntities].forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (htmlInput.value.trim() && textOutput.value.trim()) {
                convertHtmlToText();
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convertHtmlToText();
        }
        
        // Ctrl/Cmd + Shift + C to copy
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyToClipboard();
        }
        
        // Ctrl/Cmd + Shift + R to reset
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            resetAll();
        }
    });

    // Initialize counts
    updateCounts();

    // Show keyboard shortcuts info
    console.log('HTML to Text Converter Keyboard Shortcuts:');
    console.log('Ctrl/Cmd + Enter: Convert HTML to Text');
    console.log('Ctrl/Cmd + Shift + C: Copy to Clipboard');
    console.log('Ctrl/Cmd + Shift + R: Reset All');
});
