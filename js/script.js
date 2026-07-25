// ==========================================
// NAVIGATION & HAMBURGER MENU
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const EXPERIENCE_START_DATE = new Date(2013, 4, 1); // May 2013

function getDynamicExperienceYearsPlus(referenceDate = new Date()) {
    let years = referenceDate.getFullYear() - EXPERIENCE_START_DATE.getFullYear();
    const monthDelta = referenceDate.getMonth() - EXPERIENCE_START_DATE.getMonth();
    const dayDelta = referenceDate.getDate() - EXPERIENCE_START_DATE.getDate();
    if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) years -= 1;
    return `${Math.max(years, 0)}+`;
}

function applyDynamicExperienceYears() {
    const yearsPlus = getDynamicExperienceYearsPlus();
    const yearsPhrase = `${yearsPlus} years`;
    window.PORTFOLIO_EXPERIENCE_YEARS = yearsPlus;

    document.querySelectorAll('[data-exp-years]').forEach(el => {
        el.textContent = yearsPlus;
    });

    const replaceYears = text => text.replace(/__EXP_YEARS__|\d+\+\s+years/g, yearsPhrase);

    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[property="twitter:description"]').forEach(meta => {
        const current = meta.getAttribute('content');
        if (current) meta.setAttribute('content', replaceYears(current));
    });

    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd && jsonLd.textContent) {
        jsonLd.textContent = replaceYears(jsonLd.textContent);
    }
}

applyDynamicExperienceYears();

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
// HERO TYPING ANIMATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const typingTextElement = document.getElementById('typingText');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    // Roles to type
    const roles = [
        'Technical Lead',
        'Java Expert',
        'AWS Cloud Engineer',
        'Big Data Developer',
        'IoT Developer',
        'Agentic AI Enthusiast'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeRole() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingTextElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingTextElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            // Pause at end
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500;
        }

        setTimeout(typeRole, typingSpeed);
    }

    // Start typing after a short delay
    setTimeout(typeRole, 800);

    // Typing effect for hero-subtitle
    if (heroSubtitle) {
        // Store original HTML and extract text only
        const originalHTML = heroSubtitle.innerHTML.trim();

        // Parse the text with spans
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${originalHTML}</div>`, 'text/html');
        const container = doc.querySelector('div');

        // Extract all text nodes and their parent info
        const textSegments = [];

        function extractText(node, parentClass = null) {
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent;
                    if (text.trim()) {
                        textSegments.push({
                            text: text,
                            className: parentClass
                        });
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    extractText(child, child.className || parentClass);
                }
            });
        }

        extractText(container);

        // Clear and prepare for typing
        heroSubtitle.innerHTML = '';
        heroSubtitle.style.opacity = '1';

        let segmentIndex = 0;
        let charIndex = 0;
        let currentSpan = null;

        function typeSubtitle() {
            if (segmentIndex < textSegments.length) {
                const segment = textSegments[segmentIndex];

                if (charIndex === 0) {
                    // Start new segment
                    if (segment.className) {
                        currentSpan = document.createElement('span');
                        currentSpan.className = segment.className;
                        heroSubtitle.appendChild(currentSpan);
                    }
                }

                if (charIndex < segment.text.length) {
                    // Add next character
                    const char = segment.text.charAt(charIndex);
                    if (segment.className && currentSpan) {
                        currentSpan.textContent += char;
                    } else {
                        heroSubtitle.appendChild(document.createTextNode(char));
                    }
                    charIndex++;
                    setTimeout(typeSubtitle, 15);  // Reduced from 30ms to 15ms (2x faster)
                } else {
                    // Move to next segment
                    segmentIndex++;
                    charIndex = 0;
                    currentSpan = null;
                    setTimeout(typeSubtitle, 10);  // Reduced from 30ms to 10ms for smoother transitions
                }
            }
        }

        // Start hero-subtitle typing after role typing starts
        setTimeout(typeSubtitle, 1200);  // Reduced from 2500ms to 1200ms (starts sooner)
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
// VISITOR POPUP CAPTURE
// ==========================================
function setupVisitorCapturePopup() {
    const overlay = document.getElementById('visitorPopupOverlay');
    const form = document.getElementById('visitorCaptureForm');
    const closeBtn = document.getElementById('visitorPopupClose');
    const closeIconBtn = document.getElementById('visitorPopupCloseIcon');
    const submitBtn = document.getElementById('visitorPopupSubmit');
    const visitorTypeSelect = document.getElementById('visitorTypeSelect');
    const familyTreeNavItem = document.getElementById('familyTreeNavItem');
    const pageUrlInput = document.getElementById('visitorPageUrl');
    const visitedAtInput = document.getElementById('visitorVisitedAt');
    const userAgentInput = document.getElementById('visitorUserAgent');
    if (!overlay || !form || !closeBtn || !submitBtn || !visitorTypeSelect) return;

    const popupSeenKey = 'visitorPopup.seen';
    const popupSubmittedKey = 'visitorPopup.submitted';
    const visitorTypeKey = 'visitorPopup.visitorType';
    const pageviewKey = 'visitorMetrics.pageview.sent';
    const alreadySubmitted = localStorage.getItem(popupSubmittedKey) === 'true';
    const alreadySeenInSession = sessionStorage.getItem(popupSeenKey) === 'true';
    const savedVisitorType = localStorage.getItem(visitorTypeKey) || '';

    if (savedVisitorType) {
        visitorTypeSelect.value = savedVisitorType;
        updateFamilyTreeVisibility(savedVisitorType);
    } else {
        updateFamilyTreeVisibility('');
    }

    trackVisitorMetricOnce();

    if (!alreadySubmitted && !alreadySeenInSession) {
        window.setTimeout(() => {
            overlay.classList.add('show');
            overlay.setAttribute('aria-hidden', 'false');
            sessionStorage.setItem(popupSeenKey, 'true');
        }, 1800);
    }

    const closePopup = () => {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
    };

    closeBtn.addEventListener('click', closePopup);
    if (closeIconBtn) closeIconBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) closePopup();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && overlay.classList.contains('show')) {
            closePopup();
        }
    });

    visitorTypeSelect.addEventListener('change', () => {
        updateFamilyTreeVisibility(visitorTypeSelect.value);
        localStorage.setItem(visitorTypeKey, visitorTypeSelect.value);
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';

        const selectedVisitorType = visitorTypeSelect.value;
        localStorage.setItem(visitorTypeKey, selectedVisitorType);
        updateFamilyTreeVisibility(selectedVisitorType);

        if (pageUrlInput) pageUrlInput.value = window.location.href;
        if (visitedAtInput) visitedAtInput.value = new Date().toISOString();
        if (userAgentInput) userAgentInput.value = navigator.userAgent;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                localStorage.setItem(popupSubmittedKey, 'true');
                await sendVisitorMetric({
                    type: 'visitor',
                    visitorType: selectedVisitorType,
                    name: form.querySelector('[name="visitor_name"]')?.value || '',
                    reason: form.querySelector('[name="visitor_reason"]')?.value || '',
                    note: form.querySelector('[name="visitor_note"]')?.value || ''
                });
                showNotification('✅ Thanks! Your details were sent.', 'success');
                form.reset();
                if (savedVisitorType) visitorTypeSelect.value = savedVisitorType;
                closePopup();
            } else {
                showNotification('⚠️ Could not send details. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Visitor popup submission error:', error);
            showNotification('⚠️ Could not send details. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    function updateFamilyTreeVisibility(visitorType) {
        if (!familyTreeNavItem) return;
        familyTreeNavItem.hidden = visitorType !== 'family';
    }

    function getVisitorMetricsEndpoint() {
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('vercel.app')) return '/api/visitor';
        if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') return 'http://localhost:3000/api/visitor';
        return 'https://ramji-sridaran.vercel.app/api/visitor';
    }

    async function trackVisitorMetricOnce() {
        if (sessionStorage.getItem(pageviewKey) === 'true') return;
        sessionStorage.setItem(pageviewKey, 'true');
        await sendVisitorMetric({
            type: 'pageview',
            path: window.location.pathname,
            referrer: document.referrer || '',
            visitorType: visitorTypeSelect.value || localStorage.getItem(visitorTypeKey) || ''
        });
    }

    async function sendVisitorMetric(payload) {
        try {
            await fetch(getVisitorMetricsEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            });
        } catch (error) {
            console.warn('Visitor metric ping failed:', error);
        }
    }
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

document.addEventListener('DOMContentLoaded', setupVisitorCapturePopup);

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 30px;
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
const bwToggle = document.getElementById('bwToggle');
const themeStylesheet = document.getElementById('theme-stylesheet');

// Initialize theme and compact mode based on localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedCompact = localStorage.getItem('compactMode');
    const savedBW = localStorage.getItem('bwMode') === 'true';
    // Default to compact mode (true) if not set
    const isCompact = savedCompact === null ? true : savedCompact === 'true';
    applyTheme(savedTheme, isCompact, savedBW);
}

function applyTheme(theme, isCompact = false, isBW = false) {
    let stylePath;

    // Black & White mode overrides other themes (only in compact)
    if (isBW) {
        stylePath = 'css/styles-bw-compact.css';
    } else {
        const isDark = theme === 'dark';
        if (isCompact) {
            stylePath = isDark ? 'css/styles-dark-compact.css' : 'css/styles-light-compact.css';
        } else {
            stylePath = isDark ? 'css/styles-dark.css' : 'css/styles-light.css';
        }
    }

    themeStylesheet.href = stylePath;
    localStorage.setItem('theme', theme);
    localStorage.setItem('compactMode', isCompact);
    localStorage.setItem('bwMode', isBW);
    if (document.body) {
        document.body.dataset.theme = isBW ? 'bw' : theme;
    }

    // Update theme toggle icon
    if (themeToggle) {
        const isDark = theme === 'dark';
        themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
        themeToggle.title = isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme';
        themeToggle.style.opacity = isBW ? '0.5' : '1';
    }

    // Update compact toggle state
    if (compactToggle) {
        if (isCompact) {
            compactToggle.classList.add('active');
            compactToggle.title = 'Switch to Big screen Mode';
        } else {
            compactToggle.classList.remove('active');
            compactToggle.title = 'Switch to Compact Mode';
        }
        compactToggle.style.opacity = isBW ? '0.5' : '1';
    }

    // Update B&W toggle state
    if (bwToggle) {
        if (isBW) {
            bwToggle.classList.add('active');
            bwToggle.title = 'Switch to Color Mode';
        } else {
            bwToggle.classList.remove('active');
            bwToggle.title = 'Switch to Black & White Mode';
        }
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const isCompact = localStorage.getItem('compactMode') === 'true';
    const isBW = localStorage.getItem('bwMode') === 'true';
    if (!isBW) {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme, isCompact, false);
    }
}

function toggleCompactMode() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const isCompact = localStorage.getItem('compactMode') === 'true';
    const isBW = localStorage.getItem('bwMode') === 'true';
    if (!isBW) {
        applyTheme(currentTheme, !isCompact, false);
    }
}

function toggleBWMode() {
    const isBW = localStorage.getItem('bwMode') === 'true';

    if (isBW) {
        // Exiting B&W mode - default to light-compact theme
        applyTheme('dark', true, false);
    } else {
        // Entering B&W mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        const isCompact = localStorage.getItem('compactMode') === 'true';
        applyTheme(currentTheme, isCompact, true);
    }
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

if (bwToggle) {
    bwToggle.addEventListener('click', toggleBWMode);
}

// ==========================================
// PROJECT HIGHLIGHTING FROM EXPERIENCE LINKS
// ==========================================
function highlightProject(projectId) {
    // Remove any existing highlights
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.remove('highlight-project');
    });

    // Find and highlight the target project
    const targetProject = document.getElementById(projectId);
    if (targetProject) {
        // Scroll to the projects section first
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Add highlight after a short delay to ensure scrolling starts
        setTimeout(() => {
            targetProject.classList.add('highlight-project');

            // Scroll the project card into view within the scrollable container
            targetProject.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

            // Remove highlight after 3 seconds
            setTimeout(() => {
                targetProject.classList.remove('highlight-project');
            }, 3000);
        }, 500);
    }
}

// Add click listeners to experience links that point to projects
document.addEventListener('DOMContentLoaded', () => {
    const projectLinks = document.querySelectorAll('a[href^="#"][href$="bridge"], a[href^="#"][href$="mf2c"], a[href^="#"][href$="datamigration"], a[href^="#"][href$="chiller"], a[href^="#"][href$="concentrix"], a[href^="#"][href$="ai-chatbot"]');

    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = link.getAttribute('href').substring(1);
            highlightProject(projectId);
        });
    });
});

// ==========================================
// PROJECT MODAL FUNCTIONALITY
// ==========================================
const projectData = {
    1: {
        title: 'Remote Chiller Monitoring System',
        description: 'A real-time IoT analytics platform for monitoring chiller performance across distributed locations. The system processes high-frequency sensor data, delivers actionable insights, and enables significant improvements in energy efficiency and operational responsiveness.',
        technologies: ['Apache Spark', 'Scala', 'Apache Kafka', 'Mosquitto MQTT', 'Redis', 'HBase', 'PostgreSQL', 'Java Spring', 'REST APIs', 'AngularJS', 'HTML/CSS', 'Apache Tomcat', 'Git', 'Maven'],
        features: [
            'Real-time ingestion of sensor data from MQTT brokers into Kafka and Spark Streaming workflows',
            'Batch and streaming analytics using Scala–Spark for aggregations, anomaly detection, and performance trends',
            'RESTful APIs for data acquisition, reporting, and consumption by dashboards and analyst tools',
            'Customizable UI components for live monitoring and operational dashboards',
            'Downloadable analytical reports for engineers and data analysts',
            'Production support including multi-node cluster management and coordination with on-site engineering teams',
            'Continuous enhancements through requirement analysis, client walkthroughs, and iterative bug fixing'
        ],
        challenges: 'Building a reliable, low-latency streaming pipeline that could handle large volumes of high-frequency IoT sensor data across multiple distributed sites. Addressed by optimizing Spark Streaming jobs, decoupling MQTT–Kafka ingestion flows, implementing efficient Redis-based caching, and tuning HBase storage for fast reads and writes.',
        liveLink: '#',
        githubLink: '#'
    },
    2: {
        title: 'Insights – Dental (Big Data Migration & Search Platform Modernization)',
        description: 'A two-phase modernization program transforming legacy dental insurance systems into a scalable big-data ecosystem, followed by building a high-performance search and analytics platform on Apache Solr and HBase. The solution significantly improved data availability, search speed, and operational efficiency for customer support and analytics teams.',
        technologies: ['Apache Spark', 'Scala', 'Sqoop', 'HBase', 'Apache Solr', 'Lucene', 'Informatica', 'PostgreSQL/RDBMS', 'Shell Scripting', 'Java', 'Eclipse', 'Maven', 'Bitbucket', 'Bamboo'],
        features: [
            'Migration of large volumes of legacy data into a robust big-data environment using Sqoop, Spark, and Informatica CDC files',
            'End-to-end development of Spark–Scala pipelines for data transformation, table merging, and loading into HBase and Solr',
            'Automated data ingestion workflows through shell scripting for QA validation and recurring data refresh requirements',
            'Solr schema design and optimization enabling fast, accurate policy search for customer support applications',
            'Performance tuning including HFile-based bulk loading into HBase and optimized Sqoop split configurations',
            'Requirements analysis, design documentation, and continuous enhancements across multiple release cycles',
            'Coordination with onsite teams for change requests, solution walkthroughs, and multi-team alignment',
            'QA collaboration for defect analysis, test support, and quality-oriented release governance',
            'Production support including troubleshooting, cluster-level issue resolution, and risk/estimation reporting',
            'Preparation of release plans, cross-application integration reviews, and post-deployment validation'
        ],
        challenges: 'Delivering low-latency search over a constantly evolving insurance dataset required optimizing both ingestion and query layers. Key challenges included handling heterogeneous source data, ensuring reliable synchronization with RDBMS systems, and tuning HBase–Solr integration for bulk loads and high-throughput searches. These were addressed by re-architecting data flows, adopting HFile bulk-load strategies, refining Solr schemas, and automating ingestion pipelines for consistent, high-quality data availability.',
        liveLink: '#',
        githubLink: '#'
    },
    3: {
        title: 'MF2C – Financial Services Mainframe to Cloud Migration',
        description: 'A large-scale modernization initiative to migrate core financial-service workloads from legacy Mainframe systems to Azure and client-owned cloud platforms. The project implemented real-time data channels, Spring Boot microservices, automated testing suites, and cloud-native infrastructure to support day-to-day financial operations with improved reliability, scalability, and data quality.',
        technologies: ['Spring Boot', 'Java', 'Apache Kafka', 'Liquibase', 'Azure Cloud', 'Kubernetes', 'Maven', 'Splunk', 'Dynatrace', 'SonarQube', 'REST APIs'],
        features: [
            'Designed and implemented Kafka-based data channels integrated with Spring Boot services for generating daily financial data files',
            'Led requirement analysis and documentation efforts using Confluence, ensuring clear technical alignment across teams',
            'Designed database schemas and implemented version-controlled migrations using Liquibase',
            'Developed Spring Boot REST APIs, schedulers, and microservices supporting cloud data workflows',
            'Built utilities to validate data quality and compare outputs between Mainframe-generated files and cloud-generated equivalents',
            'Maintained high engineering standards with code coverage consistently above 80% per commit',
            'Developed automated test suites to ensure stability and correctness of deployed services',
            'Provisioned and managed cloud clusters across Azure and client-specific cloud environments',
            'Performed end-to-end data quality testing to ensure functional and regulatory compliance',
            'Conducted code reviews, walkthroughs, and sprint demos for stakeholders in an Agile delivery model'
        ],
        challenges: 'Migrating financial workloads from tightly coupled Mainframe systems to distributed cloud platforms required ensuring absolute data accuracy, consistent daily file generation, and seamless integration with existing downstream services. These challenges were addressed by building robust Kafka pipelines, enforcing strict version control with Liquibase, implementing comprehensive automated testing suites, and establishing strong observability through Splunk and Dynatrace.',
        liveLink: '#',
        githubLink: '#'
    },
    4: {
        title: 'Databridge – Audience Data Integration & Publishing Platform',
        description: 'A large-scale, cloud-hosted data integration platform used in the advertising domain to ingest client datasets, process audience segments, and publish them to major social media channels. Built on AWS with Snowflake as the data backbone, the system supports continuous delivery through Jenkins and Kubernetes. Led a team of five engineers, driving feature development, platform enhancements, and reliable automation at scale.',
        technologies: ['AWS', 'Snowflake', 'Airflow', 'Liquibase', 'Jenkins', 'Kubernetes', 'Java', 'REST APIs'],
        features: [
            'Designed and maintained AWS Simple Workflows to process high-volume client datasets and deliver accurate audience segments to activation platforms',
            'Integrated multiple social media ecosystems (Facebook, Google Ads, LinkedIn, etc.) and managed periodic SDK upgrades to ensure long-term platform compatibility',
            'Onboarded new advertisers and publishing destinations, expanding ecosystem reach and customer adoption',
            'Implemented support for new ingestion data types, improving flexibility and reducing onboarding friction',
            'Developed REST APIs enabling new features, simplifying cross-platform communication and accelerating rollout cycles',
            'Led feature and version upgrade strategies, optimizing performance and improving data throughput',
            'Enhanced file-processing pipelines to handle diverse input formats at scale, resulting in lower processing time and reduced error rates',
            'Directed development activities for a 5-member engineering team, overseeing CI/CD via Jenkins and Kubernetes for smooth deployment cycles'
        ],
        challenges: 'Supporting diverse client datasets and multiple social media platforms required a highly resilient integration layer capable of handling schema variability, frequent API/SDK changes, and strict SLAs for data accuracy. These complexities were addressed through robust workflow orchestration on AWS, schema-managed evolution via Liquibase, scalable processing in Snowflake, and rigorous automation across the entire CI/CD pipeline.',
        liveLink: '#',
        githubLink: '#'
    },
    5: {
        title: 'Enterprise Banking & Trade Finance',
        description: 'Contributed to enterprise banking and trade-finance platforms focused on import/export workflows. Delivered Java-based backend enhancements, API integrations, workflow automation, and cloud-native engineering while coordinating with development, QA, business analysis, and production support teams.',
        technologies: ['Java', 'Spring Boot', 'REST APIs', 'Kubernetes', 'Argo Workflows', 'Workflow Automation', 'Cloud-Native', 'Trade Finance'],
        features: [
            'Implemented backend enhancements for enterprise banking and trade-finance use cases',
            'Built and optimized REST APIs supporting import/export workflow orchestration',
            'Contributed to workflow automation pipelines for operational efficiency',
            'Collaborated closely with QA and business-analysis teams to clarify requirements and improve release quality',
            'Supported cloud-native deployment patterns in containerized Kubernetes environments',
            'Partnered with support and operations teams to triage production issues and improve resilience'
        ],
        challenges: 'Banking and trade-finance workflows require strict process accuracy, reliable integrations, and clear cross-team coordination. The key challenge was delivering feature changes rapidly while maintaining operational stability and compliance expectations. This was addressed through incremental API design, automation-first workflows, structured test collaboration, and disciplined release coordination across engineering and support functions.',
        liveLink: '#',
        githubLink: '#'
    },
    6: {
        title: 'AI-Powered Portfolio Chatbot',
        description: 'A serverless AI assistant embedded in the portfolio to answer questions about projects, experience, and skills. The architecture uses a multi-tier fallback strategy (Groq AI → OpenAI → curated static responses) to maintain high availability and low operating cost.',
        technologies: ['Node.js', 'Serverless', 'Groq AI', 'OpenAI', 'Vercel', 'JavaScript', 'REST APIs', 'Edge Functions'],
        features: [
            'Processes high daily request volume using low-latency Groq inference as the primary provider',
            'Implements a resilient fallback chain from Groq to OpenAI to static responses',
            'Runs on globally distributed Vercel edge/serverless infrastructure',
            'Delivers context-aware responses grounded in portfolio and experience data',
            'Maintains graceful degradation to preserve user experience during provider outages',
            'Optimizes cost while preserving responsiveness and reliability'
        ],
        challenges: 'Building a dependable AI assistant with minimal infrastructure cost required careful handling of provider availability, latency, and response quality. The solution combined a tiered provider strategy, serverless edge deployment, and robust fallback logic so users consistently receive useful responses even when upstream AI services are constrained.',
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
            // document.getElementById('modalLiveLink').href = project.liveLink;
            // document.getElementById('modalGithubLink').href = project.githubLink;

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
// ENHANCED FLOWCHART VIEWER
// ==========================================

// ── Project data for sidebar ──────────────────────────────────────────────────
const fvProjectData = {
    '0': {
        title: 'Remote Chiller Monitoring',
        icon: '🌡️',
        company: 'Tata Consultancy Services',
        period: 'Sep 2015 – May 2018',
        overview: 'An IoT solution to bring smart building capability to Intel offices. Sensor parameters are monitored and analysed by building managers to visualise information and make fast, precise decisions in real time.',
        tech: ['Java', 'Spring Boot', 'Kafka', 'MQTT', 'REST APIs', 'PostgreSQL', 'Redis', 'Spark', 'HBase', 'Maven', 'Tomcat'],
        highlights: [
            'Real-time sensor data streaming via MQTT protocol',
            'Kafka-powered event pipeline processing thousands of events per minute',
            'Apache Spark analytics engine for predictive maintenance alerts',
            'HBase as time-series store for historical sensor readings',
            'REST API dashboard consumed by building operations managers',
            'Deployed across multiple Intel office campuses'
        ]
    },
    '1': {
        title: 'Big Data Migration',
        icon: '🗄️',
        company: 'Cognizant Technology Solutions',
        period: 'May 2018 – Sep 2020',
        overview: 'Big-data solution to migrate data from legacy systems and deliver business insights through analytics. Periodically synchronises data from RDBMS systems via change data files received through Informatica.',
        tech: ['Sqoop', 'Scala', 'Spark', 'HBase', 'Hadoop', 'HDFS', 'Hive', 'Shell Script', 'Informatica'],
        highlights: [
            'Migrated multi-terabyte datasets from legacy RDBMS into Hadoop ecosystem',
            'Sqoop jobs for incremental and full-load data ingestion',
            'Spark + Scala transformations for data cleansing and enrichment',
            'Hive tables exposed as analytical layer for business reports',
            'Shell scripts orchestrating end-to-end pipeline scheduling',
            'Change Data Capture (CDC) pipeline via Informatica integration'
        ]
    },
    '2': {
        title: 'MF2C — Cloud Migration',
        icon: '☁️',
        company: 'Cognizant Technology Solutions',
        period: 'Oct 2020 – May 2021',
        overview: 'Migration of projects from Mainframe systems to cloud using AGILE methodology. Set up data channels using Kafka with Spring Batch to process files for day-to-day financial services on Azure and client-native cloud.',
        tech: ['Java', 'Spring Batch', 'Kafka', 'Liquibase', 'MySQL', 'Kubernetes', 'KITT', 'Splunk', 'Dynatrace', 'Azure'],
        highlights: [
            'Mainframe-to-Cloud lift-and-shift with zero data loss',
            'Spring Batch jobs processing high-volume financial data files daily',
            'Kafka topics as decoupled data channels between services',
            'Kubernetes deployments on both Azure and client-native platforms',
            'Liquibase managing database schema versioning and rollbacks',
            'Splunk + Dynatrace for real-time observability and alerting'
        ]
    },
    '3': {
        title: 'Databridge — AdTech Platform',
        icon: '📡',
        company: 'Dentsu Global Services',
        period: 'Jun 2021 — Dec 2025',
        overview: 'Large-scale application development for a programmatic advertising platform hosted on AWS with data on Snowflake. Leading a team of 5, managing feature delivery with automated CI/CD via Jenkins and Kubernetes.',
        tech: ['Java', 'Spring Boot', 'REST APIs', 'Snowflake', 'Amazon Web Services', 'MySQL', 'Jenkins', 'Wildfly', 'Datadog', 'Kubernetes'],
        highlights: [
            'Technical Lead managing a cross-functional team of 5 engineers',
            'Snowflake data warehouse powering real-time ad-performance analytics',
            'AWS-hosted microservices with auto-scaling Kubernetes clusters',
            'Jenkins CI/CD pipelines reducing deployment time by 60%',
            'Datadog dashboards providing full-stack observability',
            'Sub-second query performance on billions of ad impression records'
        ]
    },
    '4': {
        title: 'AI-Powered Portfolio Chatbot',
        icon: '🤖',
        company: 'Personal Project',
        period: '2025 – Present',
        overview: 'Serverless AI chatbot with an intelligent multi-tier fallback strategy (Groq AI → OpenAI → Static). Built with Node.js on Vercel edge, featuring 99.95% availability, global edge deployment and cost-optimised architecture.',
        tech: ['Node.js', 'Serverless', 'Groq AI', 'OpenAI', 'Vercel', 'JavaScript', 'REST APIs', 'Edge Functions'],
        highlights: [
            '14,400+ free AI requests processed daily via Groq\'s LPU inference',
            'Multi-tier fallback: Groq → OpenAI → curated static responses',
            'Vercel edge functions deployed globally with <50 ms cold start',
            'Zero-infrastructure cost architecture for hobby-project scale',
            'Graceful degradation patterns ensuring 99.95% availability',
            'Context-aware responses trained on years of career data'
        ]
    }
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const imageModal       = document.getElementById('imageModal');
const imageModalImg    = document.getElementById('imageModalImg');
const pageModalFrame   = document.getElementById('pageModalFrame');
const clickableImages  = document.querySelectorAll('.project-image-clickable');
const fvCanvas         = document.getElementById('fvCanvas');
const fvCanvasWrapper  = document.getElementById('fvCanvasWrapper');
const fvZoomIn         = document.getElementById('fvZoomIn');
const fvZoomOut        = document.getElementById('fvZoomOut');
const fvZoomReset      = document.getElementById('fvZoomReset');
const fvZoomLevel      = document.getElementById('fvZoomLevel');
const fvClose          = document.getElementById('fvClose');
const fvPrev           = document.getElementById('fvPrev');
const fvNext           = document.getElementById('fvNext');
const fvSidebarToggle  = document.getElementById('fvSidebarToggle');
const fvSidebar        = document.getElementById('fvSidebar');
const fvHint           = document.getElementById('fvHint');
const fvTabs           = document.querySelectorAll('.fv-tab');
const fvImageList      = Array.from(clickableImages);
let fvActiveIndex      = -1;

// ── Zoom state ────────────────────────────────────────────────────────────────
let fvZoom = 1;
const FV_ZOOM_STEP = 0.25;
const FV_ZOOM_MIN  = 0.5;
const FV_ZOOM_MAX  = 3;
let fvBaseWidth = 1050;
let fvBaseHeight = 780;

function getActiveCanvasElement() {
    if (pageModalFrame.style.display !== 'none') return pageModalFrame;
    if (imageModalImg.style.display !== 'none') return imageModalImg;
    return null;
}

function refreshCanvasBaseSize() {
    const active = getActiveCanvasElement();
    if (!active) return;

    let width = 0;
    let height = 0;

    if (active === imageModalImg) {
        const naturalWidth = imageModalImg.naturalWidth || imageModalImg.clientWidth;
        const naturalHeight = imageModalImg.naturalHeight || imageModalImg.clientHeight;
        if (naturalWidth && naturalHeight) {
            const constrainedWidth = Math.min(naturalWidth, 1050);
            const ratio = constrainedWidth / naturalWidth;
            width = constrainedWidth;
            height = Math.round(naturalHeight * ratio);
        }
    } else {
        width = pageModalFrame.clientWidth || 1050;
        height = pageModalFrame.clientHeight || 780;
    }

    if (width > 0 && height > 0) {
        fvBaseWidth = width;
        fvBaseHeight = height;
    }
}

function setZoom(z) {
    fvZoom = Math.min(FV_ZOOM_MAX, Math.max(FV_ZOOM_MIN, z));
    const active = getActiveCanvasElement();
    if (active) {
        const scaledWidth = Math.max(1, Math.round(fvBaseWidth * fvZoom));
        const scaledHeight = Math.max(1, Math.round(fvBaseHeight * fvZoom));
        const wrapperWidth = fvCanvasWrapper.clientWidth || 0;
        const wrapperHeight = fvCanvasWrapper.clientHeight || 0;
        const canvasWidth = Math.max(scaledWidth, wrapperWidth, 1);
        const canvasHeight = Math.max(scaledHeight, wrapperHeight, 1);
        const offsetLeft = Math.max(0, Math.round((canvasWidth - scaledWidth) / 2));
        const offsetTop = Math.max(0, Math.round((canvasHeight - scaledHeight) / 2));

        active.style.transformOrigin = 'top left';
        active.style.transform = `scale(${fvZoom})`;
        active.style.left = `${offsetLeft}px`;
        active.style.top = `${offsetTop}px`;
        fvCanvas.style.width = `${canvasWidth}px`;
        fvCanvas.style.height = `${canvasHeight}px`;

        const isContentNarrow = scaledWidth < wrapperWidth;
        fvCanvasWrapper.classList.toggle('zoomed-out', fvZoom < 1 && isContentNarrow);
    } else {
        fvCanvasWrapper.classList.remove('zoomed-out');
    }
    fvZoomLevel.textContent  = Math.round(fvZoom * 100) + '%';
}

fvZoomIn.addEventListener('click',    () => setZoom(fvZoom + FV_ZOOM_STEP));
fvZoomOut.addEventListener('click',   () => setZoom(fvZoom - FV_ZOOM_STEP));
fvZoomReset.addEventListener('click', () => setZoom(1));

pageModalFrame.addEventListener('load', () => {
    refreshCanvasBaseSize();
    setZoom(fvZoom);
});

imageModalImg.addEventListener('load', () => {
    refreshCanvasBaseSize();
    setZoom(fvZoom);
});

window.addEventListener('resize', () => {
    if (!imageModal.classList.contains('active')) return;
    setZoom(fvZoom);
});

// Mouse-wheel zoom centred on cursor
fvCanvasWrapper.addEventListener('wheel', function(e) {
    // Keep normal wheel/trackpad scrolling; zoom only with Cmd/Ctrl + wheel.
    if (!e.metaKey && !e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -FV_ZOOM_STEP : FV_ZOOM_STEP;
    // Zoom towards cursor position
    const rect      = fvCanvasWrapper.getBoundingClientRect();
    const offsetX   = e.clientX - rect.left + fvCanvasWrapper.scrollLeft;
    const offsetY   = e.clientY - rect.top  + fvCanvasWrapper.scrollTop;
    const prevZoom  = fvZoom;
    setZoom(fvZoom + delta);
    const ratio     = fvZoom / prevZoom;
    fvCanvasWrapper.scrollLeft = offsetX * ratio - (e.clientX - rect.left);
    fvCanvasWrapper.scrollTop  = offsetY * ratio - (e.clientY - rect.top);
    hideHint();
}, { passive: false });

// ── Drag-to-pan ───────────────────────────────────────────────────────────────
let isPanning = false, panStartX = 0, panStartY = 0, scrollStartX = 0, scrollStartY = 0;

fvCanvasWrapper.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    isPanning   = true;
    panStartX   = e.clientX;
    panStartY   = e.clientY;
    scrollStartX = fvCanvasWrapper.scrollLeft;
    scrollStartY = fvCanvasWrapper.scrollTop;
    fvCanvasWrapper.classList.add('grabbing');
    hideHint();
});

document.addEventListener('mousemove', function(e) {
    if (!isPanning) return;
    fvCanvasWrapper.scrollLeft = scrollStartX - (e.clientX - panStartX);
    fvCanvasWrapper.scrollTop  = scrollStartY - (e.clientY - panStartY);
});

document.addEventListener('mouseup', function() {
    if (!isPanning) return;
    isPanning = false;
    fvCanvasWrapper.classList.remove('grabbing');
});

// ── Hint auto-hide ─────────────────────────────────────────────────────────────
let hintTimer;
function hideHint() {
    clearTimeout(hintTimer);
    if (fvHint) fvHint.classList.add('hidden');
}
function showHint() {
    if (!fvHint) return;
    fvHint.classList.remove('hidden');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, 3500);
}

// ── Sidebar toggle ─────────────────────────────────────────────────────────────
fvSidebarToggle.addEventListener('click', () => {
    fvSidebar.classList.toggle('collapsed');
});

// ── Sidebar tabs ──────────────────────────────────────────────────────────────
fvTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        fvTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const tabName = this.dataset.tab;
        document.querySelectorAll('.fv-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('fv-panel-' + tabName).classList.add('active');
    });
});

// ── Populate sidebar ──────────────────────────────────────────────────────────
function populateSidebar(pageNum) {
    const normalizedPageNum = pageNum === '\\4' ? '4' : pageNum;
    const data = fvProjectData[normalizedPageNum] || fvProjectData['0'];

    // Header
    document.getElementById('fvIcon').textContent  = data.icon;
    document.getElementById('fvTitle').textContent = data.title;
    document.getElementById('fvMeta').textContent  = data.period;

    // Overview panel
    document.getElementById('fv-panel-overview').innerHTML = `
        <p class="fv-section-label">About</p>
        <div class="fv-overview-company">
            <span class="fv-company-badge">${data.company}</span>
            <span class="fv-period-badge">${data.period}</span>
        </div>
        <p class="fv-overview-text">${data.overview}</p>
    `;

    // Tech Stack panel
    const chips = data.tech.map((t, i) =>
        `<span class="fv-tech-chip" style="animation-delay:${i * 0.04}s">${t}</span>`
    ).join('');
    document.getElementById('fv-panel-tech').innerHTML = `
        <p class="fv-section-label">Technologies Used</p>
        <div class="fv-tech-grid">${chips}</div>
    `;

    // Highlights panel
    const items = data.highlights.map((h, i) =>
        `<li style="animation-delay:${i * 0.06}s">${h}</li>`
    ).join('');
    document.getElementById('fv-panel-highlights').innerHTML = `
        <p class="fv-section-label">Key Highlights</p>
        <ul class="fv-highlights-list">${items}</ul>
    `;

    // Reset tabs to Overview
    fvTabs.forEach(t => t.classList.remove('active'));
    fvTabs[0].classList.add('active');
    document.querySelectorAll('.fv-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('fv-panel-overview').classList.add('active');
}

// ── Page index map ────────────────────────────────────────────────────────────
const pageIndexMap = { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '\\4': '4' };

// ── Open modal ────────────────────────────────────────────────────────────────
async function openFlowchartFromTile(imageContainer) {
    const tileIndex = fvImageList.indexOf(imageContainer);
    if (tileIndex >= 0) fvActiveIndex = tileIndex;

    let pageSrc  = imageContainer.getAttribute('data-page');
    const pageNum = imageContainer.getAttribute('data-page-num') || '0';
    const imageSrc = imageContainer.getAttribute('data-image');

    // Reset zoom
    setZoom(1);
    fvCanvasWrapper.scrollLeft = 0;
    fvCanvasWrapper.scrollTop  = 0;

    // Populate sidebar
    populateSidebar(pageNum);

    if (pageSrc) {
        imageModalImg.style.transform = '';
        pageModalFrame.style.transform = '';

        if (pageSrc.includes('#')) pageSrc = pageSrc.split('#')[0];

        // SVGs render cleaner as <img> (avoids nested iframe scroll/offset artifacts)
        if (pageSrc.toLowerCase().endsWith('.svg')) {
            pageModalFrame.style.display = 'none';
            pageModalFrame.src = '';
            imageModalImg.style.display = 'block';
            imageModalImg.src = pageSrc;
        } else {
            imageModalImg.style.display  = 'none';
            pageModalFrame.style.display = 'block';
            try {
                const response   = await fetch(pageSrc);
                let htmlContent  = await response.text();
                const pageIndex  = pageIndexMap[pageNum] || '0';
                htmlContent = htmlContent.replace(/"page":\d+/, `"page":${pageIndex}`);
                const blob       = new Blob([htmlContent], { type: 'text/html' });
                pageModalFrame.src = URL.createObjectURL(blob);
            } catch (err) {
                console.error('Error loading architecture diagram:', err);
                pageModalFrame.src = pageSrc;
            }
        }

    } else if (imageSrc) {
        pageModalFrame.style.display = 'none';
        pageModalFrame.src = '';
        imageModalImg.style.display  = 'block';
        pageModalFrame.style.transform = '';
        imageModalImg.src = imageSrc;
    }

    requestAnimationFrame(() => {
        refreshCanvasBaseSize();
        setZoom(fvZoom);
    });

    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showHint();
}

clickableImages.forEach((imageContainer, index) => {
    imageContainer.addEventListener('click', async function(e) {
        e.stopPropagation();
        fvActiveIndex = index;
        await openFlowchartFromTile(imageContainer);
    });
});

if (fvNext) {
    fvNext.addEventListener('click', async function(e) {
        e.stopPropagation();
        if (fvImageList.length === 0) return;
        if (fvActiveIndex < 0) fvActiveIndex = 0;
        fvActiveIndex = (fvActiveIndex + 1) % fvImageList.length;
        await openFlowchartFromTile(fvImageList[fvActiveIndex]);
    });
}

if (fvPrev) {
    fvPrev.addEventListener('click', async function(e) {
        e.stopPropagation();
        if (fvImageList.length === 0) return;
        if (fvActiveIndex < 0) fvActiveIndex = 0;
        fvActiveIndex = (fvActiveIndex - 1 + fvImageList.length) % fvImageList.length;
        await openFlowchartFromTile(fvImageList[fvActiveIndex]);
    });
}

// ── Close modal ───────────────────────────────────────────────────────────────
function closeImageModal() {
    imageModal.classList.remove('active');
    pageModalFrame.src = '';
    pageModalFrame.style.transform = '';
    pageModalFrame.style.left = '';
    pageModalFrame.style.top = '';
    imageModalImg.style.transform = '';
    imageModalImg.style.left = '';
    imageModalImg.style.top = '';
    fvCanvas.style.width = '';
    fvCanvas.style.height = '';
    fvCanvasWrapper.classList.remove('zoomed-out');
    document.body.style.overflow = '';
}

fvClose.addEventListener('click', closeImageModal);

imageModal.addEventListener('click', function(e) {
    if (e.target === imageModal) closeImageModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imageModal.classList.contains('active')) closeImageModal();
});

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
