
// نظام تحويل العملات التلقائي
const coursePrice = 99; // السعر الأساسي بالريال السعودي

const exchangeRates = {
    SAR: { rate: 1, symbol: 'ريال سعودي', country: 'السعودية' },
    EGP: { rate: 8.08, symbol: 'جنيه مصري', country: 'مصر' },
    AED: { rate: 0.98, symbol: 'درهم إماراتي', country: 'الإمارات' },
    JOD: { rate: 0.19, symbol: 'دينار أردني', country: 'الأردن' },
    KWD: { rate: 0.081, symbol: 'دينار كويتي', country: 'الكويت' },
    USD: { rate: 0.27, symbol: 'دولار أمريكي', country: 'الولايات المتحدة' },
    EUR: { rate: 0.25, symbol: 'يورو', country: 'أوروبا' },
    QAR: { rate: 0.97, symbol: 'ريال قطري', country: 'قطر' },
    OMR: { rate: 0.1, symbol: 'ريال عماني', country: 'عُمان' },
    BHD: { rate: 0.1, symbol: 'دينار بحريني', country: 'البحرين' }
};

const countryToCurrency = {
    'SA': 'SAR', 'EG': 'EGP', 'AE': 'AED', 'JO': 'JOD', 
    'KW': 'KWD', 'US': 'USD', 'QA': 'QAR', 'OM': 'OMR',
    'BH': 'BHD', 'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 
    'ES': 'EUR', 'NL': 'EUR'
};

let userCurrency = 'SAR';
let userCountry = 'SA';

// اكتشاف موقع المستخدم وتحديد العملة
async function detectUserLocation() {
    try {
        // محاولة استخدام Geolocation API أولاً
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
                    const data = await response.json();
                    userCountry = data.countryCode;
                    updateCurrency();
                } catch (error) {
                    // في حالة فشل الطلب، استخدم IP detection
                    detectByIP();
                }
            }, (error) => {
                // في حالة رفض المستخدم للموقع، استخدم IP detection
                detectByIP();
            });
        } else {
            detectByIP();
        }
    } catch (error) {
        console.log('استخدام العملة الافتراضية');
        updateCurrency();
    }
}

// اكتشاف الموقع عبر IP
async function detectByIP() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        userCountry = data.country_code;
        updateCurrency();
    } catch (error) {
        console.log('استخدام العملة الافتراضية');
        updateCurrency();
    }
}

// تحديث العملة بناءً على البلد
function updateCurrency() {
    userCurrency = countryToCurrency[userCountry] || 'SAR';
    updatePriceDisplay();
}

// تحديث عرض الأسعار
function updatePriceDisplay() {
    const currencyInfo = exchangeRates[userCurrency];
    const newPrice = Math.round(coursePrice * currencyInfo.rate);
    const oldPrice = Math.round(199 * currencyInfo.rate);
    
    // تحديث عنصر العملة الحالية
    const currentCurrencyElement = document.getElementById('currentCurrency');
    if (currentCurrencyElement) {
        currentCurrencyElement.textContent = `${newPrice} ${currencyInfo.symbol}`;
    }
    
    // تحديث جميع الأسعار في البطاقات
    const newPriceElements = document.querySelectorAll('.currency-new');
    const oldPriceElements = document.querySelectorAll('.currency-old');
    
    newPriceElements.forEach(element => {
        element.textContent = `${newPrice} ${currencyInfo.symbol}`;
    });
    
    oldPriceElements.forEach(element => {
        element.textContent = `${oldPrice} ${currencyInfo.symbol}`;
    });
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize currency detection
    detectUserLocation();

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // FAQ functionality with smooth animations
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answer.classList.add('active');
            }
        });
    });

    // Scroll animations
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

    // Apply scroll animations to cards
    const cards = document.querySelectorAll('.language-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Apply scroll animations to stats
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });

    // Counter animation for stats
    const animateCounter = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + (element.textContent.includes('K') ? 'K+' : 
                                              element.textContent.includes('%') ? '%' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start) + (element.textContent.includes('K') ? 'K+' : 
                                                          element.textContent.includes('%') ? '%' : '');
            }
        }, 16);
    };

    // Trigger counter animations when stats section is visible
    const statsSection = document.querySelector('.stats-section');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    let target = parseInt(text);
                    
                    if (text.includes('K')) target = target * 1000;
                    if (text === '24/7') {
                        stat.textContent = '24/7';
                        return;
                    }
                    
                    animateCounter(stat, target);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
});

// Modal functions with enhanced animations
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        
        // Animate modal appearance
        requestAnimationFrame(() => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '1';
        });
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
            // Restore body scroll
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Close modal when clicking outside or pressing ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="flex"]');
        if (openModal) {
            const modalId = openModal.getAttribute('id');
            closeModal(modalId);
        }
    }
});

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        const modalId = event.target.getAttribute('id');
        closeModal(modalId);
    }
}

// Professional loading animation
window.addEventListener('load', () => {
    const loadingScreen = document.createElement('div');
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    `;
    
    const logoLoader = document.createElement('div');
    logoLoader.style.cssText = `
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 900;
        color: #B8860B;
        animation: pulse 1.5s ease-in-out infinite;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    logoLoader.textContent = 'S';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
    
    loadingScreen.appendChild(logoLoader);
    document.body.appendChild(loadingScreen);
    
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(loadingScreen)) {
                document.body.removeChild(loadingScreen);
            }
        }, 500);
    }, 1500);
});

// Add subtle animations to enhance user experience
function addProfessionalEffects() {
    // Add hover effects to cards
    const languageCards = document.querySelectorAll('.language-card');
    languageCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
}

// Initialize professional effects after DOM is loaded
document.addEventListener('DOMContentLoaded', addProfessionalEffects);
