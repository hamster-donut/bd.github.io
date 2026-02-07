// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    initMobileOptimizations();
});

function initializeWebsite() {
    initConfetti();
    initSmoothScroll();
    initAOS();
    initGuestBook();
    initBalloonAnimation();
    updateMessageCount();
}

// ===== MOBILE OPTIMIZATIONS =====
function initMobileOptimizations() {
    // Detect if user is on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Reduce confetti on mobile for better performance
        reduceConfettiForMobile();
        
        // Add touch feedback
        addTouchFeedback();
        
        // Prevent iOS bounce scroll on body
        preventIOSBounce();
        
        // Handle iOS viewport height issues
        fixIOSViewportHeight();
    }
    
    if (isIOS) {
        // Fix iOS Safari bottom bar
        handleIOSSafariBar();
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Optimize scroll performance on mobile
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(handleScroll);
    }, { passive: true });
}

function reduceConfettiForMobile() {
    const canvas = document.getElementById('confetti-canvas');
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Store original confetti count and reduce it
        window.mobileConfettiMode = true;
    }
}

function addTouchFeedback() {
    const buttons = document.querySelectorAll('button, .reveal-btn, .like-btn, .submit-btn');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        }, { passive: true });
    });
}

function preventIOSBounce() {
    let startY = 0;
    
    document.body.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    }, { passive: true });
    
    document.body.addEventListener('touchmove', function(e) {
        const scrollable = e.target.closest('.messages-display, .modal-content');
        
        if (!scrollable) {
            const y = e.touches[0].pageY;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const isAtTop = scrollTop <= 0 && y > startY;
            const isAtBottom = (window.innerHeight + scrollTop >= document.body.scrollHeight) && y < startY;
            
            if (isAtTop || isAtBottom) {
                e.preventDefault();
            }
        }
    }, { passive: false });
}

function fixIOSViewportHeight() {
    // Fix for iOS viewport height issues
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
}

function handleIOSSafariBar() {
    // Handle iOS Safari address bar showing/hiding
    let lastHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        
        if (Math.abs(currentHeight - lastHeight) > 100) {
            // Significant height change, likely address bar
            document.documentElement.style.setProperty('--actual-vh', `${currentHeight}px`);
        }
        
        lastHeight = currentHeight;
    });
}

function handleOrientationChange() {
    // Wait for orientation change to complete
    setTimeout(() => {
        fixIOSViewportHeight();
        
        // Recalculate confetti canvas size
        const canvas = document.getElementById('confetti-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }, 300);
}

function handleScroll() {
    // Optimized scroll handler for mobile
    const currentScroll = window.pageYOffset;
    const navbar = document.querySelector('.navbar');
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
}

// ===== CONFETTI ANIMATION =====
function initConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiPieces = [];
    // Reduce confetti count on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const confettiCount = isMobile ? 50 : 100;
    const colors = ['#FF6B9D', '#9B6BFF', '#4ECDC4', '#FFD93D', '#FF9A56'];
    
    class ConfettiPiece {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -10;
            this.size = Math.random() * 8 + 4;
            this.speed = Math.random() * 3 + 2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.shape = Math.random() > 0.5 ? 'square' : 'circle';
            this.wobble = Math.random() * 2 - 1;
        }
        
        update() {
            this.y += this.speed;
            this.x += this.wobble;
            this.rotation += this.rotationSpeed;
            
            if (this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            
            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            
            ctx.restore();
        }
    }
    
    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
        confettiPieces.push(new ConfettiPiece());
    }
    
    // Animation loop with throttling for mobile
    let lastTime = 0;
    const fps = isMobile ? 30 : 60;
    const interval = 1000 / fps;
    
    function animateConfetti(currentTime) {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime >= interval) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            confettiPieces.forEach(piece => {
                piece.update();
                piece.draw();
            });
            
            lastTime = currentTime - (deltaTime % interval);
        }
        
        requestAnimationFrame(animateConfetti);
    }
    
    animateConfetti(0);
    
    // Resize handler with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }, 250);
    });
    
    // Burst confetti on certain events
    setTimeout(() => {
        burstConfetti();
    }, 500);
}

function burstConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    const colors = ['#FF6B9D', '#9B6BFF', '#4ECDC4', '#FFD93D', '#FF9A56'];
    const particles = [];
    
    // Reduce particles on mobile
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            life: 100
        });
    }
    
    function animate() {
        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5; // gravity
            p.life--;
            
            ctx.globalAlpha = p.life / 100;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            
            if (p.life <= 0) {
                particles.splice(index, 1);
            }
        });
        
        if (particles.length > 0) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== SCROLL ANIMATIONS (AOS) =====
function initAOS() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => observer.observe(el));
}

// ===== BALLOON ANIMATION =====
function initBalloonAnimation() {
    const balloons = document.querySelectorAll('.balloon');
    
    balloons.forEach(balloon => {
        const randomDelay = Math.random() * 3;
        const randomDuration = 6 + Math.random() * 3;
        balloon.style.animationDelay = `${randomDelay}s`;
        balloon.style.animationDuration = `${randomDuration}s`;
    });
}

// ===== TIME CAPSULE REVEAL =====
function revealSecret(secretNumber) {
    const secretContent = document.getElementById(`secret-${secretNumber}`);
    const button = event.target;
    
    if (secretContent.classList.contains('revealed')) {
        secretContent.classList.remove('revealed');
        button.textContent = 'Reveal Memory';
    } else {
        secretContent.classList.add('revealed');
        button.textContent = 'Hide Memory';
        
        // Add sparkle effect
        createSparkles(button);
    }
}

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const sparkleCount = 10;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = rect.left + rect.width / 2 + 'px';
        sparkle.style.top = rect.top + rect.height / 2 + 'px';
        sparkle.style.width = '5px';
        sparkle.style.height = '5px';
        sparkle.style.background = '#FFD93D';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        document.body.appendChild(sparkle);
        
        const angle = (Math.PI * 2 * i) / sparkleCount;
        const velocity = 50 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = rect.left + rect.width / 2;
        let y = rect.top + rect.height / 2;
        let opacity = 1;
        
        function animate() {
            x += vx * 0.02;
            y += vy * 0.02;
            opacity -= 0.02;
            
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                sparkle.remove();
            }
        }
        
        animate();
    }
}

// ===== VIDEO MODAL =====
function playVideo() {
    const modal = document.getElementById('video-modal');
    modal.classList.add('active');
    burstConfetti();
}

function closeVideo() {
    const modal = document.getElementById('video-modal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('video-modal');
    if (event.target === modal) {
        closeVideo();
    }
});

// ===== GUEST BOOK FUNCTIONALITY =====
function initGuestBook() {
    const form = document.getElementById('message-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('guest-name').value;
        const message = document.getElementById('guest-message').value;
        const color = document.getElementById('message-color').value;
        
        if (name && message) {
            addMessage(name, message, color);
            form.reset();
            
            // Success animation
            showSuccessMessage();
            burstConfetti();
        }
    });
}

function addMessage(name, message, color) {
    const messagesContainer = document.getElementById('messages-container');
    
    const messageCard = document.createElement('div');
    messageCard.className = `message-card ${color}-card`;
    messageCard.setAttribute('data-aos', 'fade-up');
    
    messageCard.innerHTML = `
        <div class="message-header">
            <strong>${escapeHtml(name)}</strong>
            <span class="message-time">Just now</span>
        </div>
        <p class="message-text">${escapeHtml(message)}</p>
        <div class="message-footer">
            <button class="like-btn" onclick="likeMessage(this)">❤️ <span>0</span></button>
        </div>
    `;
    
    messagesContainer.insertBefore(messageCard, messagesContainer.firstChild);
    
    // Trigger animation
    setTimeout(() => {
        messageCard.classList.add('aos-animate');
    }, 10);
    
    updateMessageCount();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function likeMessage(button) {
    const likeCount = button.querySelector('span');
    let count = parseInt(likeCount.textContent);
    
    if (button.classList.contains('liked')) {
        count--;
        button.classList.remove('liked');
    } else {
        count++;
        button.classList.add('liked');
        createHearts(button);
    }
    
    likeCount.textContent = count;
}

function createHearts(button) {
    const rect = button.getBoundingClientRect();
    
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = rect.left + rect.width / 2 + 'px';
        heart.style.top = rect.top + 'px';
        heart.style.fontSize = '20px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        document.body.appendChild(heart);
        
        const randomX = (Math.random() - 0.5) * 100;
        const randomRotate = (Math.random() - 0.5) * 180;
        
        let y = 0;
        let opacity = 1;
        
        function animate() {
            y -= 2;
            opacity -= 0.02;
            
            heart.style.transform = `translate(${randomX}px, ${y}px) rotate(${randomRotate}deg)`;
            heart.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                heart.remove();
            }
        }
        
        setTimeout(() => animate(), i * 100);
    }
}

function updateMessageCount() {
    const messageCount = document.getElementById('message-count');
    const messages = document.querySelectorAll('.message-card');
    messageCount.textContent = `(${messages.length})`;
}

function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.style.position = 'fixed';
    successMessage.style.top = '20px';
    successMessage.style.right = '20px';
    successMessage.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    successMessage.style.color = 'white';
    successMessage.style.padding = '20px 30px';
    successMessage.style.borderRadius = '15px';
    successMessage.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
    successMessage.style.zIndex = '10001';
    successMessage.style.fontSize = '1.1rem';
    successMessage.style.fontWeight = '600';
    successMessage.textContent = '✨ Message sent successfully!';
    successMessage.style.animation = 'slideDown 0.5s ease';
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => successMessage.remove(), 500);
    }, 3000);
}

// ===== AGE COUNTER ANIMATION =====
function animateAgeCounter() {
    const ageDisplay = document.getElementById('age-display');
    const targetAge = 25; // Change this to the actual age
    let currentAge = 0;
    const duration = 2000; // 2 seconds
    const increment = targetAge / (duration / 16); // 60fps
    
    function updateAge() {
        currentAge += increment;
        if (currentAge >= targetAge) {
            ageDisplay.textContent = targetAge;
            return;
        }
        ageDisplay.textContent = Math.floor(currentAge);
        requestAnimationFrame(updateAge);
    }
    
    updateAge();
}

// Start age counter animation when hero section is visible
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateAgeCounter();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    heroObserver.observe(heroSection);
}

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===== EASTER EGG: Secret Birthday Surprise =====
let clickCount = 0;
const heroTitle = document.querySelector('.hero-section h1');

if (heroTitle) {
    heroTitle.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount === 5) {
            launchMegaConfetti();
            playBirthdaySong();
            clickCount = 0;
        }
    });
}

function launchMegaConfetti() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            burstConfetti();
        }, i * 200);
    }
}

function playBirthdaySong() {
    // This would play a birthday song if you add an audio file
    const celebrationMessage = document.createElement('div');
    celebrationMessage.style.position = 'fixed';
    celebrationMessage.style.top = '50%';
    celebrationMessage.style.left = '50%';
    celebrationMessage.style.transform = 'translate(-50%, -50%)';
    celebrationMessage.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    celebrationMessage.style.color = 'white';
    celebrationMessage.style.padding = '40px 60px';
    celebrationMessage.style.borderRadius = '20px';
    celebrationMessage.style.fontSize = '3rem';
    celebrationMessage.style.fontWeight = '900';
    celebrationMessage.style.zIndex = '10002';
    celebrationMessage.style.textAlign = 'center';
    celebrationMessage.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
    celebrationMessage.innerHTML = '🎉🎂🎊<br>SURPRISE!<br>🎈🎁🎉';
    
    document.body.appendChild(celebrationMessage);
    
    celebrationMessage.style.animation = 'scaleIn 0.5s ease';
    
    setTimeout(() => {
        celebrationMessage.style.animation = 'scaleIn 0.5s ease reverse';
        setTimeout(() => celebrationMessage.remove(), 500);
    }, 3000);
}

// ===== PARALLAX EFFECT =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== TYPING EFFECT FOR SUBTITLE =====
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect
const subtitle = document.querySelector('.subtitle');
if (subtitle) {
    const originalText = subtitle.textContent;
    setTimeout(() => {
        typeWriter(subtitle, originalText, 30);
    }, 1000);
}

// ===== CONSOLE EASTER EGG =====
console.log('%c🎉 Happy Birthday! 🎉', 'font-size: 50px; color: #FF6B9D; font-weight: bold;');
console.log('%cYou found the secret console message! 🎂', 'font-size: 20px; color: #9B6BFF;');
console.log('%cHere\'s to another amazing year of friendship! 🎈', 'font-size: 16px; color: #4ECDC4;');

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Press 'C' for confetti
    if (e.key === 'c' || e.key === 'C') {
        burstConfetti();
    }
    
    // Press 'H' to scroll to top
    if (e.key === 'h' || e.key === 'H') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ===== RANDOM COLOR GENERATOR FOR DYNAMIC ELEMENTS =====
function getRandomColor() {
    const colors = ['#FF6B9D', '#9B6BFF', '#4ECDC4', '#FFD93D', '#FF9A56'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ===== LOAD CELEBRATION =====
window.addEventListener('load', () => {
    setTimeout(() => {
        burstConfetti();
    }, 1000);
});

// Make functions globally accessible
window.revealSecret = revealSecret;
window.playVideo = playVideo;
window.closeVideo = closeVideo;
window.likeMessage = likeMessage;