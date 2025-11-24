/* ==========================================
   AI CHATBOT ASSISTANT - JAVASCRIPT
   ========================================== */

// Knowledge Base about Ramji Sridaran
const knowledgeBase = {
    profile: {
        name: "Ramji Sridaran",
        title: "Technical Lead",
        experience: "11+ years",
        location: "Based in Coimbatore, India. [Worked in Chennai & Kochi]",
        specializations: ["Java", "AWS", "Snowflake", "Big Data", "Spring Boot", "Microservices", "IoT", "Kafka"]
    },

    skills: {
        languages: ["Java", "Python", "SQL", "JavaScript", "Scala"],
        frameworks: ["Spring Boot", "Hibernate"],
        buildTools: ["Maven", "Scala Build Tool"],
        awsTools: ["Elastic Beanstalk", "Scala Build Tool"],
        cloud: ["AWS", "Snowflake"],
        bigData: ["HBase", "Spark", "Kafka", "Sqoop", "Airflow", "Solr"],
        databases: ["MySQL", "PostgreSQL", "Snowflake"],
        devops: ["Docker", "Kubernetes", "Jenkins", "Git", "CI/CD"],
        architecture: ["Microservices", "Event-Driven", "Cloud-Native", "Serverless"]
    },

    experience: [
        {
            role: "Technical Lead",
            company: "Dentsu Global Services",
            duration: "June 2021 - Present",
            highlights: [
                "Leading a 5-member engineering team in developing high-performance AdTech platform serving 50M+ requests daily",
                "Architected enterprise-scale features using AWS cloud infrastructure and Snowflake data warehouse",
                "Successfully delivered multiple critical system upgrades and security enhancements with zero downtime",
                "Key Technical Achievements:",
                "🔐 Security Enhancement: Migrated Snowflake authentication from password-based to private key authentication, improving security posture and eliminating credential exposure risks",
                "🛡️ Critical Security Upgrade: Led Log4j migration from 1.x to 2.x addressing CVE-2021-44228 vulnerability, improving application security",
                "☁️ Platform Modernization: Successfully migrated Segments API from .NET to Java with OpenAPI specification, improving API documentation, developer experience, and cross-platform compatibility",
                "👨‍🏫 Technical Leadership: Mentored 5+ junior developers on Java best practices, Spring Boot architecture, microservices design patterns, and clean code principles",
                "⚡ Java Version Upgrade: Java 8 to Java 17 migration leveraging new language features (Records, Sealed Classes, Pattern Matching) resulting in 25% code reduction and improved maintainability",
                "🚀 Framework Modernization: Worked on Spring Boot from 2.x to 3.x, adopting Spring Native, improved observability with Micrometer, and Jakarta EE namespace migration",
                "☁️ AWS SDK Modernization: Migrated AWS SDK from v1.x to v2.x improving performance with async operations, reducing memory footprint by 40%, and enhancing cloud resource management",
                "🔄 Identity Migration: Successfully migrated IID (Individual ID) to CMID (Client-specific MID) migration and did code cleanup to reduce complexity and improve maintainability",
            ]
        },
        {
            role: "Java/Cloud Developer",
            company: "Cognizant Technology Solutions",
            duration: "Nov 2019 - May 2021",
            highlights: [
                "☁️ Cloud-Native Architecture: Designed and developed microservices-based retail management platform on Microsoft Azure",
                "📊 Real-Time Data Pipeline: Implemented Kafka-based event streaming pipelines ",
                "🏗️ Microservices Design: Implemented event-driven microservices architecture with Spring batch",
                "👥 Collaboration: Worked in Agile Scrum teams of 8-10 members, participated in sprint planning, code reviews, and knowledge sharing sessions"
            ]
        },
        {
            role: "Big-Data Developer",
            company: "Cognizant Technology Solutions",
            duration: "May 2018 - Nov 2019",
            highlights: [
                "📊 Enterprise Data Migration: Architected and implemented Sqoop-based ETL pipelines migrating 5TB+ data periodically RDBMS sources (MySQL, Oracle) to HBase distributed NoSQL database, ensuring zero data loss with validation frameworks and incremental load strategies",
                "🔍 Advanced Search Infrastructure: Developed high-performance Scala application integrating HBase with Apache Solr, creating a distributed search platform serving 1000+ customer care executives with millisecond-level query response times and faceted search capabilities",
                "🛠️ Technology Stack: Scala, Apache Sqoop, Apache Kafka, HBase, Apache Solr, Spring Boot, Java 8, Hadoop HDFS, Hive, MySQL, RESTful APIs",
                "👥 Collaboration: Worked closely with data analysts, customer care teams, and business stakeholders to translate requirements into technical solutions, participated in daily standups, sprint planning, and knowledge transfer sessions"
            ]
        },
        {
            role: "IoT – Java/Big-Data Developer",
            company: "Tata Consultancy Services",
            duration: "Oct 2015 - May 2018",
            highlights: [
                "📡 IoT Data Ingestion Platform: Architected and deployed enterprise-grade real-time data ingestion system processing telemetry from 100+ IoT devices across factories, collecting 60+ data points every minute including temperature, humidity, occupancy, and energy consumption metrics",
                "🔗 MQTT Message Broker Architecture: Designed and implemented scalable MQTT broker infrastructure with Eclipse Mosquitto supporting pub/sub messaging patterns, QoS levels, and SSL/TLS encryption for secure device communication with 99.5% uptime",
                "⚡ Real-Time Streaming Pipeline: Built high-throughput Java-based integration layer bridging MQTT channels to Apache Kafka topics, enabling seamless data flow for downstream analytics with message transformation, validation, and routing logic processing 5K+ messages/second",
                "🛠️ Technology Stack: Java 8, Spring Boot, Apache Kafka, Apache Spark, HBase, MQTT (Eclipse Mosquitto), AngularJS, D3.js, RESTful APIs, Maven, Git",
                "🔮 Predictive Analytics Engine: Developed Apache Spark-based analytics platform implementing machine learning algorithms for predictive maintenance, anomaly detection, and automated alert generation reducing equipment downtime by 35% and improving operational efficiency",
                "💾 Big Data Storage Solution: Designed HBase schema for efficient time-series data storage with custom row key design enabling fast lookups, implemented data categorization and aggregation pipelines processing TB-scale sensor data with optimized read/write performance",
                "📊 Dashboard & Visualization: Built responsive real-time monitoring dashboard using AngularJS and D3.js featuring dynamic charts, heat maps, and trend analysis, providing stakeholders with actionable insights and reducing manual reporting time by 80%",
                "🎛️ Device Management Platform: Developed comprehensive IoT device management application with Spring Boot RESTful APIs supporting device provisioning, configuration management, firmware updates, health monitoring, and remote control for 10K+ connected devices",
                "🏗️ IoT Architecture: Implemented end-to-end IoT architecture following best practices: Device Layer (sensors) → Edge Layer (MQTT) → Stream Processing (Kafka) → Analytics (Spark) → Storage (HBase) → Presentation (AngularJS dashboard)",
                "📈 Performance & Scalability: Achieved sub-second latency for real-time alerts, scaled system to handle 10x device growth, optimized HBase queries by 65%, and implemented horizontal scaling with Kafka partitioning for high-throughput processing",
                "🔐 Security & Reliability: Implemented device authentication with X.509 certificates, data encryption in transit and at rest, implemented retry mechanisms and dead-letter queues for fault tolerance, achieving 99.5% data delivery reliability",
                "👥 Cross-Functional Collaboration: Collaborated with hardware engineers for device integration, worked with data scientists on ML model deployment, coordinated with operations teams for retail store rollouts, and conducted technical training sessions"
            ]
        }
    ],

    projects: [
        {
            name: "Databridge - Enterprise Data Integration Platform",
            description: "A critical component of Dentsu [Merkle]'s flagship Identity solution 'Merkury', serving as the enterprise-grade data orchestration engine responsible for seamless data ingestion and distribution across multi-cloud environments. Processes 100TB+ of customer identity data daily with 99.9% accuracy, enabling unified customer profiles across 50+ data sources and destinations.",
            technologies: [
                "Snowflake Data Cloud",
                "AWS (SWF, API Gateway, ElasticBeanstalk, Lambda, S3, EC2, SQS, SNS, CloudFormation, Cloudwatch, IAM)",
                "Python 3.x",
                "Apache Airflow",
                "Java 17",
                "Spring Boot 3.x",
                "Liquibase",
                "Jenkins CI/CD",
                "Kubernetes (EKS)",
                "Docker",
                "PostgreSQL"
            ],
            features: [
                "🔄 Multi-Protocol Data Delivery: Supports SFTP, S3, Snowflake Direct Connect, RESTful APIs, and GraphQL for flexible data exchange",
                "⚡ Auto-Scaling Infrastructure: AWS Elastic Beanstalk based deployment with horizontal autoscaling and load balancing for optimal performance",
                "🎯 Data Quality Framework: Built-in validation, deduplication, and reconciliation ensuring 99.9% data accuracy",
                "📈 Observability & Monitoring: Comprehensive logging with Cloudwatch with monitoring and alerting Datadog for real-time insights",
                "🔧 Schema Evolution: Liquibase-managed database migrations supporting zero-downtime deployments and backward compatibility",
                "🚀 CI/CD Pipeline: Automated Jenkins pipeline with blue-green deployment strategy, achieving 2+ production releases per month"
            ],
            scale: "99.9% uptime | 50+ data source integrations",
            impact: "Reduced data integration time by 80% | Improved data accuracy from 85% to 99.9% | Decreased infrastructure costs by 60%"
        },
        {
            name: "Retail Cloud Migration",
            description: "Migrated retail systems to cloud with 99.9% uptime",
            technologies: ["AWS", "Java", "Spring Boot", "PostgreSQL"],
            features: ["Zero-downtime migration", "Cost optimization", "Auto-scaling"]
        },
        {
            name: "Big Data Migration",
            description: "Migrated on-premise data warehouse to cloud",
            technologies: ["Hadoop", "Spark", "AWS S3", "Redshift"],
            features: ["Data validation", "Performance optimization", "Cost reduction"]
        },
        {
            name: "IoT Analytics Platform",
            description: "Real-time analytics for 10K+ IoT devices",
            technologies: ["Java", "Kafka", "Cassandra", "Spark"],
            features: ["Real-time streaming", "Predictive analytics", "Dashboard"]
        }
    ],

    certifications: [
        "SnowPro Associate Platform Certified",
        "Oracle Certified Java Programmer",
        "Generative AI Fundamentals",
        "AI in the Workplace Specialization",
        "Artificial Intelligence and Machine Learning"
    ],

    achievements: [
        "Reduced system latency by 40% through architecture optimization using Redis",
        "Processed 5TB+ data with 99.9% accuracy",
        "Led teams of 5 developers on critical projects",
        "Improved database query performance by 60%",
        "Process improvements with 90% reduction in waiting time to rerun failed publishes",
    ]
};

// AI Response Generator
class ChatbotAI {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
    }

    // Natural Language Processing - Intent Detection
    detectIntent(message) {
        const msg = message.toLowerCase();

        // Greetings
        if (/^(hi|hello|hey|greetings)/i.test(msg)) {
            return 'greeting';
        }

        // Experience questions
        if (/(experience|work|career|job|background|worked|years)/i.test(msg)) {
            return 'experience';
        }

        // Skills questions
        if (/(skill|technology|tech|stack|know|language|framework|tool)/i.test(msg)) {
            return 'skills';
        }

        // Projects questions
        if (/(project|built|created|developed|portfolio|work)/i.test(msg)) {
            return 'projects';
        }

        // Certifications questions
        if (/(certification|certified|certificate|credential|course)/i.test(msg)) {
            return 'certifications';
        }

        // Contact questions
        if (/(contact|email|reach|hire|connect|linkedin|phone)/i.test(msg)) {
            return 'contact';
        }

        // AWS specific
        if (/(aws|amazon|cloud|lambda|s3|ec2)/i.test(msg)) {
            return 'aws';
        }

        // Snowflake specific
        if (/(snowflake|data warehouse|data lake)/i.test(msg)) {
            return 'snowflake';
        }

        // Java specific
        if (/(java|spring|boot|hibernate)/i.test(msg)) {
            return 'java';
        }

        // Big Data specific
        if (/(big data|hadoop|spark|kafka|etl|pipeline)/i.test(msg)) {
            return 'bigdata';
        }

        return 'default';
    }

    // Generate intelligent responses
    generateResponse(message) {
        const intent = this.detectIntent(message);

        switch(intent) {
            case 'greeting':
                return this.getGreetingResponse();

            case 'experience':
                return this.getExperienceResponse();

            case 'skills':
                return this.getSkillsResponse();

            case 'projects':
                return this.getProjectsResponse();

            case 'certifications':
                return this.getCertificationsResponse();

            case 'contact':
                return this.getContactResponse();

            case 'aws':
                return this.getAWSResponse();

            case 'snowflake':
                return this.getSnowflakeResponse();

            case 'java':
                return this.getJavaResponse();

            case 'bigdata':
                return this.getBigDataResponse();

            default:
                return this.getDefaultResponse();
        }
    }

    getGreetingResponse() {
        return `Hello! 👋 I'm here to help you learn about Ramji Sridaran. 

He's a <strong>Technical Lead with ${this.kb.profile.experience} of experience</strong> specializing in:
• ${this.kb.profile.specializations.slice(0, 3).join(', ')}

What would you like to know more about?`;
    }

    getExperienceResponse() {
        const exp = this.kb.experience[0]; // Current role
        return `Ramji has <strong>${this.kb.profile.experience} of professional experience</strong> in software development and architecture.

<strong>Current Role:</strong>
🎯 ${exp.role} at ${exp.company} (${exp.duration})

<strong>Key Highlights:</strong>
${exp.highlights.map(h => `• ${h}`).join('\n')}

He has worked across multiple domains including AdTech, Retail, IoT, and Enterprise Data Platforms.

Would you like to know about his specific projects or technical skills?`;
    }

    getSkillsResponse() {
        return `Ramji has a comprehensive tech stack spanning multiple domains:
<strong>☁️ Cloud & Data:</strong>
• ${this.kb.skills.cloud.slice(0, 3).join(', ')}
<strong>☕ Languages & Frameworks:</strong>
• ${this.kb.skills.languages.slice(0, 4).join(', ')}
• ${this.kb.skills.frameworks.slice(0, 3).join(', ')}
<strong>📊 Big Data:</strong>
• ${this.kb.skills.bigData.slice(0, 4).join(', ')}
<strong>🐳 DevOps:</strong>
• ${this.kb.skills.devops.slice(0, 4).join(', ')}
Want to know about specific projects using these technologies?`;
    }

    getProjectsResponse() {
        const projects = this.kb.projects.slice(0, 3);
        return `Ramji has worked on several impressive projects:

${projects.map((p, i) => `
<strong>${i + 1}. ${p.name}</strong>
${p.description}
Tech: ${p.technologies.slice(0, 3).join(', ')}
`).join('\n')}

Each project demonstrates his expertise in scalable architecture and cloud technologies. Want details on any specific project?`;
    }

    getCertificationsResponse() {
        return `Ramji holds multiple professional certifications:
${this.kb.certifications.slice(0, 6).map((cert, i) => `${i + 1}. 🎓 ${cert}`).join('\n')}

These certifications validate his expertise in Cloud, AI, and Big Data technologies.`;
    }

    getContactResponse() {
        return `Want to connect with Ramji? Here are the ways:

📧 <strong>Email:</strong> Check the contact section below
💼 <strong>LinkedIn:</strong> Available in the hero section
🌐 <strong>Portfolio:</strong> You're already here!

Feel free to reach out for:
• Job opportunities
• Technical consulting
• Collaboration on projects
• Speaking engagements
Scroll to the <strong>Contact section</strong> to get in touch directly!`;
    }

    getAWSResponse() {
        return `Ramji has extensive AWS expertise:

<strong>AWS Services:</strong>
• Elastic Beanstalk, SQS, SNS
• Lambda, EC2, S3, CloudFormation
• RDS, DynamoDB, Kinesis
• CloudWatch, IAM, VPC

<strong>Achievements:</strong>
• Architected serverless applications handling 50M+ requests/day
• Reduced cloud costs by 60% through optimization
• Built auto-scaling microservices on ECS/EKS

He's AWS Cloud Practitioner certified and has hands-on experience with production workloads.`;
    }

    getSnowflakeResponse() {
        return `Ramji is a <strong>Snowflake SnowPro Core Certified</strong> professional:

<strong>Expertise:</strong>
• Data warehouse architecture
• ETL pipeline development
• Performance optimization
• Security & compliance

<strong>Project Highlights:</strong>
• Processes 100TB+ data daily
• Built multi-cloud data integration platform
• Achieved 99.9% data accuracy
• Reduced query time by 70%

His Databridge project showcases enterprise-scale Snowflake implementation.`;
    }

    getJavaResponse() {
        return `Ramji is an <strong>Oracle Certified Java Programmer</strong> with deep expertise:

<strong>Java Stack:</strong>
• Core Java, Java 8+ features
• Spring Boot, Spring Cloud
• Hibernate, JPA
• Microservices architecture

<strong>Experience:</strong>
• ${this.kb.profile.experience} of Java development
• Built scalable APIs serving millions of requests
• Event-driven architectures with Kafka
• RESTful & GraphQL APIs

He specializes in building high-performance, cloud-native Java applications.`;
    }

    getBigDataResponse() {
        return `Ramji has strong Big Data expertise:

<strong>Technologies:</strong>
📊 Hadoop, Sqoop, Kafka, Solr, Spark
📨 Kafka for real-time streaming
🔄 Airflow for orchestration
💾 HBase & warehouses

<strong>Achievements:</strong>
• Processed terabytes of data
• Real-time analytics for 10K+ IoT devices
• Built ETL pipelines with 99.9% accuracy
• Optimized queries by 60%

His projects span batch processing, real-time streaming, and data warehouse migration.`;
    }

    getDefaultResponse() {
        return `I can help you learn about Ramji's:

🎯 <strong>Experience</strong> - 11+ years in software development
🛠️ <strong>Skills</strong> - Java, AWS, Snowflake, Big Data, and more
🚀 <strong>Projects</strong> - Enterprise platforms handling massive scale
🎓 <strong>Certifications</strong> - Snowflake, AWS, AI certifications

Try asking specific questions like:
• "What is Ramji's experience with AWS?"
• "Tell me about Ramji's projects"
• "What certifications does Ramji have?"

How can I help you today?`;
    }
}

// Initialize Chatbot
document.addEventListener('DOMContentLoaded', function() {
    const chatbot = new ChatbotAI(knowledgeBase);
    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const minimizeBtn = document.getElementById('chatbot-minimize');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    const suggestionsContainer = document.getElementById('chatbot-suggestions');

    // Toggle chat window
    toggleBtn.addEventListener('click', function() {
        toggleBtn.classList.toggle('active');
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            input.focus();
        }
    });

    // Minimize chat
    minimizeBtn.addEventListener('click', function() {
        toggleBtn.classList.remove('active');
        chatWindow.classList.remove('active');
    });

    // Send message
    function sendMessage() {
        const message = input.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        input.value = '';

        // Hide suggestions after first message
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }

        // Show typing indicator
        showTypingIndicator();

        // Generate AI response with delay
        setTimeout(() => {
            hideTypingIndicator();
            const response = chatbot.generateResponse(message);
            addMessage(response, 'bot');
        }, 800 + Math.random() * 400); // Random delay for natural feel
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            input.value = question;
            sendMessage();
        });
    });

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Convert newlines to <br> and preserve formatting
        const formattedText = text
            .split('\n')
            .map(line => {
                if (line.startsWith('•') || line.match(/^\d+\./)) {
                    return `<p>${line}</p>`;
                }
                return line;
            })
            .join('\n');

        content.innerHTML = formattedText.replace(/\n/g, '<br>');

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Welcome message animation
    setTimeout(() => {
        const firstMessage = messagesContainer.querySelector('.message');
        if (firstMessage) {
            firstMessage.style.animation = 'messageSlide 0.5s ease';
        }
    }, 300);
});

