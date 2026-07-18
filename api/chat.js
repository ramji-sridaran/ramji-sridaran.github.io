// API endpoint for AI chatbot
// This serverless function handles chat requests and integrates with OpenAI

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Free tier: 14,400 requests/day, super fast!

const LINKEDIN_PROFILE = 'https://www.linkedin.com/in/ramji-sridaran/';
const EXPERIENCE_START_DATE = new Date(2013, 4, 1); // May 2013

function getDynamicExperienceYearsPlus(referenceDate = new Date()) {
    let years = referenceDate.getFullYear() - EXPERIENCE_START_DATE.getFullYear();
    const monthDelta = referenceDate.getMonth() - EXPERIENCE_START_DATE.getMonth();
    const dayDelta = referenceDate.getDate() - EXPERIENCE_START_DATE.getDate();
    if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) years -= 1;
    return `${Math.max(years, 0)}+`;
}

const EXPERIENCE_YEARS = `${getDynamicExperienceYearsPlus()} years`;

const SYSTEM_PROMPT = `You are Ramji Sridaran's AI assistant for his personal portfolio.

Rules:
- Be accurate, concise, and professional.
- Speak about Ramji in third person ("Ramji"/"he"), never as "I".
- If unknown, say so and direct user to LinkedIn/contact form.
- Use bullets for multi-point answers.
- Keep most answers within 120-220 words unless user asks for deep detail.

Profile:
- Location: Coimbatore, India
- LinkedIn: ${LINKEDIN_PROFILE}
- Experience: ${EXPERIENCE_YEARS} in enterprise software engineering
- Strengths: Java backend systems, cloud-native architecture, data platforms, automation

Career timeline:
- Senior Software Engineer, Concentrix Catalyst (Jan 2026–Jul 2026): Enterprise banking/trade-finance workflows, Java enhancements, REST APIs, Kubernetes, Argo Workflows.
- Technical Lead, Dentsu Global Services (Jun 2021–Dec 2025): Led 5 engineers on AdTech identity/data platform; Java/Spring/AWS/Snowflake modernization.
- Java/Cloud Developer, Cognizant (Oct 2020–May 2021): Cloud migration and Spring Batch/Kafka-based data workflows.
- Big Data Developer, Cognizant (May 2018–Sep 2020): Data migration, HBase/Solr pipelines, Scala/Spark/Sqoop.
- IoT Developer, TCS (Sep 2015–May 2018): MQTT/Kafka/Spark IoT analytics and monitoring.

Projects (with per-project tech stack):
- Remote Chiller Monitoring / IoT Analytics (TCS, Sep 2015–May 2018): Real-time smart-building IoT platform for Intel offices. Streams and analyzes sensor telemetry in near real-time. Stack: Java, Spring Boot, REST APIs, Kafka, MQTT, PostgreSQL, Redis, Spark, HBase, Maven, Tomcat.
- Data Migration into Big Data (Cognizant, May 2018–Sep 2020): Migrates enterprise data from legacy RDBMS into Hadoop/HBase ecosystem using Informatica CDC feeds. Stack: Sqoop, Scala, Spark, HBase, Shell Script, Hadoop.
- MF2C / Retail Cloud Migration (Cognizant, Oct 2020–May 2021): Mainframe-to-cloud modernization using Kafka + Spring Batch for critical daily financial file processing across Azure and client-native clouds. Stack: Java, Spring Batch, Liquibase, MySQL, Kafka, KITT, Kubernetes, Splunk, Dynatrace.
- Databridge (AdTech, Dentsu, Jun 2021–Dec 2025): Large-scale audience data platform on AWS + Snowflake; led 5-member team; high-volume identity/data ingestion and publishing; CI/CD with Jenkins and Kubernetes. Stack: Java, Spring Boot, REST APIs, Snowflake, AWS, MySQL, Redis, Jenkins, Wildfly, Datadog, Kubernetes.
- Enterprise Banking & Trade Finance (Concentrix Catalyst, Jan 2026–Jul 2026): Enterprise banking and trade-finance workflow enhancements; Java services, REST integrations, workflow automation. Stack: Java, Spring Boot, REST APIs, Kubernetes, Argo Workflows, Cloud-Native.
- Portfolio AI Chatbot (Personal, 2025–present): Groq-first (llama-3.3-70b-versatile), OpenAI fallback (gpt-4o-mini), graceful static fallback, FAQ cache, rate limiting. Stack: Node.js, Vercel Serverless, JavaScript, Groq AI, OpenAI, REST APIs.

Key technologies (cross-project):
- Languages: Java 17, Scala, Python, JavaScript, SQL, Shell Script
- Frameworks: Spring Boot, Spring Batch, REST APIs, Microservices
- Cloud: AWS, Azure, Snowflake, Vercel
- Data: Kafka, Spark, HBase, Hadoop, Sqoop, Solr, MySQL, PostgreSQL, Redis
- DevOps: Docker, Kubernetes, Argo Workflows, Jenkins, CI/CD
- Observability: Datadog, Splunk, Dynatrace, Liquibase

Response behavior:
- For skills/questions, map answer to real projects and outcomes.
- For hiring/contact, suggest contact form and LinkedIn.
- Do not invent employers, dates, metrics, or certifications beyond this context.`;

const AI_TIMEOUT_MS = 18000;
const FAQ_CACHE_TTL_MS = 5 * 60 * 1000;
const faqResponseCache = new Map();

async function fetchWithTimeout(url, options = {}, timeoutMs = AI_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Primary AI function using Groq (free tier: 14,400 requests/day, super fast!)
async function callGroqAPI(messages) {
  console.log('[GROQ] 🚀 Attempting Groq API call...');

  try {
    // Groq uses OpenAI-compatible API format - super easy!
    const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
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
    }, AI_TIMEOUT_MS);

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

  try {
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
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
    }, AI_TIMEOUT_MS);

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
const RATE_LIMIT_MAX_REQUESTS = 25; // max requests/minute per IP
const RATE_LIMIT_BURST_WINDOW_MS = 10000; // 10-second window
const RATE_LIMIT_BURST_MAX_REQUESTS = 8; // max burst requests/10s per IP
const RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000; // 2-minute cooldown on repeated abuse

function checkRateLimit(ip) {
  const now = Date.now();
  const ipData = ipRequestMap.get(ip) || { requests: [], burst: [], blockedUntil: 0 };

  if (ipData.blockedUntil > now) {
    return {
      limited: true,
      reason: 'cooldown',
      count: ipData.requests.length,
      limit: RATE_LIMIT_MAX_REQUESTS,
      retryAfter: Math.ceil((ipData.blockedUntil - now) / 1000)
    };
  }

  // Clean old requests outside the window
  ipData.requests = ipData.requests.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
  ipData.burst = ipData.burst.filter(time => now - time < RATE_LIMIT_BURST_WINDOW_MS);

  // Burst limiter
  if (ipData.burst.length >= RATE_LIMIT_BURST_MAX_REQUESTS) {
    ipData.blockedUntil = now + RATE_LIMIT_COOLDOWN_MS;
    ipRequestMap.set(ip, ipData);
    return {
      limited: true,
      reason: 'burst',
      count: ipData.burst.length,
      limit: RATE_LIMIT_BURST_MAX_REQUESTS,
      retryAfter: Math.ceil(RATE_LIMIT_COOLDOWN_MS / 1000)
    };
  }

  // Minute limiter
  if (ipData.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      reason: 'window',
      count: ipData.requests.length,
      limit: RATE_LIMIT_MAX_REQUESTS,
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    };
  }

  // Add current request
  ipData.requests.push(now);
  ipData.burst.push(now);
  ipData.blockedUntil = 0;
  ipRequestMap.set(ip, ipData);

  return {
    limited: false,
    reason: 'ok',
    count: ipData.requests.length,
    limit: RATE_LIMIT_MAX_REQUESTS,
    burstCount: ipData.burst.length,
    burstLimit: RATE_LIMIT_BURST_MAX_REQUESTS,
    retryAfter: 0
  };
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

function normalizeMessageForCache(message) {
  return message.toLowerCase().replace(/\s+/g, ' ').trim();
}

function getCachedFaqResponse(message) {
  const key = normalizeMessageForCache(message);
  const entry = faqResponseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > FAQ_CACHE_TTL_MS) {
    faqResponseCache.delete(key);
    return null;
  }
  return entry;
}

function setCachedFaqResponse(message, payload) {
  const key = normalizeMessageForCache(message);
  faqResponseCache.set(key, {
    ...payload,
    cachedAt: Date.now()
  });
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

  console.log(`[API] ✅ Incoming ${req.method} [${requestId}]`, {
    requestId,
    userIP,
    browser: browserInfo.browser,
    os: browserInfo.os,
    device: browserInfo.device,
    requestBodySize: bodySize,
    rateLimit: {
      limited: rateLimitCheck.limited,
      reason: rateLimitCheck.reason,
      count: rateLimitCheck.count,
      limit: rateLimitCheck.limit
    }
  });

  // Block if rate limited
  if (rateLimitCheck.limited) {
    console.warn(`[API] ⚠️ RATE LIMITED [${requestId}]`, {
      userIP,
      reason: rateLimitCheck.reason,
      count: rateLimitCheck.count,
      limit: rateLimitCheck.limit,
      retryAfter: rateLimitCheck.retryAfter
    });
    return res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded (${rateLimitCheck.reason}).`,
      retryAfter: rateLimitCheck.retryAfter,
      requestId
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

    console.log(`[API] 📝 Query received [${requestId}]`, {
      requestId,
      userIP,
      userId,
      messageLength: message.length,
      conversationHistoryLength: conversationHistory.length
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
        requestId: requestId,
        provider: 'Local Fallback',
        providerMeta: {
          primary: 'Groq',
          active: 'Local Fallback',
          groqStatus: 'not_configured',
          groqFailure: null,
          openaiUsed: false
        }
      });
    }

    console.log(`[API] ✅ AI providers available [ID: ${requestId}]`, {
      groq: !!GROQ_API_KEY,
      openai: !!OPENAI_API_KEY
    });

    // Cache only straightforward FAQ-style queries (no prior conversation context)
    const cacheEligible = conversationHistory.length === 0 && message.trim().length <= 180;
    if (cacheEligible) {
      const cached = getCachedFaqResponse(message);
      if (cached) {
        console.log(`[API] ⚡ Cache hit [${requestId}]`, { provider: cached.provider });
        return res.status(200).json({
          requestId,
          reply: cached.reply,
          tokensUsed: 0,
          provider: 'Cache',
          providerMeta: {
            primary: 'Groq',
            active: 'Cache',
            cacheSource: cached.provider,
            groqStatus: 'not_attempted',
            groqFailure: null,
            openaiUsed: cached.provider === 'OpenAI'
          }
        });
      }
    }

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
    let groqStatus = GROQ_API_KEY ? 'pending' : 'not_configured';
    let groqFailure = '';

    // PRIORITY 1: Try Groq first (FREE, fast, 14,400 requests/day)
    if (GROQ_API_KEY) {
      try {
        console.log('[API] 🚀 Attempting Groq (Primary)...');
        reply = await callGroqAPI(messages);
        provider = 'Groq';
        groqStatus = 'success';
        console.log('[API] ✅ Groq success!');
      } catch (groqError) {
        console.error('[API] ❌ Groq failed:', groqError.message);
        console.error('[API] 🔍 Groq error stack:', groqError.stack);
        groqStatus = 'failed';
        groqFailure = groqError.message;

        // PRIORITY 2: Try OpenAI as fallback
        if (OPENAI_API_KEY) {
          try {
            console.log('[API] 🔄 Groq failed, trying OpenAI (Secondary)...');
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

      if (cacheEligible) {
        setCachedFaqResponse(message, {
          reply,
          provider
        });
      }

      return res.status(200).json({
        requestId: requestId,
        reply: reply,
        tokensUsed: tokensUsed,
        provider: provider,
        providerMeta: {
          primary: 'Groq',
          active: provider,
          groqStatus: groqStatus,
          groqFailure: groqFailure || null,
          openaiUsed: provider === 'OpenAI'
        }
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
      reply: "I'm having trouble connecting right now. Please try again in a moment, or use the contact form below to reach Ramji directly.",
      provider: 'Local Fallback',
      providerMeta: {
        primary: 'Groq',
        active: 'Local Fallback',
        groqStatus: groqStatus,
        groqFailure: groqFailure || null,
        openaiUsed: false
      }
    });
  }
}
