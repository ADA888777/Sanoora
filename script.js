
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
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

// Add loading animation
window.addEventListener('load', () => {
  const loadingScreen = document.createElement('div');
  loadingScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    transition: opacity 0.5s ease;
  `;
  
  const loader = document.createElement('div');
  loader.style.cssText = `
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  loadingScreen.appendChild(loader);
  document.body.appendChild(loadingScreen);
  
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(loadingScreen);
    }, 500);
  }, 1000);
});

// Add particle effects to hero section
function createParticles() {
  const heroSection = document.querySelector('.hero-section');
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(255,255,255,0.5);
      border-radius: 50%;
      pointer-events: none;
      animation: float ${Math.random() * 10 + 10}s linear infinite;
    `;
    
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    
    heroSection.appendChild(particle);
  }
}

// Initialize particles after DOM load
document.addEventListener('DOMContentLoaded', createParticles);
