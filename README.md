# Portfolio AI Chatbot - Quick Reference

## 🔍 Debugging

If chatbot shows fallback responses instead of AI responses:

1. **Open browser console** (F12)
2. **Look for logs** starting with `[CHATBOT]`
3. **Check connection test result:**
   - ✅ Green = API working
   - 🔴 Red = API not reachable

**Common fixes:**
- Verify deployed to Vercel
- Check API endpoint URL matches your deployment
- Ensure `OPENAI_API_KEY` set in Vercel environment variables

**Full debugging guide:** `docs/DEBUGGING_GUIDE.md`

---

## 🚀 Deployment Checklist

- [ ] Deployed to Vercel
- [ ] `OPENAI_API_KEY` environment variable set
- [ ] API endpoint updated in `js/chatbot-ai.js`
- [ ] `index.html` loads `chatbot-ai.js` (not `chatbot.js`)

---

## 📁 Project Structure

```
portfolio/
├── index.html              # Main site
├── api/chat.js            # Vercel serverless function
├── js/
│   ├── chatbot-ai.js      # AI chatbot (ACTIVE)
│   ├── chatbot.js         # Fallback chatbot (backup)
│   └── script.js          # Main scripts
├── css/                   # Styles
├── Resources/             # Images, resumes
└── docs/                  # Documentation
    └── DEBUGGING_GUIDE.md
```

---

**For detailed info, check `docs/` folder. I'll respond directly in chat instead of creating new .md files.**

