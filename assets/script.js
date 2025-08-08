// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initSmoothScrolling();
    initHeaderScroll();
    initCurrentYear();
    initToolCardAnimations();
    initActiveNavigation();
});

// Mobile Menu Functionality
function initMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');

    // Show menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show-menu');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }

    // Hide menu
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    }

    // Hide menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
            document.body.style.overflow = 'auto';
        });
    });

    // Hide menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('show-menu');
            document.body.style.overflow = 'auto';
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
            navMenu.classList.remove('show-menu');
            document.body.style.overflow = 'auto';
        }
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Header Scroll Effect
function initHeaderScroll() {
    const header = document.getElementById('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = 'none';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Set Current Year in Footer
function initCurrentYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

// Tool Card Animations on Scroll
function initToolCardAnimations() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    toolCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Active Navigation Highlighting
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
}

// Tool Card Click Handlers
function initToolCardHandlers() {
    const toolButtons = document.querySelectorAll('.tool-card__btn');

    toolButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const toolNames = ['image-converter', 'background-remover', 'age-calculator', 'html-to-text'];
            const toolPages = ['image-converter.html', 'background-remover.html', 'age-calculator.html', null];
            const toolName = toolNames[index];
            const toolPage = toolPages[index];

            // Navigate to tool page if available, otherwise show coming soon
            if (toolPage) {
                window.location.href = toolPage;
            } else {
                showToolComingSoon(toolName);
            }
        });
    });
}

// Show "Coming Soon" message for tools
function showToolComingSoon(toolName) {
    const toolTitles = {
        'image-converter': 'Image Converter',
        'image-compressor': 'Image Compressor',
        'age-calculator': 'Age Calculator',
        'html-to-text': 'HTML to Text Converter'
    };
    
    const title = toolTitles[toolName] || 'Tool';
    
    // Create a simple modal-like notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    notification.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #3b82f6;">${title}</h3>
        <p style="margin-bottom: 1.5rem; color: #64748b;">This tool is coming soon! We're working hard to bring you the best experience.</p>
        <button onclick="this.parentElement.remove(); document.body.style.overflow = 'auto';" 
                style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
            Got it!
        </button>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;
    
    backdrop.addEventListener('click', () => {
        notification.remove();
        backdrop.remove();
        document.body.style.overflow = 'auto';
    });
    
    document.body.appendChild(backdrop);
    document.body.appendChild(notification);
    document.body.style.overflow = 'hidden';
}

// Initialize tool card handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initToolCardHandlers();
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll-heavy functions
window.addEventListener('scroll', debounce(() => {
    // Any additional scroll-based functionality can be added here
}, 10));

// Accessibility: Focus management for mobile menu
function manageFocus() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    
    // When menu opens, focus on close button
    navToggle.addEventListener('click', () => {
        setTimeout(() => {
            if (navClose) navClose.focus();
        }, 100);
    });
    
    // When menu closes, focus back on toggle button
    navClose.addEventListener('click', () => {
        navToggle.focus();
    });
}

// Initialize focus management
document.addEventListener('DOMContentLoaded', manageFocus);

// Error handling for missing elements
function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
}

// Console welcome message
console.log('%c🛠️ Welcome to MultiTools Hub!', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with modern web technologies for the best user experience.', 'color: #64748b; font-size: 14px;');
