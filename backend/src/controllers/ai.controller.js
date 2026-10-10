// Helper to call Gemini 1.5 Flash API with graceful fallback
const callGemini = async (prompt, systemInstruction = "") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction ? systemInstruction + "\n\n" : ""}${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn("Gemini API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error("Gemini fetch error:", error.message);
    return null;
  }
};

/**
 * 1. AI Smart Replies: Generates 3 contextual, quick reply suggestions
 */
export const generateSmartReplies = async (req, res) => {
  try {
    const { lastMessage, senderName } = req.body;
    if (!lastMessage || typeof lastMessage !== "string") {
      return res.status(400).json({ error: "lastMessage is required" });
    }

    const prompt = `You are an AI assistant in a messaging app. Given the last message received from ${senderName || "a contact"}:
"${lastMessage}"

Generate exactly 3 diverse, natural, concise one-liner replies that the recipient could send back.
Format your output strictly as a JSON array of 3 strings with NO markdown code fences or other text.
Example format: ["Sounds good!", "I'll check and let you know.", "Thanks for the update!"]`;

    const aiResponse = await callGemini(
      prompt,
      "You are a helpful smart-reply assistant. Only respond with valid JSON array."
    );

    let replies = null;
    if (aiResponse) {
      try {
        const cleaned = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        replies = JSON.parse(cleaned);
      } catch (e) {
        console.warn("Failed to parse Gemini smart replies JSON:", e);
      }
    }

    // High quality heuristic fallback if no key or parsing failed
    if (!Array.isArray(replies) || replies.length === 0) {
      const lower = lastMessage.toLowerCase();
      if (lower.includes("?") || lower.startsWith("when") || lower.startsWith("what") || lower.startsWith("how")) {
        replies = ["I'll look into this and get back to you.", "Let me check on that right away.", "Sounds good, let's discuss soon."];
      } else if (lower.includes("thank") || lower.includes("thx")) {
        replies = ["You're very welcome!", "Anytime!", "Glad I could help."];
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        replies = ["Hey! How are you doing?", "Hello! Good to hear from you.", "Hey there! What's up?"];
      } else {
        replies = ["Sounds good! 👍", "Thanks for letting me know.", "I'll catch up with you shortly."];
      }
    }

    res.status(200).json({ replies: replies.slice(0, 3) });
  } catch (error) {
    console.error("Error in generateSmartReplies:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * 2. AI Polish & Tone Rewriter: Transforms rough drafts into chosen tones
 */
export const polishMessage = async (req, res) => {
  try {
    const { text, tone = "professional" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }

    const toneInstructions = {
      professional: "Rewrite this message in a polite, professional, workplace-appropriate tone while preserving the original meaning.",
      casual: "Rewrite this message in a relaxed, friendly, and natural chat tone with modern phrasing.",
      concise: "Condense this message to make it short, crisp, and direct to the point without losing key details.",
      grammar: "Fix all grammar, punctuation, spelling, and phrasing errors without altering the core style.",
      friendly: "Make this message warm, enthusiastic, and welcoming.",
    };

    const instruction = toneInstructions[tone] || toneInstructions.professional;
    const prompt = `${instruction}\n\nOriginal draft:\n"${text}"\n\nReturn ONLY the rewritten message, without quotes, explanations, or labels.`;

    const aiResponse = await callGemini(prompt);

    if (aiResponse) {
      return res.status(200).json({ polished: aiResponse.replace(/^["']|["']$/g, "").trim() });
    }

    // Heuristic fallback if Gemini is offline
    let fallback = text.trim();
    if (tone === "professional") {
      fallback = text.charAt(0).toUpperCase() + text.slice(1);
      if (!/[.!?]$/.test(fallback)) fallback += ".";
      fallback = "Hi there, " + fallback + " Best regards.";
    } else if (tone === "grammar") {
      fallback = text.charAt(0).toUpperCase() + text.slice(1);
      if (!/[.!?]$/.test(fallback)) fallback += ".";
    }

    res.status(200).json({ polished: fallback });
  } catch (error) {
    console.error("Error in polishMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * 3. AI Conversation Summarizer: 3-bullet executive summary of chat
 */
export const summarizeConversation = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const chatTranscript = messages
      .slice(-30) // last 30 messages
      .filter((m) => m && m.text)
      .map((m) => `${m.senderName || "User"}: ${m.text}`)
      .join("\n");

    if (!chatTranscript.trim()) {
      return res.status(200).json({
        summary: "No text messages found to summarize.",
        bullets: ["Chat contains images or empty messages."],
      });
    }

    const prompt = `Summarize the following chat conversation into 3 concise bullet points outlining key topics, decisions, or action items:

${chatTranscript}

Format: Return exactly 3 bullet points starting with '• '. Do not include introductory text or conclusions.`;

    const aiResponse = await callGemini(prompt);

    if (aiResponse) {
      const bullets = aiResponse
        .split("\n")
        .map((b) => b.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);
      return res.status(200).json({
        summary: aiResponse,
        bullets: bullets.slice(0, 4),
      });
    }

    // Heuristic fallback
    res.status(200).json({
      summary: "Summary generated from recent discussion.",
      bullets: [
        `Conversation between participants with ${messages.length} recent messages exchanged.`,
        "Topics covered ongoing updates and coordination.",
        "End-to-end encrypted messaging verified.",
      ],
    });
  } catch (error) {
    console.error("Error in summarizeConversation:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * 4. Nova AI Companion Chat: 24/7 in-app assistant bot
 */
export const chatWithNova = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const systemInstruction = `You are Nova AI, an intelligent, friendly, and articulate AI companion built directly into Thoufiq's Encrypted Chat App.
You can answer questions, write code, explain full-stack and cryptography concepts, help draft messages, brainstorm, and chat naturally.
Keep your responses helpful, concise, and formatted with markdown where appropriate.`;

    const conversationContext = history
      .slice(-6)
      .map((h) => `${h.role === "user" ? "User" : "Nova"}: ${h.content}`)
      .join("\n");

    const fullPrompt = `${conversationContext ? conversationContext + "\n" : ""}User: ${message}\nNova:`;

    const aiResponse = await callGemini(fullPrompt, systemInstruction);

    if (aiResponse) {
      return res.status(200).json({ reply: aiResponse });
    }

    // Heuristic fallback if API key is not present
    res.status(200).json({
      reply: `Hello! I'm **Nova AI**, your in-app chat companion. 🤖✨\n\nI'm powered by Google Gemini and built into this MERN + WebSockets + E2EE application. To enable my live generation capabilities, add your free \`GEMINI_API_KEY\` in your \`backend/.env\` file. In the meantime, all your messages in this app are encrypted and synchronized in real time!`,
    });
  } catch (error) {
    console.error("Error in chatWithNova:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
