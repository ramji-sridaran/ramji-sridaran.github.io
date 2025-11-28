/* ==========================================
   AI CHATBOT ASSISTANT - OPENAI INTEGRATED
   ========================================== */

// AI Chatbot Class with OpenAI Integration
class AIChatbot {
    constructor() {
        this.apiEndpoint = 'https://ramji-sridaran.vercel.app/api/chat';
        this.conversationHistory = [];
        this.isProcessing = false;
    }

    async sendMessage(userMessage) {
        if (this.isProcessing) {
            return "⏳ Please wait for the current response...";
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
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                timeout: 15000 // 15 second timeout
            });

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
                    console.log('🔄 [CHATBOT] Using server-suggested fallback response');
                    this.isProcessing = false;
                    return errorData.reply || this.getFallbackResponse(userMessage);
                }

                // Use fallback for any API error
                console.log('🔄 [CHATBOT] Using local fallback response due to API error');
                this.isProcessing = false;
                return this.getFallbackResponse(userMessage);
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
            return data.reply;

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
            } else if (error.name === 'SyntaxError') {
                console.error('📄 [CHATBOT] JSON Parse Error - API returned invalid JSON');
            } else if (error.message.includes('timeout')) {
                console.error('⏱️ [CHATBOT] Request Timeout - API took too long to respond');
            }

            this.isProcessing = false;
            console.log('🔄 [CHATBOT] Falling back to local rule-based response');
            return this.getFallbackResponse(userMessage);
        }
    }

    // Fallback to rule-based responses if API is unavailable
    getFallbackResponse(message) {
        const msg = message.toLowerCase();

        // Greetings
        if (/^(hi|hello|hey|greetings)/i.test(msg)) {
            return "👋 Hello! I'm Ramji's assistant. I can tell you about his 11+ years of experience in Java, AWS, Snowflake, and Big Data. What would you like to know?";
        }

        // Experience
        if (/(experience|work|career|job|background)/i.test(msg)) {
            return "Ramji has 11+ years of experience:\n\n• Technical Lead @ Dentsu (2021-Present)\n• Java/Cloud Developer @ Cognizant (2019-2021)\n• Big Data Developer @ Cognizant (2018-2019)\n• IoT Developer @ TCS (2015-2018)\n\nHe specializes in Java, AWS, Snowflake, and Big Data technologies.";
        }

        // Skills
        if (/(skill|technology|tech|know|language)/i.test(msg)) {
            return "Ramji's key skills include:\n\n☁️ Cloud: AWS, Snowflake\n☕ Languages: Java 17, Python, Scala, SQL\n🚀 Frameworks: Spring Boot 3, Hibernate\n📊 Big Data: Kafka, Spark, HBase, Airflow\n🐳 DevOps: Docker, Kubernetes, Jenkins";
        }

        // Projects
        if (/(project|built|portfolio)/i.test(msg)) {
            return "Key projects:\n\n1. Databridge - Enterprise data platform processing 100TB+ daily\n2. Retail Cloud Migration - AWS migration with 99.9% uptime\n3. IoT Analytics - Real-time analytics for 10K+ devices\n\nWant details on any specific project?";
        }

        // AWS
        if (/(aws|amazon|cloud|lambda)/i.test(msg)) {
            return "Ramji has extensive AWS expertise including Elastic Beanstalk, Lambda, EC2, S3, SQS, SNS, and CloudFormation. He's architected serverless applications handling 50M+ requests daily and reduced cloud costs by 60% through optimization.";
        }

        // Snowflake
        if (/(snowflake|data warehouse)/i.test(msg)) {
            return "Ramji is SnowPro Core Certified and works with Snowflake Data Cloud at Dentsu. His Databridge project processes 100TB+ data daily with 99.9% accuracy. He's implemented security enhancements and performance optimizations.";
        }

        // Contact
        if (/(contact|email|hire|reach)/i.test(msg)) {
            return "📧 Want to connect with Ramji?\n\nScroll down to the Contact section below to send a direct message. You can also find his LinkedIn profile in the hero section.\n\nFeel free to reach out for job opportunities, consulting, or collaboration!";
        }

        // Default
        return "I can help you learn about Ramji's:\n\n🎯 Experience (11+ years)\n🛠️ Skills (Java, AWS, Snowflake)\n🚀 Projects (Enterprise platforms)\n🎓 Certifications\n\nTry asking: 'What's Ramji's AWS experience?' or 'Tell me about his projects'";
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

    // Test API connectivity on load
    console.log('🔌 [CHATBOT] Testing API connectivity...');
    fetch(chatbot.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test' })
    })
    .then(response => {
        console.log('✅ [CHATBOT] API Connection Test Result:', response.status, response.statusText);
        if (response.ok) {
            console.log('🟢 [CHATBOT] API is reachable and responding');
        } else {
            console.warn('🟡 [CHATBOT] API is reachable but returned error status:', response.status);
        }
    })
    .catch(error => {
        console.error('🔴 [CHATBOT] API Connection Test FAILED:', error.message);
        console.error('   This means AI responses will NOT work. Fallback mode will be used.');
        console.error('   Possible reasons:');
        console.error('   1. Vercel deployment not set up');
        console.error('   2. Wrong API endpoint URL');
        console.error('   3. CORS not configured');
        console.error('   4. Server/function is down');
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
        addMessage(response, 'bot');
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
