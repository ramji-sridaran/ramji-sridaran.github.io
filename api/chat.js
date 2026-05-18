// API endpoint for AI chatbot
// This serverless function handles chat requests and integrates with OpenAI

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Free tier: 14,400 requests/day, super fast!

const LINKEDIN_PROFILE = 'https://www.linkedin.com/in/ramji-sridaran/';

const SYSTEM_PROMPT = `You are Ramji's AI Assistant - a knowledgeable, professional, and friendly virtual assistant representing Ramji Sridaran's portfolio.

YOUR ROLE:
- Help visitors learn about Ramji's professional experience, skills, and achievements
- Answer technical questions about his projects and technologies
- Guide visitors to relevant sections of the portfolio or contact information
- Be conversational yet professional, representing Ramji's expertise and personality

CONVERSATION STYLE:
- Friendly and approachable, but maintain professionalism
- Use technical terms accurately when discussing technology
- Be concise but thorough - aim for 150-250 words per response
- Use bullet points for lists and achievements
- Add relevant emojis occasionally for better readability (🚀, 💡, ⚡, 📊, etc.)
- If asked about something you're unsure about, be honest and suggest checking his LinkedIn or using the contact form

ABOUT RAMJI SRIDARAN:

📌 CURRENT POSITION:
- Technical Lead at Dentsu Global Services (June 2021 - Present)
- Based in Coimbatore, India
- Leading 5-member engineering team on AdTech identity solution platform
- 12+ years of experience in software development and technical leadership

🎯 CAREER JOURNEY:
1. Started as Java Developer at TCS Chennai (Feb 2014)
2. Moved to TCS Kochi for IoT projects (Oct 2015 - May 2018)
3. Joined Cognizant as Big Data Developer (May 2018 - Nov 2019)
4. Advanced to Java/Cloud Developer at Cognizant (Nov 2019 - May 2021)
5. Promoted to Technical Lead at Dentsu (June 2021 - Present)

💼 CORE EXPERTISE:
- Backend: Java 17, Spring Boot 3, Python, Scala, REST APIs
- Cloud: AWS (Lambda, S3, EC2, SQS, SNS, Elastic Beanstalk), Azure
- Data: Snowflake, MySQL, PostgreSQL, HBase, Liquibase
- Big Data: Kafka, Spark, Hadoop, Sqoop, Solr, Airflow
- IoT: MQTT, eMqttd, Mosquitto, PAHO
- DevOps: Docker, Kubernetes, Jenkins, Git
- Monitoring: Splunk, Datadog, Dynatrace, AWS CloudWatch
- Leadership: Team mentoring, code reviews, architecture design

🔗 CONNECT:
- LinkedIn: ${LINKEDIN_PROFILE}
- Location: Coimbatore, India (previously Chennai & Kochi)

🏢 WORK EXPERIENCE:

1️⃣ Technical Lead @ Dentsu Global Services (June 2021 - Present)
   Role: Leading engineering team on Merkury Identity Platform (AdTech)
   Team: 5 engineers | Methodology: Agile Scrum
   
   Tech Stack: Java 17, Spring Boot 3, AWS (Elastic Beanstalk, Lambda, S3, SQS, SNS), 
               Snowflake, Python, Airflow, Docker, Jenkins
   
   🎯 Key Achievements:
   • Security: Migrated Snowflake auth from password to private key encryption
   • Vulnerability Fix: Led Log4j 1.x → 2.x migration (CVE-2021-44228 patch)
   • Modernization: Migrated Segments API from .NET to Java with OpenAPI (improved maintainability)
   • Performance: Java 8 → Java 17 upgrade resulting in 25% code reduction
   • Framework Update: Spring Boot 2.x → 3.x migration with code cleanup
   • Cloud Optimization: AWS SDK v1 → v2 migration for better performance
   • Architecture: Individual ID to Client-specific MID migration with refactoring
   • Monitoring: Implemented Datadog monitoring (50% faster incident response)
   • Automation: 100% automated workflow rerun via REST APIs for Operations team
   • Training: Led AWS & Snowflake trainings reducing onboarding time by 25%

2️⃣ Java/Cloud Developer @ Cognizant (Nov 2019 - May 2021)
   Role: Cloud-native microservices development for enterprise client
   
   Tech Stack: Azure, Spring Boot, Kubernetes, Kafka, Spring Batch, Docker
   
   🎯 Key Work:
   • Built microservices architecture on Microsoft Azure
   • Developed Kafka-based event streaming pipelines
   • Used KITT (Kubernetes In The Trenches) for cluster troubleshooting
   • Implemented Spring Batch for data processing
   • Achieved 10% increase in operational efficiency

3️⃣ Big Data Developer @ Cognizant (May 2018 - Nov 2019)
   Role: Insurance client data migration and big data platform development
   
   Tech Stack: Scala, Hadoop, Sqoop, HBase, Solr, Kafka, Spring Boot
   
   🎯 Key Achievements:
   • Migrated 5TB+ data using Sqoop-based ETL pipelines
   • Developed Scala application for HBase and Solr data loading
   • Built Spring Boot REST APIs serving 100+ customer care executives
   • Query Performance: 60% faster queries vs traditional MySQL
   • Optimized Solr facets reducing search time by 30%

4️⃣ IoT Developer @ TCS (Oct 2015 - May 2018)
   Role: Industrial IoT platform development and maintenance
   
   Tech Stack: Java, MQTT (Mosquitto), Kafka, Spark, HBase, AngularJS, D3.js
   
   🎯 Key Achievements:
   • Built IoT data ingestion system for 100+ industrial devices
   • Implemented MQTT broker with Eclipse Mosquitto
   • Real-time analytics with Kafka and Spark
   • Predictive analytics: Reduced equipment downtime by 35%
   • Developed monitoring dashboard with AngularJS and D3.js
   • Created Device Management System (DMSS) for industrial IoT devices

TECHNICAL SKILLS:
- Programming Languages: Java, Python (Basic), JavaScript, Shell Scripts, SQL
- Operating Systems: Mac, Linux
- Databases: MySQL, PostgreSQL, Snowflake, HBase
- Database Version Control: Liquibase
- Code Version Control: Git, Bitbucket
- Logging: Splunk, AWS CloudWatch
- Monitoring: Dynatrace, Datadog
- Servers: Tomcat, WildFly
- Build Tools: Maven
- DevOps: Docker, Kubernetes, Jenkins
- Frameworks: Spring Boot, Hibernate
- IoT Queueing: eMqttd, Mosquitto, PAHO
- Code Analysis: SonarQube, Checkstyle, PMD, SpotBugs
- Tracking: JIRA
- Cloud: AWS Services, Snowflake, Client
- Native Clouds
- BigData: Kafka, Hbase, Sqoop, Solr, Spark, Airflow

CORE COMPETENCIES:
- Application Development
- Cloud Architecture
- Data Integration Strategies
- Big Data/ Data Migration
- IoT Implementation
- Connected Smart Systems
- Agile/ Waterfall Methodologies
- Technical Roadmapping
- Requirement Gathering & Analysis
- Real-Time Data Processing/ Streaming
- Predictive Analytics
- Production Support
- Stakeholder Engagement
- Team Leadership & Mentoring

🚀 MAJOR PROJECTS:

1️⃣ Databridge - Enterprise Data Integration Platform (Current - Dentsu)
   Industry: AdTech | Scale: Enterprise-level identity solution
   
   📊 Project Scope:
   • Core component of Dentsu's Merkury identity resolution platform
   • Manages entire data ingestion and publishing pipeline
   • Multi-destination support: SFTP, S3, API Endpoints, Snowflake Direct Connect
   • Processes 100TB+ data daily with 99.9% accuracy
   
   💡 Impact:
   • 90% reduction in failed publish waiting time through automation
   • Automated workflow rerun system via REST APIs
   • Enhanced security with private key authentication
   
   🛠️ Tech Stack: Java 17, Spring Boot 3, Snowflake, AWS (SWF, API Gateway, Lambda, 
                  S3, SQS, SNS), Python, Airflow, Datadog

2️⃣ Retail Cloud Migration - Azure Transformation (Cognizant)
   Industry: Retail Finance | Migration Scale: Enterprise systems
   
   📊 Project Scope:
   • Migrated mainframe financial systems to Microsoft Azure
   • Zero-downtime migration strategy with cost optimization
   • Database versioning with Liquibase
   
   💡 Impact:
   • 99.9% uptime maintained during migration
   • 10% operational efficiency increase
   • Significant cloud cost reduction
   • 50% reduction in post-deployment issues through automated testing
   
   🛠️ Tech Stack: Azure, Spring Boot, Spring Batch, MySQL, Liquibase, Docker

3️⃣ Big Data Migration - Insurance Platform (Cognizant)
   Industry: Insurance | Data Scale: 5TB+ migration
   
   📊 Project Scope:
   • Migrated legacy MySQL data (5TB+) to Hadoop ecosystem
   • Built Scala applications for data loading into HBase and Solr
   • REST API platform for 100+ customer service agents
   
   💡 Impact:
   • 60% faster query performance vs traditional MySQL
   • 30% reduction in search time through Solr optimization
   • Enabled real-time data access for customer service operations
   
   🛠️ Tech Stack: Scala, Hadoop, Sqoop, HBase, Solr, Kafka, Spring Boot, Spark

4️⃣ IoT Analytics Platform - Industrial Monitoring (TCS)
   Industry: Industrial IoT | Device Scale: 10,000+ connected devices
   
   📊 Project Scope:
   • Real-time data processing from industrial IoT sensors
   • MQTT-based device communication infrastructure
   • Predictive maintenance and analytics engine
   • Real-time monitoring dashboard
   
   💡 Impact:
   • 35% reduction in equipment downtime through predictive analytics
   • Real-time alerting and notification system
   • Device Management System (DMSS) for industrial deployments
   • 50% processing time reduction using in-memory tables
   
   🛠️ Tech Stack: Java, MQTT (Mosquitto), Kafka, Spark, HBase, Cassandra, 
                  AngularJS, D3.js

CERTIFICATIONS:
- SnowPro Associate Platform Certified
- Oracle Certified Java Programmer SE6
- Awarded Interviewer pro certification from Dentsu Global Services
- ITIL Foundation Certified Professional
- Generative AI Fundamentals
- AI in the Workplace Specialization
- Artificial Intelligence and Machine Learning

ACHIEVEMENTS:
- Reduced system latency by 40% using Redis
- Processed 5TB+ data with 99.9% accuracy
- Led teams of 5+ developers
- Improved database query performance by 60%
- 90% reduction in waiting time for failed publishes
- Implemented a monitoring system using Datadog, which improved incident response times by 50%, ensuring higher service availability for clients.
- Drove trainings for new hires focused on AWS and Snowflake best practices, achieving a 25% reduction in onboarding time and increased team productivity.
- Implemented a 100% automated workflow rerun process through REST API endpoints accessible to the Operations team.
- Spearheaded integration of automated scripts for copying artifacts within S3 in deployment pipelines using Jenkins, reducing deployment times by 20% and minimizing human error during releases.
- Successfully migrated 2 projects to cloud platforms, resulting in a 10% increase in operational efficiency and significant cost reduction.
- Developed automated testing suites that improved application reliability, reducing post-deployment issues by 50%.
- Optimized Apache Solr facets, reducing search time by 30%.
- Introduced in-memory tables instead of querying HBase for Spark processing, reducing processing time by 50% and receiving formal appreciation.

📋 RESPONSE GUIDELINES:

STRUCTURE YOUR RESPONSES:
1. Start with a direct answer to the question
2. Provide 2-3 specific examples or details
3. Include relevant metrics or achievements when applicable
4. End with a helpful next step or call-to-action

TONE & STYLE:
✅ DO:
• Be enthusiastic about Ramji's accomplishments
• Use "Ramji" or "he" (not "I" - you're his assistant, not him)
• Highlight quantifiable achievements (percentages, time saved, scale)
• Match technical depth to the question's complexity
• Use emojis strategically for visual breaks (max 3-4 per response)

❌ DON'T:
• Pretend to be Ramji speaking directly
• Make up information not in this prompt
• Use overly salesy or promotional language
• Ignore the context of previous messages
• Exceed 300 words per response

SPECIFIC SCENARIOS:

🎯 Technical Questions:
• Mention specific technologies and versions
• Include project context where he used them
• Share measurable outcomes (performance improvements, scale)
• Example: "Ramji has deep Java expertise, working with versions 8 through 17..."

💼 Career/Experience Questions:
• Highlight progression and growth
• Mention leadership and mentoring experience
• Include team sizes and methodologies
• Example: "Over his 12+ years, Ramji has grown from Developer to Technical Lead..."

🚀 Project Questions:
• Describe business impact and scale
• Mention technologies and architecture
• Share metrics (data volume, users, performance gains)
• Example: "In the Databridge project, Ramji built a system processing 100TB+ daily..."

🏆 Skills/Expertise Questions:
• Categorize by domain (Backend, Cloud, Big Data, etc.)
• Mention proficiency level and years of experience
• Give real project examples
• Example: "Ramji's cloud expertise centers on AWS and Azure, where he's..."

💬 Contact/Hiring Questions:
• Encourage using the contact form on this website
• Mention LinkedIn for professional networking: ${LINKEDIN_PROFILE}
• Note his location (Coimbatore, India) and current role
• Example: "Interested in connecting with Ramji? The easiest way is..."

❓ Unknown/Unclear Questions:
• Be honest about limitations
• Suggest checking his LinkedIn profile or contact form
• Offer to answer related questions you DO know
• Example: "I don't have that specific information, but I can tell you about..."

🌟 CONVERSATION STARTERS (if user is vague):
• "Are you interested in Ramji's technical skills, project experience, or career journey?"
• "I can tell you about his work in AdTech, Big Data, IoT, or Cloud architecture - what interests you?"
• "Would you like to know about specific technologies he works with, or his leadership experience?"

LINKEDIN & CONTACT ROUTING:
• For detailed resume/CV → "Check his LinkedIn: ${LINKEDIN_PROFILE}"
• For professional networking → "Connect on LinkedIn: ${LINKEDIN_PROFILE}"
• For job opportunities → "Use the contact form below or reach out via LinkedIn"
• For endorsements/recommendations → "Visit his LinkedIn profile"
• For technical discussions → "Feel free to ask me here, or reach out through the contact form"

KEEP IT CONVERSATIONAL:
• Ask follow-up questions when appropriate
• Reference previous messages in the conversation
• Use transitions like "Building on that..." or "Speaking of..."
• End with engagement: "Would you like to know more about..." or "Any other questions about..."

Remember: You're Ramji's helpful AI assistant, not Ramji himself. Represent him professionally while being approachable and informative!`;

// Primary AI function using Groq (free tier: 14,400 requests/day, super fast!)
async function callGroqAPI(messages) {
  console.log('[GROQ] 🚀 Attempting Groq API call...');
  console.log('[GROQ] API Key present:', !!GROQ_API_KEY);
  console.log('[GROQ] API Key length:', GROQ_API_KEY?.length || 0);

  try {
    // Groq uses OpenAI-compatible API format - super easy!
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Latest Groq model (Nov 2024), high quality and fast
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    console.log('[GROQ] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GROQ] ❌ API Error Response:', errorText);
      throw new Error(`Groq API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[GROQ] ✅ Response received');
    console.log('[GROQ] Tokens used:', data.usage?.total_tokens || 0);

    const result = data.choices[0].message.content;
    console.log('[GROQ] ✅ Reply length:', result.length);

    return result;
  } catch (error) {
    console.error('[GROQ] ❌ Exception:', error.message);
    throw error;
  }
}

// Fallback AI function using OpenAI (backup when Groq fails)
async function callOpenAI(messages) {
  console.log('[OPENAI] 🔄 Attempting OpenAI API call as fallback...');
  console.log('[OPENAI] API Key present:', !!OPENAI_API_KEY);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      })
    });

    console.log('[OPENAI] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OPENAI] ❌ API Error Response:', errorText);
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[OPENAI] ✅ Response received');
    console.log('[OPENAI] Tokens used:', data.usage?.total_tokens || 0);

    return {
      reply: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error('[OPENAI] ❌ Exception:', error.message);
    throw error;
  }
}

// Helper: Parse browser/device info from user-agent
function parseBrowserInfo(userAgent) {
  if (!userAgent || userAgent === 'unknown') return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };

  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Unknown';

  // Browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) browser = 'IE';

  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  // Device detection
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'Mobile';
  else if (userAgent.includes('iPad')) device = 'Tablet';
  else if (userAgent.includes('Bot') || userAgent.includes('bot') || userAgent.includes('Crawler')) device = 'Bot/Crawler';
  else device = 'Desktop';

  return { browser, os, device };
}

// Helper: Detect geolocation from IP (basic)
function detectGeolocation(ip) {
  // Note: This is basic detection. For production, use a real geolocation service like MaxMind, IP2Location, or ipapi
  // Common IP ranges for reference (simplified)
  if (ip.startsWith('127.') || ip === 'localhost') return { country: 'Local', city: 'Localhost', isp: 'Localhost' };
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) return { country: 'Private', city: 'Internal Network', isp: 'Private Network' };

  // For now, return generic response - in production use a real API
  return { country: 'Detecting...', city: 'Unknown', isp: 'Unknown (use MaxMind/ipapi for real data)' };
}

// Helper: Simple in-memory rate limiter by IP (for demo purposes)
const ipRequestMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 20; // Max 20 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const ipData = ipRequestMap.get(ip) || { requests: [], blocked: false };

  // Clean old requests outside the window
  ipData.requests = ipData.requests.filter(time => now - time < RATE_LIMIT_WINDOW_MS);

  // Check if rate limited
  if (ipData.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipData.blocked = true;
    return { limited: true, count: ipData.requests.length, limit: RATE_LIMIT_MAX_REQUESTS };
  }

  // Add current request
  ipData.requests.push(now);
  ipData.blocked = false;
  ipRequestMap.set(ip, ipData);

  return { limited: false, count: ipData.requests.length, limit: RATE_LIMIT_MAX_REQUESTS };
}

// Helper: Calculate request body size
function getRequestBodySize(req) {
  const contentLength = req.headers['content-length'];
  if (contentLength) return `${contentLength} bytes`;

  // Rough estimate if content-length not provided
  if (req.body) {
    const size = JSON.stringify(req.body).length;
    return `~${size} bytes (estimated)`;
  }
  return 'Unknown';
}

// Generate unique request ID for tracking
function generateRequestId() {
  return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default async function handler(req, res) {
  // Generate unique request ID for tracking
  const requestId = generateRequestId();

  // Log incoming request with comprehensive user information
  const userIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const referer = req.headers['referer'] || 'direct';
  const host = req.headers['host'] || 'unknown';
  const userId = req.headers['x-user-id'] || req.body?.userId || 'anonymous';

  // Parse browser/device info
  const browserInfo = parseBrowserInfo(userAgent);

  // Get geolocation from IP
  const geolocation = detectGeolocation(userIP);

  // Check request body size
  const bodySize = getRequestBodySize(req);

  // Check rate limiting
  const rateLimitCheck = checkRateLimit(userIP);

  console.log(`[API] ✅ Incoming ${req.method} request [ID: ${requestId}]`, {
    requestId: requestId,
    origin: req.headers.origin || 'unknown',
    userIP: userIP,
    userAgent: userAgent,
    browser: browserInfo.browser,
    os: browserInfo.os,
    device: browserInfo.device,
    geolocation: geolocation,
    referer: referer,
    host: host,
    userId: userId,
    requestBodySize: bodySize,
    rateLimit: {
      isLimited: rateLimitCheck.limited,
      requestCount: rateLimitCheck.count,
      limit: rateLimitCheck.limit,
      windowMs: RATE_LIMIT_WINDOW_MS
    },
    timestamp: new Date().toISOString()
  });

  // Block if rate limited
  if (rateLimitCheck.limited) {
    console.warn(`[API] ⚠️ RATE LIMITED - IP: ${userIP}, RequestID: ${requestId}, Requests in window: ${rateLimitCheck.count}`);
    return res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Max ${RATE_LIMIT_MAX_REQUESTS} requests per minute.`,
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      requestId: requestId
    });
  }

  // Add request ID to response headers for tracking
  res.setHeader('X-Request-ID', requestId);

  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`[API] ✅ Handling OPTIONS preflight request [ID: ${requestId}] - CORS headers set`);
    return res.status(200).end();
  }

  // Only allow POST requests for actual API calls
  if (req.method !== 'POST') {
    console.log(`[API] ❌ Method not allowed [ID: ${requestId}]:`, req.method);
    return res.status(405).json({ error: 'Method not allowed. Use POST.', requestId: requestId });
  }

  console.log(`[API] ✅ Processing POST request [ID: ${requestId}]`);

  try {
    const { message, conversationHistory = [] } = req.body;

    // Validate input
    if (!message || message.trim().length === 0) {
      console.warn(`[API] ⚠️ Empty message received [ID: ${requestId}] from IP: ${userIP}`);
      return res.status(400).json({ error: 'Message is required', requestId: requestId });
    }

    // Log the actual user query
    console.log(`[API] 📝 User Query Received [ID: ${requestId}]`, {
      requestId: requestId,
      userIP: userIP,
      userId: userId,
      message: message.trim(),
      messageLength: message.length,
      conversationHistoryLength: conversationHistory.length,
      conversationHistory: conversationHistory.map((msg, idx) => ({
        index: idx,
        role: msg.role,
        contentLength: msg.content?.length || 0,
        contentPreview: msg.content?.substring(0, 100) + (msg.content?.length > 100 ? '...' : '')
      })),
      timestamp: new Date().toISOString()
    });

    // Limit message length
    if (message.length > 500) {
      console.warn(`[API] ⚠️ Message too long [ID: ${requestId}] - Length: ${message.length} bytes`);
      return res.status(400).json({
        error: 'Message too long. Max 500 characters.',
        requestId: requestId,
        receivedLength: message.length
      });
    }

    // Check if at least one AI provider is configured
    if (!GROQ_API_KEY && !OPENAI_API_KEY) {
      console.error(`[API] ❌ No AI providers configured [ID: ${requestId}] - need GROQ_API_KEY or OPENAI_API_KEY`);
      return res.status(500).json({
        error: 'Service temporarily unavailable',
        fallback: true,
        reply: "I'm currently in offline mode. Please try again later or use the contact form below.",
        requestId: requestId
      });
    }

    console.log(`[API] ✅ AI providers available [ID: ${requestId}]`, {
      groq: !!GROQ_API_KEY,
      openai: !!OPENAI_API_KEY
    });

    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      // Include last 4 messages from history for context
      ...conversationHistory.slice(-4),
      {
        role: 'user',
        content: message.trim()
      }
    ];

    console.log('[API] 🎯 Starting AI request cascade: Groq → OpenAI → Fallback');

    let reply;
    let tokensUsed = 0;
    let provider = 'Unknown';

    // PRIORITY 1: Try Groq first (FREE, fast, 14,400 requests/day)
    if (GROQ_API_KEY) {
      try {
        console.log('[API] 🚀 Attempting Groq (Primary)...');
        console.log('[API] 🔑 Groq API Key length:', GROQ_API_KEY?.length || 0);
        console.log('[API] 🔑 Groq API Key prefix:', GROQ_API_KEY?.substring(0, 10) + '...');
        reply = await callGroqAPI(messages);
        provider = 'Groq';
        console.log('[API] ✅ Groq success!');
      } catch (groqError) {
        console.error('[API] ❌ Groq failed:', groqError.message);
        console.error('[API] 🔍 Groq error stack:', groqError.stack);

        // PRIORITY 2: Try OpenAI as fallback
        if (OPENAI_API_KEY) {
          try {
            console.log('[API] 🔄 Groq failed, trying OpenAI (Secondary)...');
            console.log('[API] 🔑 OpenAI API Key length:', OPENAI_API_KEY?.length || 0);
            console.log('[API] 🔑 OpenAI API Key prefix:', OPENAI_API_KEY?.substring(0, 10) + '...');
            const openaiResult = await callOpenAI(messages);
            reply = openaiResult.reply;
            tokensUsed = openaiResult.tokensUsed;
            provider = 'OpenAI';
            console.log('[API] ✅ OpenAI fallback success!');
          } catch (openaiError) {
            console.error('[API] ❌ OpenAI also failed:', openaiError.message);
            console.error('[API] 🔍 OpenAI error stack:', openaiError.stack);
            // Will use local fallback
          }
        } else {
          console.log('[API] ⚠️ No OpenAI key available for fallback');
        }
      }
    }
    // If no Groq key, try OpenAI directly
    else if (OPENAI_API_KEY) {
      try {
        console.log('[API] 🔄 No Groq key, trying OpenAI directly...');
        console.log('[API] 🔑 OpenAI API Key length:', OPENAI_API_KEY?.length || 0);
        const openaiResult = await callOpenAI(messages);
        reply = openaiResult.reply;
        tokensUsed = openaiResult.tokensUsed;
        provider = 'OpenAI';
        console.log('[API] ✅ OpenAI success!');
      } catch (openaiError) {
        console.error('[API] ❌ OpenAI failed:', openaiError.message);
        console.error('[API] 🔍 OpenAI error stack:', openaiError.stack);
        // Will use local fallback
      }
    }

    // If we got a response, return it
    if (reply) {
      const responseSize = JSON.stringify(reply).length;
      console.log(`[API] ✅ Response Generated [ID: ${requestId}]`, {
        requestId: requestId,
        userIP: userIP,
        userId: userId,
        provider: provider,
        tokensUsed: tokensUsed,
        responseLength: reply.length,
        responseSize: `${responseSize} bytes`,
        responsePreview: reply.substring(0, 150) + (reply.length > 150 ? '...' : ''),
        processingTime: 'See response headers',
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        requestId: requestId,
        reply: reply,
        tokensUsed: tokensUsed,
        provider: provider
      });
    }

    // PRIORITY 3: All AI providers failed, throw error to trigger fallback
    console.error(`[API] ❌ All AI providers failed [ID: ${requestId}], returning fallback response`);
    console.error(`[API] 🔍 Groq available: ${!!GROQ_API_KEY}, OpenAI available: ${!!OPENAI_API_KEY}`);
    throw new Error('All AI providers unavailable');

  } catch (error) {
    console.error(`[API] ❌ Chat API Error [ID: ${requestId}]:`, error.message);
    console.error(`[API] 🔍 Error details:`, {
      requestId: requestId,
      userIP: userIP,
      userId: userId,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Return fallback response
    return res.status(500).json({
      requestId: requestId,
      error: 'Failed to generate response',
      message: error.message,
      fallback: true,
      reply: "I'm having trouble connecting right now. Please try again in a moment, or use the contact form below to reach Ramji directly."
    });
  }
}

