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
    const projectLinks = document.querySelectorAll('a[href^="#"][href$="bridge"], a[href^="#"][href$="mf2c"], a[href^="#"][href$="datamigration"], a[href^="#"][href$="chiller"], a[href^="#"][href$="ai-chatbot"]');

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
