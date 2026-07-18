/* ==========================================
   AI CHATBOT ASSISTANT - OPENAI INTEGRATED
   ========================================== */

const CHATBOT_EXPERIENCE_START_DATE = new Date(2013, 4, 1); // May 2013

function getChatbotExperienceYearsPlus(referenceDate = new Date()) {
    if (window.PORTFOLIO_EXPERIENCE_YEARS) return window.PORTFOLIO_EXPERIENCE_YEARS;
    let years = referenceDate.getFullYear() - CHATBOT_EXPERIENCE_START_DATE.getFullYear();
    const monthDelta = referenceDate.getMonth() - CHATBOT_EXPERIENCE_START_DATE.getMonth();
    const dayDelta = referenceDate.getDate() - CHATBOT_EXPERIENCE_START_DATE.getDate();
    if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) years -= 1;
    return `${Math.max(years, 0)}+`;
}

// AI Chatbot Class with OpenAI Integration
class AIChatbot {
    constructor() {
        // Auto-detect API endpoint based on current domain
        // If on Vercel, use relative path; if on GitHub Pages, use Vercel URL
        const currentDomain = window.location.hostname;

        if (currentDomain.includes('vercel.app')) {
            // On Vercel - use relative path (faster, same domain)
            this.apiEndpoint = '/api/chat';
        } else if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
            // Local development
            this.apiEndpoint = 'http://localhost:3000/api/chat';
        } else {
            // GitHub Pages or any other domain - use absolute Vercel URL
            this.apiEndpoint = 'https://ramji-sridaran.vercel.app/api/chat';
        }

        console.log('🌐 [CHATBOT] Current domain:', currentDomain);
        console.log('📍 [CHATBOT] API Endpoint:', this.apiEndpoint);

        this.conversationHistory = [];
        this.isProcessing = false;
    }

    async fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
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

    async sendMessage(userMessage) {
        if (this.isProcessing) {
            return { text: "⏳ Please wait for the current response..." };
        }

        try {
            this.isProcessing = true;

            // LOG: API call starting
            console.log('🚀 [CHATBOT] Initiating API call...');
            console.log('📍 [CHATBOT] API Endpoint:', this.apiEndpoint);
            console.log('💬 [CHATBOT] User Message:', userMessage);
            console.log('📜 [CHATBOT] Conversation History Length:', this.conversationHistory.length);

            const requestBody = {
                message: userMessage,
                conversationHistory: this.conversationHistory
            };

            console.log('📦 [CHATBOT] Request Body:', JSON.stringify(requestBody, null, 2));

            // Call the serverless API
            const startTime = Date.now();
            const response = await this.fetchWithTimeout(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }, 15000);

            const elapsed = Date.now() - startTime;
            console.log(`⏱️ [CHATBOT] API Response Time: ${elapsed}ms`);
            console.log('📊 [CHATBOT] Response Status:', response.status, response.statusText);
            console.log('🔍 [CHATBOT] Response OK:', response.ok);

            if (!response.ok) {
                console.warn('⚠️ [CHATBOT] API returned non-OK status:', response.status);

                let errorData;
                try {
                    errorData = await response.json();
                    console.error('❌ [CHATBOT] Error Data:', JSON.stringify(errorData, null, 2));
                } catch (parseError) {
                    console.error('❌ [CHATBOT] Could not parse error response:', parseError);
                    const errorText = await response.text();
                    console.error('📄 [CHATBOT] Raw Error Text:', errorText);
                    errorData = {};
                }

                // Check if fallback mode is suggested
                if (errorData.fallback) {
                    console.log('🔄 [CHATBOT] API suggests fallback - using intelligent local response');
                    this.isProcessing = false;
                    // Use intelligent local fallback instead of generic server message
                    return {
                        text: this.getFallbackResponse(userMessage),
                        sourceLine: this.getProviderSourceLine(errorData.provider, errorData.providerMeta)
                    };
                }

                // Use fallback for any API error
                console.log('🔄 [CHATBOT] Using local fallback response due to API error');
                this.isProcessing = false;
                return {
                    text: this.getFallbackResponse(userMessage),
                    sourceLine: this.getProviderSourceLine('Local Fallback')
                };
            }

            // Parse successful response
            let data;
            try {
                data = await response.json();
                console.log('✅ [CHATBOT] API Success! Response Data:', JSON.stringify(data, null, 2));
                console.log('💡 [CHATBOT] AI Reply Length:', data.reply?.length || 0, 'characters');
                console.log('🔢 [CHATBOT] Tokens Used:', data.tokensUsed || 'N/A');
            } catch (parseError) {
                console.error('❌ [CHATBOT] Error parsing successful response:', parseError);
                const responseText = await response.text();
                console.error('📄 [CHATBOT] Raw Response Text:', responseText);
                throw new Error('Invalid JSON response from API');
            }

            // Store conversation history for context
            this.conversationHistory.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: data.reply }
            );

            // Keep only last 6 messages (3 exchanges) to manage token usage
            if (this.conversationHistory.length > 6) {
                this.conversationHistory = this.conversationHistory.slice(-6);
                console.log('✂️ [CHATBOT] Trimmed conversation history to last 6 messages');
            }

            this.isProcessing = false;
            console.log('✨ [CHATBOT] Successfully returning AI response');
            return {
                text: data.reply,
                sourceLine: this.getProviderSourceLine(data.provider, data.providerMeta)
            };

        } catch (error) {
            console.error('💥 [CHATBOT] CRITICAL ERROR:', error);
            console.error('📍 [CHATBOT] Error Name:', error.name);
            console.error('📝 [CHATBOT] Error Message:', error.message);
            console.error('🔍 [CHATBOT] Error Stack:', error.stack);

            // Check for specific error types
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.error('🌐 [CHATBOT] Network Error - Possible causes:');
                console.error('   1. API endpoint is unreachable');
                console.error('   2. CORS issue');
                console.error('   3. Server is down');
                console.error('   4. No internet connection');
                console.error('   ℹ️  Check Network tab in DevTools for more details');
            } else if (error.name === 'AbortError') {
                console.error('⏱️ [CHATBOT] Request timed out (AbortController timeout)');
            } else if (error.name === 'SyntaxError') {
                console.error('📄 [CHATBOT] JSON Parse Error - API returned invalid JSON');
            } else if (error.message.includes('timeout')) {
                console.error('⏱️ [CHATBOT] Request Timeout - API took too long to respond');
            }

            this.isProcessing = false;
            console.log('🔄 [CHATBOT] Falling back to local rule-based response');
            return {
                text: this.getFallbackResponse(userMessage),
                sourceLine: this.getProviderSourceLine('Local Fallback')
            };
        }
    }

    getProviderSourceLine(provider, providerMeta = {}) {
        const activeProvider = providerMeta.active || provider || 'Unknown';
        if (activeProvider === 'DeepSeek') {
            return 'ℹ️ AI Source: DeepSeek V3';
        }
        if (activeProvider === 'Groq') {
            if (providerMeta.deepseekStatus === 'failed') {
                return 'ℹ️ AI Source: Groq (DeepSeek failed, fallback used)';
            }
            return 'ℹ️ AI Source: Groq';
        }
        if (activeProvider === 'OpenAI') {
            const failures = [];
            if (providerMeta.deepseekStatus === 'failed') failures.push('DeepSeek');
            if (providerMeta.groqStatus === 'failed') failures.push('Groq');
            if (failures.length) return `ℹ️ AI Source: OpenAI (${failures.join(' & ')} failed)`;
            return 'ℹ️ AI Source: OpenAI';
        }
        if (activeProvider === 'Cache') {
            const cacheSource = providerMeta.cacheSource || 'AI';
            return `ℹ️ AI Source: Cache (from ${cacheSource})`;
        }
        if (activeProvider === 'Local Fallback') {
            return 'ℹ️ AI Source: Local fallback (all providers unavailable)';
        }
        return `ℹ️ AI Source: ${activeProvider}`;
    }

    // Fallback to rule-based responses if API is unavailable
    getFallbackResponse(message) {
        const msg = message.toLowerCase();
        const experienceYears = `${getChatbotExperienceYearsPlus()} years`;

        // Greetings
        if (/^(hi|hello|hey|greetings)/i.test(msg)) {
            return `👋 Hello! I'm Ramji's assistant. I can tell you about his ${experienceYears} of hands-on enterprise engineering experience in Java, AWS, Spring Boot, and cloud-native architectures. What would you like to know?`;
        }

        // Experience
        if (/(experience|work|career|job|background)/i.test(msg)) {
            return `Ramji has ${experienceYears} of hands-on engineering experience:\n\n• Senior Software Engineer @ Concentrix Catalyst (Jan 2026–Jul 2026)\n• Technical Lead @ Dentsu (Jun 2021–Dec 2025)\n• Java/Cloud Developer @ Cognizant (Oct 2020–May 2021)\n• Big Data Developer @ Cognizant (May 2018–Sep 2020)\n• IoT Developer @ TCS (Sep 2015–May 2018)\n\nHe specializes in enterprise backend development, cloud-native architectures, and scalable Java applications.`;
        }

        // Skills
        if (/(skill|technology|tech|know|language)/i.test(msg)) {
            return "Ramji's key skills include:\n\n☁️ Cloud: AWS, Snowflake, Azure\n☕ Languages: Java 17, Python, Scala, SQL\n🚀 Frameworks: Spring Boot, Spring Batch, Hibernate\n📊 Data: Kafka, Spark, HBase, Hadoop, Sqoop, Redis, PostgreSQL, MySQL\n🐳 DevOps: Docker, Kubernetes, Jenkins, Argo Workflows";
        }

        // Redis
        if (/(redis)/i.test(msg)) {
            return "Ramji used Redis in two projects:\n\n• Remote Chiller Monitoring (TCS, IoT): Redis used for caching and real-time session/state management in the sensor telemetry pipeline.\n• Databridge (Dentsu, AdTech): Redis used for caching in the high-volume audience data platform on AWS.";
        }

        // Projects
        if (/(project|built|portfolio)/i.test(msg)) {
            return "Key projects:\n\n1. Remote Chiller Monitoring (TCS) — IoT platform: Java, Kafka, MQTT, Redis, Spark, HBase\n2. Data Migration into Big Data (Cognizant) — Hadoop/HBase pipeline: Sqoop, Scala, Spark\n3. MF2C / Retail Cloud Migration (Cognizant) — Mainframe-to-cloud: Spring Batch, Kafka, Azure\n4. Databridge (Dentsu) — AdTech data platform: Java, AWS, Snowflake, Redis, Kubernetes\n5. Enterprise Banking (Concentrix) — Trade-finance workflows: Java, Spring Boot, Argo Workflows\n\nWant details on any specific project?";
        }

        // AWS
        if (/(aws|amazon|cloud|lambda)/i.test(msg)) {
            return "Ramji has extensive AWS expertise including Elastic Beanstalk, Lambda, EC2, S3, SQS, SNS, and CloudFormation. He's architected serverless applications handling 50M+ requests daily and reduced cloud costs by 60% through optimization.";
        }

        // Snowflake
        if (/(snowflake|data warehouse)/i.test(msg)) {
            return "Ramji is SnowPro Core Certified and worked extensively with Snowflake Data Cloud at Dentsu (Jun 2021–Dec 2025). His Databridge project processed 100TB+ data daily with 99.9% accuracy. He implemented security enhancements and performance optimizations on the platform.";
        }

        // Contact
        if (/(contact|email|hire|reach)/i.test(msg)) {
            return "📧 Want to connect with Ramji?\n\nScroll down to the Contact section below to send a direct message. You can also find his LinkedIn profile in the hero section.\n\nFeel free to reach out for job opportunities, consulting, or collaboration!";
        }

        // Default
        return `I can help you learn about Ramji's:\n\n🎯 Experience (${experienceYears} in enterprise backend engineering)\n🛠️ Skills (Java, Spring Boot, AWS, Cloud-Native)\n🚀 Projects (Banking, AdTech, IoT platforms)\n🎓 Certifications\n\nTry asking: 'What's Ramji's AWS experience?' or 'Tell me about his projects'`;
    }
}

// Initialize Chatbot
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 [CHATBOT] Initializing AI Chatbot...');

    const chatbot = new AIChatbot();
    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const minimizeBtn = document.getElementById('chatbot-minimize');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    const suggestionsContainer = document.getElementById('chatbot-suggestions');

    console.log('🔧 [CHATBOT] Configuration:');
    console.log('   • API Endpoint:', chatbot.apiEndpoint);
    console.log('   • Elements found:', {
        toggleBtn: !!toggleBtn,
        chatWindow: !!chatWindow,
        minimizeBtn: !!minimizeBtn,
        sendBtn: !!sendBtn,
        input: !!input,
        messagesContainer: !!messagesContainer,
        suggestionsContainer: !!suggestionsContainer
    });

    // Note: Welcome message is already in index.html, no need to add it here

    // Toggle chat window
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            toggleBtn.classList.toggle('active');
            chatWindow.classList.toggle('active');
            if (chatWindow.classList.contains('active')) {
                input.focus();
            }
        });
    }

    // Minimize chat
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function() {
            toggleBtn.classList.remove('active');
            chatWindow.classList.remove('active');
        });
    }

    // Intelligent scroll lock: Only lock main page scroll when cursor is inside chatbot
    chatWindow.addEventListener('mouseenter', function() {
        document.body.style.overflow = 'hidden';
    });

    chatWindow.addEventListener('mouseleave', function() {
        document.body.style.overflow = '';
    });

    // Unlock scroll when chatbot closes
    const unlockScroll = function() {
        document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', function() {
        if (!chatWindow.classList.contains('active')) {
            unlockScroll();
        }
    });

    minimizeBtn.addEventListener('click', unlockScroll);

    // Send message function
    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;

        // Add user message to UI
        addMessage(message, 'user');
        input.value = '';

        // Hide suggestions after first message
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }

        // Show typing indicator
        showTypingIndicator();

        // Get AI response
        const response = await chatbot.sendMessage(message);

        // Hide typing indicator and show response
        hideTypingIndicator();
        const responseText = typeof response === 'string' ? response : response.text;
        const sourceLine = typeof response === 'string' ? '' : (response.sourceLine || '');

        // Update online/offline status indicator
        const isLocalFallback = sourceLine.toLowerCase().includes('local fallback');
        setOnlineStatus(!isLocalFallback);

        addMessage(sourceLine ? `${responseText}\n\n${sourceLine}` : responseText, 'bot');
    }

    function setOnlineStatus(isOnline) {
        const dot = document.getElementById('chatbot-status-dot');
        const text = document.getElementById('chatbot-status-text');
        const indicator = document.getElementById('chatbot-status-indicator');
        if (!dot || !text) return;
        if (isOnline) {
            dot.classList.remove('offline');
            text.textContent = 'Online';
            indicator && indicator.classList.remove('offline');
        } else {
            dot.classList.add('offline');
            text.textContent = 'Offline';
            indicator && indicator.classList.add('offline');
        }
    }

    // Event listeners
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            input.value = this.getAttribute('data-question');
            sendMessage();
        });
    });

    // Add message to chat UI
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Convert line breaks to <br> tags and preserve formatting
        content.innerHTML = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom smoothly
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Typing indicator
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Add CSS for typing dots animation if not already present
    if (!document.getElementById('typing-animation-style')) {
        const style = document.createElement('style');
        style.id = 'typing-animation-style';
        style.textContent = `
            .typing-dots {
                display: flex;
                gap: 4px;
                padding: 8px;
            }
            .typing-dots span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                opacity: 0.4;
                animation: typingDot 1.4s infinite;
            }
            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }
            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }
            @keyframes typingDot {
                0%, 60%, 100% {
                    opacity: 0.4;
                    transform: scale(1);
                }
                30% {
                    opacity: 1;
                    transform: scale(1.2);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
