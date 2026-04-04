const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Chat with AI for troubleshooting
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAI = async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message?.toLowerCase() || "";

  // 1) Handle Missing API Key with a Smart Mock Fallback
  const isMockKey = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here');
  
  if (isMockKey) {
    let reply = "I'm currently in 'Local Diagnostic Mode' because no API key is configured. I can still help with basics!";
    
    if (lowerMsg.includes("maintenance")) {
      reply = "For heavy machinery maintenance, always check fluid levels every 10 hours. Would you like to see the maintenance schedule?";
    } else if (lowerMsg.includes("compatibility") || lowerMsg.includes("part")) {
      reply = "Part compatibility is based on model years. Generally, Hitachi EX series parts are compatible between 2018-2022 models. Check the Inventory section for exact matches.";
    } else if (lowerMsg.includes("safety") || lowerMsg.includes("emergency")) {
      reply = "EMERGENCY: If a hydraulic leak occurs, shut down the engine immediately and relieve pressure using the joystick controls before inspection.";
    }

    return res.json({ reply: `${reply}\n\n[System Note: This is a pre-programmed technical response. Add a real OpenAI API Key to .env for full AI capabilities.]` });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a technical assistant for a heavy machinery parts inventory management system. Provide helpful advice on machine maintenance and parts replacement." 
        },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Error communicating with AI service' });
  }
};
