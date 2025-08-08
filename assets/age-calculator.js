// Age Calculator JavaScript
class AgeCalculator {
    constructor() {
        this.birthDate = null;
        this.birthTime = null;
        this.targetDate = null;
        this.updateInterval = null;
        
        this.initializeElements();
        this.bindEvents();
        this.setDefaultDates();
    }
    
    initializeElements() {
        this.birthDateInput = document.getElementById('birth-date');
        this.birthTimeInput = document.getElementById('birth-time');
        this.calculateToDateInput = document.getElementById('calculate-to-date');
        this.calculateBtn = document.getElementById('calculate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.resultsSection = document.getElementById('results-section');
        
        // Result elements
        this.mainAge = document.getElementById('main-age');
        this.yearsValue = document.getElementById('years-value');
        this.monthsValue = document.getElementById('months-value');
        this.daysValue = document.getElementById('days-value');
        this.hoursValue = document.getElementById('hours-value');
        this.minutesValue = document.getElementById('minutes-value');
        this.secondsValue = document.getElementById('seconds-value');
        
        // Statistics elements
        this.totalDays = document.getElementById('total-days');
        this.totalHours = document.getElementById('total-hours');
        this.totalMinutes = document.getElementById('total-minutes');
        this.heartbeats = document.getElementById('heartbeats');
        
        // Birthday countdown elements
        this.birthdayCountdown = document.getElementById('birthday-countdown');
        this.countdownMonths = document.getElementById('countdown-months');
        this.countdownDays = document.getElementById('countdown-days');
        this.countdownHours = document.getElementById('countdown-hours');
        this.countdownMinutes = document.getElementById('countdown-minutes');
        this.nextBirthdayDate = document.getElementById('next-birthday-date');
        this.nextAge = document.getElementById('next-age');
        
        // Zodiac elements
        this.zodiacIcon = document.getElementById('zodiac-icon');
        this.zodiacName = document.getElementById('zodiac-name');
        this.zodiacDates = document.getElementById('zodiac-dates');
        this.zodiacDescription = document.getElementById('zodiac-description');
    }
    
    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.calculateAge());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        // Real-time calculation when birth date changes
        this.birthDateInput.addEventListener('change', () => {
            if (this.birthDateInput.value) {
                this.calculateAge();
            }
        });
        
        this.birthTimeInput.addEventListener('change', () => {
            if (this.birthDateInput.value) {
                this.calculateAge();
            }
        });
        
        this.calculateToDateInput.addEventListener('change', () => {
            if (this.birthDateInput.value) {
                this.calculateAge();
            }
        });
    }
    
    setDefaultDates() {
        // Set max date for birth date to today
        const today = new Date().toISOString().split('T')[0];
        this.birthDateInput.max = today;
        
        // Set default calculate-to date to today
        this.calculateToDateInput.value = today;
    }
    
    calculateAge() {
        if (!this.validateInputs()) return;
        
        this.parseDates();
        const ageData = this.computeAge();
        this.displayResults(ageData);
        this.startLiveUpdates();
        
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    validateInputs() {
        this.clearErrors();
        
        if (!this.birthDateInput.value) {
            this.showError(this.birthDateInput, 'Please enter your birth date');
            return false;
        }
        
        const birthDate = new Date(this.birthDateInput.value);
        const targetDate = this.calculateToDateInput.value ? 
            new Date(this.calculateToDateInput.value) : new Date();
        
        if (birthDate > targetDate) {
            this.showError(this.birthDateInput, 'Birth date cannot be in the future');
            return false;
        }
        
        return true;
    }
    
    showError(element, message) {
        element.classList.add('error');
        
        // Remove existing error message
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        element.parentNode.appendChild(errorDiv);
    }
    
    clearErrors() {
        document.querySelectorAll('.input-field.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }
    
    parseDates() {
        const birthDateStr = this.birthDateInput.value;
        const birthTimeStr = this.birthTimeInput.value || '00:00';
        
        this.birthDate = new Date(`${birthDateStr}T${birthTimeStr}`);
        this.targetDate = this.calculateToDateInput.value ? 
            new Date(this.calculateToDateInput.value) : new Date();
    }
    
    computeAge() {
        const birth = new Date(this.birthDate);
        const target = new Date(this.targetDate);
        
        // Calculate exact age
        let years = target.getFullYear() - birth.getFullYear();
        let months = target.getMonth() - birth.getMonth();
        let days = target.getDate() - birth.getDate();
        let hours = target.getHours() - birth.getHours();
        let minutes = target.getMinutes() - birth.getMinutes();
        let seconds = target.getSeconds() - birth.getSeconds();
        
        // Adjust for negative values
        if (seconds < 0) {
            seconds += 60;
            minutes--;
        }
        if (minutes < 0) {
            minutes += 60;
            hours--;
        }
        if (hours < 0) {
            hours += 24;
            days--;
        }
        if (days < 0) {
            const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
            days += lastMonth.getDate();
            months--;
        }
        if (months < 0) {
            months += 12;
            years--;
        }
        
        // Calculate totals
        const totalMs = target.getTime() - birth.getTime();
        const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
        const totalMinutes = Math.floor(totalMs / (1000 * 60));
        const totalSeconds = Math.floor(totalMs / 1000);
        
        // Calculate next birthday
        const nextBirthday = this.calculateNextBirthday(birth, target);
        
        // Calculate zodiac sign
        const zodiac = this.calculateZodiacSign(birth);
        
        return {
            years, months, days, hours, minutes, seconds,
            totalDays, totalHours, totalMinutes, totalSeconds,
            nextBirthday, zodiac
        };
    }
    
    calculateNextBirthday(birth, target) {
        const currentYear = target.getFullYear();
        let nextBirthday = new Date(currentYear, birth.getMonth(), birth.getDate());
        
        if (nextBirthday <= target) {
            nextBirthday = new Date(currentYear + 1, birth.getMonth(), birth.getDate());
        }
        
        const timeDiff = nextBirthday.getTime() - target.getTime();
        const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursUntil = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        const monthsUntil = Math.floor(daysUntil / 30);
        const remainingDays = daysUntil % 30;
        
        return {
            date: nextBirthday,
            months: monthsUntil,
            days: remainingDays,
            hours: hoursUntil,
            minutes: minutesUntil,
            nextAge: nextBirthday.getFullYear() - birth.getFullYear()
        };
    }
    
    calculateZodiacSign(birthDate) {
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        const signs = [
            { name: 'Capricorn', icon: '♑', dates: 'December 22 - January 19', 
              description: 'Practical, ambitious, disciplined, patient, careful, humorous' },
            { name: 'Aquarius', icon: '♒', dates: 'January 20 - February 18', 
              description: 'Progressive, original, independent, humanitarian, inventive' },
            { name: 'Pisces', icon: '♓', dates: 'February 19 - March 20', 
              description: 'Compassionate, artistic, intuitive, gentle, wise, musical' },
            { name: 'Aries', icon: '♈', dates: 'March 21 - April 19', 
              description: 'Courageous, determined, confident, enthusiastic, optimistic' },
            { name: 'Taurus', icon: '♉', dates: 'April 20 - May 20', 
              description: 'Reliable, patient, practical, devoted, responsible, stable' },
            { name: 'Gemini', icon: '♊', dates: 'May 21 - June 20', 
              description: 'Gentle, affectionate, curious, adaptable, quick learner' },
            { name: 'Cancer', icon: '♋', dates: 'June 21 - July 22', 
              description: 'Tenacious, highly imaginative, loyal, emotional, sympathetic' },
            { name: 'Leo', icon: '♌', dates: 'July 23 - August 22', 
              description: 'Creative, passionate, generous, warm-hearted, cheerful' },
            { name: 'Virgo', icon: '♍', dates: 'August 23 - September 22', 
              description: 'Loyal, analytical, kind, hardworking, practical, shy' },
            { name: 'Libra', icon: '♎', dates: 'September 23 - October 22', 
              description: 'Cooperative, diplomatic, gracious, fair-minded, social' },
            { name: 'Scorpio', icon: '♏', dates: 'October 23 - November 21', 
              description: 'Resourceful, brave, passionate, stubborn, true friend' },
            { name: 'Sagittarius', icon: '♐', dates: 'November 22 - December 21', 
              description: 'Generous, idealistic, great sense of humor, philosophical' }
        ];
        
        // Determine zodiac sign based on birth date
        if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return signs[0];
        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return signs[1];
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return signs[2];
        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return signs[3];
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return signs[4];
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return signs[5];
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return signs[6];
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return signs[7];
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return signs[8];
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return signs[9];
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return signs[10];
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return signs[11];
        
        return signs[0]; // Default to Capricorn
    }
    
    displayResults(ageData) {
        // Main age display
        this.mainAge.textContent = ageData.years;
        
        // Age breakdown
        this.yearsValue.textContent = ageData.years;
        this.monthsValue.textContent = ageData.months;
        this.daysValue.textContent = ageData.days;
        this.hoursValue.textContent = ageData.hours;
        this.minutesValue.textContent = ageData.minutes;
        this.secondsValue.textContent = ageData.seconds;
        
        // Life statistics
        this.totalDays.textContent = this.formatNumber(ageData.totalDays);
        this.totalHours.textContent = this.formatNumber(ageData.totalHours);
        this.totalMinutes.textContent = this.formatNumber(ageData.totalMinutes);
        
        // Estimated heartbeats (average 70 bpm)
        const estimatedHeartbeats = ageData.totalMinutes * 70;
        this.heartbeats.textContent = this.formatNumber(estimatedHeartbeats);
        
        // Birthday countdown
        this.countdownMonths.textContent = ageData.nextBirthday.months;
        this.countdownDays.textContent = ageData.nextBirthday.days;
        this.countdownHours.textContent = ageData.nextBirthday.hours;
        this.countdownMinutes.textContent = ageData.nextBirthday.minutes;
        
        const birthdayOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        this.nextBirthdayDate.textContent = ageData.nextBirthday.date.toLocaleDateString('en-US', birthdayOptions);
        this.nextAge.textContent = ageData.nextBirthday.nextAge;
        
        // Zodiac sign
        this.zodiacIcon.textContent = ageData.zodiac.icon;
        this.zodiacName.textContent = ageData.zodiac.name;
        this.zodiacDates.textContent = ageData.zodiac.dates;
        this.zodiacDescription.textContent = ageData.zodiac.description;
        
        // Add animation class
        this.resultsSection.classList.add('live-update');
        setTimeout(() => {
            this.resultsSection.classList.remove('live-update');
        }, 300);
    }
    
    formatNumber(num) {
        return num.toLocaleString();
    }
    
    startLiveUpdates() {
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Only start live updates if calculating to current time
        if (!this.calculateToDateInput.value || 
            this.calculateToDateInput.value === new Date().toISOString().split('T')[0]) {
            
            this.updateInterval = setInterval(() => {
                this.targetDate = new Date();
                const ageData = this.computeAge();
                this.displayResults(ageData);
            }, 1000);
        }
    }
    
    clearAll() {
        // Clear inputs
        this.birthDateInput.value = '';
        this.birthTimeInput.value = '';
        this.calculateToDateInput.value = new Date().toISOString().split('T')[0];
        
        // Hide results
        this.resultsSection.style.display = 'none';
        
        // Clear live updates
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Clear errors
        this.clearErrors();
        
        this.showNotification('Calculator cleared!', 'info');
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

// Initialize the age calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ageCalculator = new AgeCalculator();
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
