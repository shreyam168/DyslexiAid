const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Initialize Google Generative AI with API key

// Read Aloud API
router.post('/read-aloud', (req, res) => {
  try {
    const { text } = req.body;
    // In a real app, this would connect to a text-to-speech service
    res.json({ 
      success: true, 
      message: 'Text received for speech conversion',
      textLength: text ? text.length : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Educational Chatbot API (Gemini API integration)
// Educational Chatbot API (Groq integration)
router.post('/generate', async (req, res) => {
  try {
    const { query } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GROQ_API_KEY is not configured on the server'
      });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `
            You're an educational assistant for a child with dyslexia.
            Use simple language, no images, 120-word limit.
            Focus on clarity, repetition, chunking, and encouragement.
            Do not give words enclosed in asterisk.
            Make it as simple as possible, as if you're explaining to a kid who has just started learning that concept.
            Don't give people as examples.
            `
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.4
    });

    const text = completion.choices[0].message.content;

    res.json({ success: true, text });

  } catch (error) {
    console.error('Groq error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Groq request failed'
    });
  }
});

// Emotional Chatbot API
router.post('/emotional-chat', (req, res) => {
  try {
    const { message } = req.body;
    // In a real app, this would connect to an AI service
    res.json({ 
      success: true, 
      response: "I understand how you feel. It's perfectly normal to feel that way. Would you like to talk more about it?"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Therapy Chatbot API
router.post('/therapy-session', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GROQ_API_KEY is not configured on the server'
      });
    }

    const groq = new Groq({
      apiKey: GROQ_API_KEY
    });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `
            You are "Best Buddy", a kind and gentle therapy friend for students.

            Your job is to listen and support, not to judge or teach.

            Rules:
            - Use very simple words
            - Use short, calm sentences
            - Sound warm, caring, and friendly
            - Do not judge or blame
            - Do not rush the user
            - Do not give too much advice
            - Ask only one gentle follow-up question
            - Make the user feel safe and understood
            - Encourage sharing feelings in a soft way

            Speak like a caring friend who is sitting next to the student.

            Keep your response under 150 words.

            `
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.6
    });

    res.json({
      success: true,
      sessionId: sessionId || 'new-session-123',
      response: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Therapy-session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate therapy response'
    });
  }
});


// Writing Assistant API
router.post('/decode-handwriting', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    console.log('OCR IMAGE PATH 👉', req.file.path);

    const {
      data: { text }
    } = await Tesseract.recognize(
      req.file.path,
      'eng',
      {
        logger: m => console.log(m.status)
      }
    );

    console.log('OCR TEXT 👉', text);

    res.json({
      success: true,
      text: text.trim()
    });

  } catch (error) {
    console.error('OCR ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract text'
    });
  }
});


// Get user sessions
router.get('/user-sessions', (req, res) => {
  try {
    // In a real app, this would fetch from a database
    res.json({ 
      success: true, 
      sessions: [
        {
          id: 1,
          title: 'Building Reading Confidence',
          description: 'A guided session to develop strategies for reading with confidence and reducing anxiety.',
          progress: 75
        },
        {
          id: 2,
          title: 'Word Recognition Techniques',
          description: 'Learn and practice effective methods for recognizing challenging words.',
          progress: 30
        },
        {
          id: 3,
          title: 'Managing Frustration',
          description: 'Develop coping mechanisms for dealing with frustration during reading and writing tasks.',
          progress: 50
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 