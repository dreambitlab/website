// Age Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const birthDateInput = document.getElementById('birthDate');
    const birthTimeInput = document.getElementById('birthTime');
    const customDateInput = document.getElementById('customDate');
    const customTimeInput = document.getElementById('customTime');
    const customDateGroup = document.getElementById('customDateGroup');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsSection = document.getElementById('resultsSection');
    
    // Radio buttons
    const ageAsOfRadios = document.querySelectorAll('input[name="ageAsOf"]');
    
    // Result elements
    const mainAge = document.getElementById('mainAge');
    const totalYears = document.getElementById('totalYears');
    const totalMonths = document.getElementById('totalMonths');
    const totalDays = document.getElementById('totalDays');
    const totalHours = document.getElementById('totalHours');
    const totalMinutes = document.getElementById('totalMinutes');
    const exactAgeText = document.getElementById('exactAgeText');
    const nextBirthdayDate = document.getElementById('nextBirthdayDate');
    const birthdayCountdown = document.getElementById('birthdayCountdown');
    const daysLived = document.getElementById('daysLived');
    const heartbeats = document.getElementById('heartbeats');
    const earthDistance = document.getElementById('earthDistance');
    const weekends = document.getElementById('weekends');

    // Set today's date as default for custom date
    const today = new Date();
    customDateInput.value = today.toISOString().split('T')[0];
    
    // Set current time as default for custom time
    const now = new Date();
    customTimeInput.value = now.toTimeString().slice(0, 5);

    // Handle age as of radio button changes
    ageAsOfRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDateGroup.style.display = 'grid';
            } else {
                customDateGroup.style.display = 'none';
            }
        });
    });

    // Calculate age function
    async function calculateAge() {
        const birthDate = birthDateInput.value;
        const birthTime = birthTimeInput.value;
        
        if (!birthDate) {
            showError('Please enter your birth date.');
            return;
        }

        // Validate birth date is not in the future
        const birth = new Date(birthDate);
        const now = new Date();
        if (birth > now) {
            showError('Birth date cannot be in the future.');
            return;
        }

        // Get reference date and time
        const ageAsOf = document.querySelector('input[name="ageAsOf"]:checked').value;
        let referenceDate, referenceTime;
        
        if (ageAsOf === 'custom') {
            referenceDate = customDateInput.value;
            referenceTime = customTimeInput.value;
            
            if (!referenceDate) {
                showError('Please enter a custom date.');
                return;
            }
        } else {
            referenceDate = now.toISOString().split('T')[0];
            referenceTime = now.toTimeString().slice(0, 5);
        }

        // Show loading state
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        
        try {
            const response = await fetch('/api/calculate-age', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    birthDate,
                    birthTime,
                    referenceDate,
                    referenceTime
                })
            });

            const result = await response.json();

            if (result.success) {
                displayResults(result.age);
                resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                showError(result.error || 'Calculation failed. Please try again.');
            }
        } catch (error) {
            console.error('Calculation error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Age';
        }
    }

    // Display results function
    function displayResults(ageData) {
        // Main age display
        mainAge.textContent = ageData.exact.years;
        
        // Total breakdowns
        totalYears.textContent = ageData.totals.years.toLocaleString();
        totalMonths.textContent = ageData.totals.months.toLocaleString();
        totalDays.textContent = ageData.totals.days.toLocaleString();
        totalHours.textContent = ageData.totals.hours.toLocaleString();
        totalMinutes.textContent = ageData.totals.minutes.toLocaleString();
        
        // Exact age text
        const exactParts = [];
        if (ageData.exact.years > 0) exactParts.push(`${ageData.exact.years} year${ageData.exact.years !== 1 ? 's' : ''}`);
        if (ageData.exact.months > 0) exactParts.push(`${ageData.exact.months} month${ageData.exact.months !== 1 ? 's' : ''}`);
        if (ageData.exact.days > 0) exactParts.push(`${ageData.exact.days} day${ageData.exact.days !== 1 ? 's' : ''}`);
        if (ageData.exact.hours > 0) exactParts.push(`${ageData.exact.hours} hour${ageData.exact.hours !== 1 ? 's' : ''}`);
        if (ageData.exact.minutes > 0) exactParts.push(`${ageData.exact.minutes} minute${ageData.exact.minutes !== 1 ? 's' : ''}`);
        
        exactAgeText.textContent = exactParts.join(', ');
        
        // Next birthday
        nextBirthdayDate.textContent = ageData.nextBirthday.date;
        
        const countdownParts = [];
        if (ageData.nextBirthday.monthsUntil > 0) {
            countdownParts.push(`${ageData.nextBirthday.monthsUntil} month${ageData.nextBirthday.monthsUntil !== 1 ? 's' : ''}`);
        }
        if (ageData.nextBirthday.remainingDays > 0) {
            countdownParts.push(`${ageData.nextBirthday.remainingDays} day${ageData.nextBirthday.remainingDays !== 1 ? 's' : ''}`);
        }
        
        birthdayCountdown.textContent = countdownParts.length > 0 
            ? `in ${countdownParts.join(', ')}` 
            : 'Today is your birthday! 🎉';
        
        // Fun facts
        daysLived.textContent = ageData.funFacts.sunrises;
        heartbeats.textContent = ageData.funFacts.heartbeats;
        earthDistance.textContent = ageData.funFacts.earthDistance + ' km';
        weekends.textContent = ageData.funFacts.weekends;
        
        // Add animation to breakdown cards
        const breakdownCards = document.querySelectorAll('.breakdown-card');
        breakdownCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Show error message
    function showError(message) {
        // Create or update error message element
        let errorElement = document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.cssText = `
                background-color: #fee2e2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                font-weight: 500;
            `;
            calculateBtn.parentNode.insertBefore(errorElement, calculateBtn.nextSibling);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    // Reset function
    function resetCalculator() {
        birthDateInput.value = '';
        birthTimeInput.value = '';
        customDateInput.value = today.toISOString().split('T')[0];
        customTimeInput.value = now.toTimeString().slice(0, 5);
        
        // Reset radio buttons
        document.querySelector('input[name="ageAsOf"][value="today"]').checked = true;
        customDateGroup.style.display = 'none';
        
        // Hide results
        resultsSection.style.display = 'none';
        
        // Hide error message
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // Auto-calculate when birth date changes (optional)
    function autoCalculate() {
        if (birthDateInput.value) {
            calculateAge();
        }
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculateAge);
    resetBtn.addEventListener('click', resetCalculator);
    
    // Optional: Auto-calculate on date change
    birthDateInput.addEventListener('change', () => {
        if (birthDateInput.value) {
            // Small delay to allow user to finish selecting
            setTimeout(autoCalculate, 500);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter to calculate
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            calculateAge();
        }
        
        // Ctrl/Cmd + R to reset
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            resetCalculator();
        }
    });

    // Set max date to today for birth date input
    birthDateInput.max = today.toISOString().split('T')[0];
    
    // Set min date for custom date (can't be before birth date)
    birthDateInput.addEventListener('change', function() {
        if (this.value) {
            customDateInput.min = this.value;
        }
    });

    // Show keyboard shortcuts info
    console.log('Age Calculator Keyboard Shortcuts:');
    console.log('Enter: Calculate Age');
    console.log('Ctrl/Cmd + R: Reset Calculator');
});
