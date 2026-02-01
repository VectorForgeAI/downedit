// down.edit Landing Page Script

// GitHub API config
const GITHUB_REPO = 'VectorForgeAI/downedit';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

// Detect user's platform
function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for mobile devices first
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  
  // Desktop platforms
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  return 'windows'; // default
}

// Check if mobile device
function isMobile() {
  const platform = detectPlatform();
  return platform === 'ios' || platform === 'android';
}

// Update platform-specific elements
function updatePlatformUI(platform) {
  const platformNames = {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    ios: 'iPhone/iPad',
    android: 'Android'
  };
  
  const platformName = document.getElementById('platform-name');
  const primaryBtn = document.getElementById('download-primary');
  const btnIcon = primaryBtn?.querySelector('.btn-icon');
  
  if (platformName) {
    platformName.textContent = platformNames[platform];
  }
  
  // For mobile users, update the primary button to link to PWA
  if (platform === 'ios' || platform === 'android') {
    if (primaryBtn) {
      primaryBtn.href = 'pwa/';
      if (btnIcon) {
        btnIcon.textContent = '→';
      }
      // Change button text
      const textSpan = primaryBtn.querySelector('span:last-child');
      if (textSpan) {
        textSpan.innerHTML = 'Open Web App';
      }
    }
    
    // Highlight the PWA download card
    const pwaCard = document.getElementById('download-pwa');
    if (pwaCard) {
      pwaCard.classList.add('highlighted');
    }
  }
}

// Fetch latest release from GitHub
async function fetchLatestRelease() {
  try {
    const response = await fetch(GITHUB_API);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const release = await response.json();
    const version = release.tag_name.replace('v', '');
    
    // Update version display
    const versionEl = document.getElementById('version');
    if (versionEl) {
      versionEl.textContent = version;
    }
    
    // Find download URLs for each platform
    const assets = release.assets || [];
    
    const windowsAsset = assets.find(a => a.name.toLowerCase().includes('windows'));
    const macosAsset = assets.find(a => a.name.toLowerCase().includes('macos') || a.name.toLowerCase().includes('darwin'));
    const linuxAsset = assets.find(a => a.name.toLowerCase().includes('linux'));
    
    // Update download links
    if (windowsAsset) {
      const winLink = document.getElementById('download-windows');
      if (winLink) winLink.href = windowsAsset.browser_download_url;
    }
    
    if (macosAsset) {
      const macLink = document.getElementById('download-macos');
      if (macLink) macLink.href = macosAsset.browser_download_url;
    }
    
    if (linuxAsset) {
      const linuxLink = document.getElementById('download-linux');
      if (linuxLink) linuxLink.href = linuxAsset.browser_download_url;
    }
    
    // Update primary download button based on platform
    const platform = detectPlatform();
    const primaryBtn = document.getElementById('download-primary');
    
    if (primaryBtn) {
      if (platform === 'windows' && windowsAsset) {
        primaryBtn.href = windowsAsset.browser_download_url;
      } else if (platform === 'macos' && macosAsset) {
        primaryBtn.href = macosAsset.browser_download_url;
      } else if (platform === 'linux' && linuxAsset) {
        primaryBtn.href = linuxAsset.browser_download_url;
      } else {
        // Fallback to releases page
        primaryBtn.href = `https://github.com/${GITHUB_REPO}/releases/latest`;
      }
    }
    
  } catch (error) {
    console.log('Could not fetch release info:', error);
    // Fallback: link to releases page
    const links = ['download-primary', 'download-windows', 'download-macos', 'download-linux'];
    links.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = `https://github.com/${GITHUB_REPO}/releases/latest`;
    });
  }
}

// Scroll animations with Intersection Observer
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay for grid items
        const delay = entry.target.dataset.delay || index * 100;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all animated elements
  document.querySelectorAll('[data-animate]').forEach((el, index) => {
    el.dataset.delay = index * 80;
    observer.observe(el);
  });
}

// Nav scroll effect
function initNavScroll() {
  const nav = document.querySelector('.nav');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Typing animation for code preview (subtle)
function initTypingEffect() {
  const codeLines = document.querySelectorAll('.code-line');
  
  codeLines.forEach((line, index) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-10px)';
    
    setTimeout(() => {
      line.style.transition = 'all 0.4s ease';
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, 500 + (index * 100));
  });
}

// Add floating animation to glow
function initGlowAnimation() {
  const glow = document.querySelector('.glow');
  if (!glow) return;
  
  let angle = 0;
  
  function animate() {
    angle += 0.01;
    const x = Math.sin(angle) * 20;
    const scale = 1 + Math.sin(angle * 0.5) * 0.1;
    
    glow.style.transform = `translateX(calc(-50% + ${x}px)) scale(${scale})`;
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Parallax effect on hero
function initParallax() {
  const hero = document.querySelector('.hero-image');
  if (!hero) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const rate = scrolled * 0.3;
    
    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${rate}px)`;
    }
  });
}

// Mouse follow effect on feature cards
function initCardHover() {
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  const platform = detectPlatform();
  updatePlatformUI(platform);
  fetchLatestRelease();
  initScrollAnimations();
  initNavScroll();
  initSmoothScroll();
  initTypingEffect();
  initGlowAnimation();
  initParallax();
  initCardHover();
});
