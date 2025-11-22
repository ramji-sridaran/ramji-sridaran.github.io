// ==========================================
// NAVIGATION & HAMBURGER MENU
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// ==========================================
// SMOOTH SCROLLING & ACTIVE NAV HIGHLIGHT
// ==========================================
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ==========================================
// CONTACT FORM HANDLING - FORMSPREE
// ==========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const originalBg = submitBtn.style.background;

        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success
                showNotification('✅ Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
                submitBtn.textContent = '✓ Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #10B981, #06B6D4)';

                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = originalBg;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }, 3000);
            } else {
                // Error from server
                showNotification('⚠️ Something went wrong. Please try again.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('⚠️ Failed to send message. Please try again.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        fontSize: '1rem',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease-in-out',
        maxWidth: '400px'
    });

    if (type === 'success') {
        notification.style.background = '#00B894';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.background = '#FF7675';
        notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all cards and content sections
document.querySelectorAll('.project-card, .skill-category, .stat-card, .timeline-item').forEach(el => {
    observer.observe(el);
});

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #6C5CE7, #A29BFE);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
`;

document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

scrollTopBtn.addEventListener('mouseenter', () => {
    scrollTopBtn.style.transform = 'translateY(-5px)';
});

scrollTopBtn.addEventListener('mouseleave', () => {
    scrollTopBtn.style.transform = 'translateY(0)';
});

// ==========================================
// ANIMATIONS ON PAGE LOAD
// ==========================================
window.addEventListener('load', () => {
    // Fade in hero content
    const heroText = document.querySelector('.hero-text');
    const heroImage = document.querySelector('.hero-image');

    if (heroText) {
        heroText.style.opacity = '0';
        heroText.style.transform = 'translateY(30px)';
        setTimeout(() => {
            heroText.style.transition = 'all 0.8s ease';
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0)';
        }, 100);
    }

    if (heroImage) {
        heroImage.style.opacity = '0';
        heroImage.style.transform = 'translateY(30px)';
        setTimeout(() => {
            heroImage.style.transition = 'all 0.8s ease 0.2s';
            heroImage.style.opacity = '1';
            heroImage.style.transform = 'translateY(0)';
        }, 100);
    }
});

// ==========================================
// KEYBOARD NAVIGATION
// ==========================================
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// ==========================================
// PARALLAX EFFECT
// ==========================================
const heroSection = document.querySelector('.hero');

if (heroSection) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < heroSection.offsetHeight) {
            heroSection.style.backgroundPosition = `0 ${scrollY * 0.5}px`;
        }
    });
}

// ==========================================
// THEME & COMPACT MODE TOGGLE
// ==========================================
const themeToggle = document.getElementById('themeToggle');
const compactToggle = document.getElementById('compactToggle');
const themeStylesheet = document.getElementById('theme-stylesheet');

// Initialize theme and compact mode based on localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedCompact = localStorage.getItem('compactMode');
    // Default to compact mode (true) if not set
    const isCompact = savedCompact === null ? true : savedCompact === 'true';
    applyTheme(savedTheme, isCompact);
}

function applyTheme(theme, isCompact = false) {
    const isDark = theme === 'dark';
    let stylePath;

    if (isCompact) {
        stylePath = isDark ? 'css/styles-dark-compact.css' : 'css/styles-light-compact.css';
    } else {
        stylePath = isDark ? 'css/styles-dark.css' : 'css/styles-light.css';
    }

    themeStylesheet.href = stylePath;
    localStorage.setItem('theme', theme);
    localStorage.setItem('compactMode', isCompact);

    // Update theme toggle icon
    if (themeToggle) {
        themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
        themeToggle.title = isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    }

    // Update compact toggle state
    if (compactToggle) {
        if (isCompact) {
            compactToggle.classList.add('active');
            compactToggle.title = 'Switch to Regular Mode';
        } else {
            compactToggle.classList.remove('active');
            compactToggle.title = 'Switch to Compact Mode';
        }
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const isCompact = localStorage.getItem('compactMode') === 'true';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme, isCompact);
}

function toggleCompactMode() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const isCompact = localStorage.getItem('compactMode') === 'true';
    applyTheme(currentTheme, !isCompact);
}

// Initialize theme on page load
initializeTheme();

// Add click listeners
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

if (compactToggle) {
    compactToggle.addEventListener('click', toggleCompactMode);
}

// ==========================================
// PROJECT MODAL FUNCTIONALITY
// ==========================================
const projectData = {
    1: {
        title: 'E-Commerce Platform',
        description: 'A comprehensive full-stack e-commerce solution built with modern web technologies. Features real-time inventory management, secure payment processing, and an intuitive analytics dashboard for tracking sales and user behavior.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis', 'AWS'],
        features: [
            'Real-time inventory tracking and automatic stock alerts',
            'Secure payment processing with Stripe integration',
            'Advanced product search with filters and sorting',
            'Customer authentication and profile management',
            'Comprehensive admin dashboard with sales analytics',
            'Order tracking and email notifications',
            'Responsive design for mobile and desktop',
            'Cart persistence and saved items functionality'
        ],
        challenges: 'Implementing real-time inventory updates across multiple concurrent users required careful state management and optimistic UI updates. Solved by implementing WebSocket connections with fallback polling and leveraging Redis for caching frequently accessed product data.',
        liveLink: '#',
        githubLink: '#'
    },
    2: {
        title: 'Task Management App',
        description: 'A collaborative task management platform designed for teams to organize work efficiently. Built with real-time synchronization, allowing team members to see updates instantly without page refreshes.',
        technologies: ['React', 'Firebase', 'TypeScript', 'Material-UI', 'WebSockets'],
        features: [
            'Real-time collaboration with live updates',
            'Drag-and-drop task organization',
            'Team workspaces with role-based permissions',
            'Task assignments and due date reminders',
            'File attachments and comments on tasks',
            'Activity timeline and audit logs',
            'Custom task labels and priority levels',
            'Dark mode and customizable themes'
        ],
        challenges: 'Managing real-time sync conflicts when multiple users edit the same task simultaneously. Implemented operational transformation algorithms and conflict resolution strategies using Firebase\'s transaction system to ensure data consistency.',
        liveLink: '#',
        githubLink: '#'
    },
    3: {
        title: 'Analytics Dashboard',
        description: 'An advanced data visualization platform that transforms complex datasets into interactive, actionable insights. Features customizable reports, real-time data processing, and export capabilities for business intelligence.',
        technologies: ['React', 'D3.js', 'Python', 'PostgreSQL', 'FastAPI', 'Docker'],
        features: [
            'Interactive charts with D3.js visualizations',
            'Real-time data streaming and updates',
            'Customizable dashboard layouts',
            'Advanced filtering and data aggregation',
            'Export reports as PDF, CSV, or Excel',
            'Historical data comparison and trends',
            'Automated scheduled reports via email',
            'Role-based access control for data security'
        ],
        challenges: 'Rendering large datasets (100K+ records) without performance degradation. Implemented data virtualization, server-side pagination, and progressive data loading. Optimized SQL queries and added database indexing to reduce query times from 5s to under 200ms.',
        liveLink: '#',
        githubLink: '#'
    }
};

const modal = document.getElementById('projectModal');
const modalClose = document.querySelector('.modal-close');
const projectCards = document.querySelectorAll('.project-card');

// Open modal when project card is clicked
projectCards.forEach(card => {
    card.addEventListener('click', function(e) {
        e.preventDefault();
        const projectId = this.getAttribute('data-project');
        const project = projectData[projectId];

        if (project) {
            // Populate modal content
            document.getElementById('modalTitle').textContent = project.title;
            document.getElementById('modalDescription').textContent = project.description;

            // Technologies
            const techContainer = document.getElementById('modalTechnologies');
            techContainer.innerHTML = project.technologies.map(tech =>
                `<span>${tech}</span>`
            ).join('');

            // Features
            const featuresList = document.getElementById('modalFeatures');
            featuresList.innerHTML = project.features.map(feature =>
                `<li>${feature}</li>`
            ).join('');

            // Challenges
            document.getElementById('modalChallenges').textContent = project.challenges;

            // Links
            document.getElementById('modalLiveLink').href = project.liveLink;
            document.getElementById('modalGithubLink').href = project.githubLink;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    });
});

// Close modal when X is clicked
modalClose.addEventListener('click', closeModal);

// Close modal when clicking outside
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// ==========================================
// IMAGE & PAGE MODAL FUNCTIONALITY
// ==========================================
const imageModal = document.getElementById('imageModal');
const imageModalImg = document.getElementById('imageModalImg');
const pageModalFrame = document.getElementById('pageModalFrame');
const imageModalClose = document.querySelector('.image-modal-close');
const clickableImages = document.querySelectorAll('.project-image-clickable');

// Page names must match the diagram names in Resources/FlowCharts.html
// Page number to page index mapping (0-based for the embedded page attribute)
const pageIndexMap = {
    '0': '0',  // IoT
    '1': '1',  // Insurance - BigData migration
    '2': '2',  // Retail - Cloud Migration
    '3': '3'   // Databridge
};

// Open image/page modal when project image is clicked
clickableImages.forEach(imageContainer => {
    imageContainer.addEventListener('click', async function(e) {
        // Prevent project card modal from opening
        e.stopPropagation();

        let pageSrc = this.getAttribute('data-page');
        const pageNum = this.getAttribute('data-page-num') || '0'; // Default to page 0 if not specified
        const imageSrc = this.getAttribute('data-image');
        const imgElement = this.querySelector('img');

        if (pageSrc) {
            // Open page modal with iframe
            imageModalImg.style.display = 'none';
            pageModalFrame.style.display = 'block';

            // Remove any existing hash from pageSrc
            if (pageSrc.includes('#')) {
                pageSrc = pageSrc.split('#')[0];
            }

            try {
                // Fetch the HTML file
                const response = await fetch(pageSrc);
                let htmlContent = await response.text();

                // Get the desired page index from the map
                const pageIndex = pageIndexMap[pageNum] || pageIndexMap['0'];

                // Replace the page number in the data-mxgraph attribute
                // Pattern: "page":X where X is the current page number
                htmlContent = htmlContent.replace(
                    /"page":\d+/,
                    `"page":${pageIndex}`
                );

                // Create a blob and object URL for the modified HTML
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const blobUrl = URL.createObjectURL(blob);

                // Load the modified HTML in the iframe
                pageModalFrame.src = blobUrl;
            } catch (error) {
                console.error('Error loading page:', error);
                // Fallback: just load the page as-is
                pageModalFrame.src = pageSrc;
            }

            imageModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else if (imageSrc && imgElement) {
            // Open image modal
            pageModalFrame.style.display = 'none';
            imageModalImg.style.display = 'block';
            imageModalImg.src = imageSrc;
            imageModalImg.alt = imgElement.alt || 'Project Image';
            imageModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    });
});

// Close image/page modal when X is clicked
imageModalClose.addEventListener('click', closeImageModal);

// Close image/page modal when clicking outside
imageModal.addEventListener('click', function(e) {
    if (e.target === imageModal || e.target === imageModalClose) {
        closeImageModal();
    }
});

// Close image/page modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imageModal.classList.contains('active')) {
        closeImageModal();
    }
});

function closeImageModal() {
    imageModal.classList.remove('active');
    pageModalFrame.src = ''; // Clear iframe
    document.body.style.overflow = ''; // Restore scrolling
}

// ==========================================
// PROJECT TILE WATERMARKS (DYNAMIC SVG)
// ==========================================

const watermarkSVGs = [
  // 1. Four squares connected
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="30" height="30" rx="6" fill="#fff" fill-opacity="0.13"/>
    <rect x="70" y="10" width="30" height="30" rx="6" fill="#fff" fill-opacity="0.13"/>
    <rect x="70" y="70" width="30" height="30" rx="6" fill="#fff" fill-opacity="0.13"/>
    <rect x="10" y="70" width="30" height="30" rx="6" fill="#fff" fill-opacity="0.13"/>
    <path d="M40 25 L70 25" stroke="#fff" stroke-opacity="0.18" stroke-width="3"/>
    <path d="M25 40 L25 70" stroke="#fff" stroke-opacity="0.18" stroke-width="3"/>
    <path d="M40 85 L70 85" stroke="#fff" stroke-opacity="0.18" stroke-width="3"/>
    <path d="M85 40 L85 70" stroke="#fff" stroke-opacity="0.18" stroke-width="3"/>
    <circle cx="25" cy="25" r="4" fill="#fff" fill-opacity="0.18"/>
    <circle cx="85" cy="25" r="4" fill="#fff" fill-opacity="0.18"/>
    <circle cx="25" cy="85" r="4" fill="#fff" fill-opacity="0.18"/>
    <circle cx="85" cy="85" r="4" fill="#fff" fill-opacity="0.18"/>
  </svg>`,
  // 2. Flowing arrows and circles
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="18" fill="#fff" fill-opacity="0.10"/>
    <circle cx="85" cy="25" r="10" fill="#fff" fill-opacity="0.13"/>
    <circle cx="55" cy="85" r="15" fill="#fff" fill-opacity="0.10"/>
    <path d="M25 25 Q55 55 85 25" stroke="#fff" stroke-opacity="0.15" stroke-width="3" fill="none"/>
    <path d="M55 85 Q70 55 85 25" stroke="#fff" stroke-opacity="0.13" stroke-width="2" fill="none"/>
    <polygon points="80,30 90,25 80,20" fill="#fff" fill-opacity="0.18"/>
  </svg>`,
  // 3. Zigzag flow with dots
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="15,95 35,65 55,95 75,65 95,95" stroke="#fff" stroke-opacity="0.15" stroke-width="3" fill="none"/>
    <circle cx="15" cy="95" r="5" fill="#fff" fill-opacity="0.13"/>
    <circle cx="35" cy="65" r="5" fill="#fff" fill-opacity="0.13"/>
    <circle cx="55" cy="95" r="5" fill="#fff" fill-opacity="0.13"/>
    <circle cx="75" cy="65" r="5" fill="#fff" fill-opacity="0.13"/>
    <circle cx="95" cy="95" r="5" fill="#fff" fill-opacity="0.13"/>
  </svg>`,
  // 4. Central node with radiating lines
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="55" cy="55" r="18" fill="#fff" fill-opacity="0.10"/>
    <line x1="55" y1="55" x2="55" y2="10" stroke="#fff" stroke-opacity="0.15" stroke-width="3"/>
    <line x1="55" y1="55" x2="100" y2="55" stroke="#fff" stroke-opacity="0.15" stroke-width="3"/>
    <line x1="55" y1="55" x2="55" y2="100" stroke="#fff" stroke-opacity="0.15" stroke-width="3"/>
    <line x1="55" y1="55" x2="10" y2="55" stroke="#fff" stroke-opacity="0.15" stroke-width="3"/>
    <circle cx="55" cy="10" r="5" fill="#fff" fill-opacity="0.13"/>
    <circle cx="100" cy="55" r="5" fill="#fff" fill-opacity="0.13"/>
    <circle cx="55" cy="100" r="5" fill="#fff" fill-opacity="0.13"/>
    <circle cx="10" cy="55" r="5" fill="#fff" fill-opacity="0.13"/>
  </svg>`,
  // 5. Diagonal flow with arrows
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="20" height="20" rx="5" fill="#fff" fill-opacity="0.10"/>
    <rect x="75" y="75" width="20" height="20" rx="5" fill="#fff" fill-opacity="0.10"/>
    <path d="M35 35 L75 75" stroke="#fff" stroke-opacity="0.15" stroke-width="3"/>
    <polygon points="70,80 85,85 80,70" fill="#fff" fill-opacity="0.18"/>
  </svg>`,
  // 6. Concentric circles with connecting lines
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="55" cy="55" r="35" fill="#fff" fill-opacity="0.07"/>
    <circle cx="55" cy="55" r="20" fill="#fff" fill-opacity="0.10"/>
    <line x1="55" y1="20" x2="55" y2="90" stroke="#fff" stroke-opacity="0.13" stroke-width="2"/>
    <line x1="20" y1="55" x2="90" y2="55" stroke="#fff" stroke-opacity="0.13" stroke-width="2"/>
  </svg>`,
  // 7. L-shaped flow
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="25" height="25" rx="6" fill="#fff" fill-opacity="0.13"/>
    <rect x="15" y="70" width="25" height="25" rx="6" fill="#fff" fill-opacity="0.13"/>
    <rect x="70" y="70" width="25" height="25" rx="6" fill="#fff" fill-opacity="0.13"/>
    <path d="M27.5 40 L27.5 82.5 L82.5 82.5" stroke="#fff" stroke-opacity="0.15" stroke-width="3"/>
    <polygon points="77,87 87,82.5 77,78" fill="#fff" fill-opacity="0.18"/>
  </svg>`,
  // 8. Tree/branch flow
  `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="55" cy="20" r="10" fill="#fff" fill-opacity="0.13"/>
    <circle cx="35" cy="60" r="8" fill="#fff" fill-opacity="0.10"/>
    <circle cx="75" cy="60" r="8" fill="#fff" fill-opacity="0.10"/>
    <circle cx="55" cy="90" r="7" fill="#fff" fill-opacity="0.10"/>
    <path d="M55 30 L35 60" stroke="#fff" stroke-opacity="0.13" stroke-width="2.5"/>
    <path d="M55 30 L75 60" stroke="#fff" stroke-opacity="0.13" stroke-width="2.5"/>
    <path d="M35 68 L55 90 L75 68" stroke="#fff" stroke-opacity="0.13" stroke-width="2.5"/>
  </svg>`
];

window.addEventListener('DOMContentLoaded', () => {
  const watermarks = document.querySelectorAll('.project-watermark');
  // Shuffle SVGs for uniqueness per tile
  const shuffled = watermarkSVGs.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  watermarks.forEach((el, idx) => {
    el.innerHTML = shuffled[idx % shuffled.length];
  });
});

console.log('Portfolio loaded successfully! ✨');
