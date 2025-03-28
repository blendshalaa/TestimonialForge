const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Predefined tones + custom tone storage
const tonePresets = {
    professional: "Use formal business language with industry terminology",
    friendly: "Conversational tone with warmth and approachability",
    enthusiastic: "Excited and energetic with positive adjectives",
};

// Enhanced generation function
const generateTestimonial = async (text, tone) => {
    const toneInstructions = tonePresets[tone] || tone; // Allow custom tones

    const prompt = `Transform this raw feedback into a ${tone} testimonial for a SaaS landing page. Follow these rules:
- Only return the testimonial text
- No introductory phrases like "Here is..."
- No explanatory notes
- Sound natural and human
- Length: 1-2 sentences

Input: "${text}"
Output:`;
    const response = await axios.post(
        'https://api.together.xyz/v1/chat/completions',
        {
            model: "meta-llama/Llama-3-70b-chat-hf",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
            temperature: 0.7,
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
            },
            timeout: 10000
        }
    );
    let result = response.data.choices[0].message.content
        // Remove AI commentary patterns
        .replace(/^(Here is|Testimonial:|Note:|Possible testimonial:).*/i, '')
        // Remove everything after "Note:" if it slips through
        .replace(/\nNote:.*/s, '')
        .trim();

    return response.data.choices[0].message.content
        .replace(/^["']|["']$/g, '')
        .trim();
};

// Single testimonial endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { text, tone = 'professional' } = req.body;
        if (!text) return res.status(400).json({ error: "Text required" });

        const testimonial = await generateTestimonial(text, tone);
        res.json({ testimonial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Generation failed" });
    }
});

// Bulk processing endpoint
app.post('/api/bulk-generate', async (req, res) => {
    try {
        const { texts, tone = 'professional' } = req.body;
        if (!texts?.length) return res.status(400).json({ error: "Texts array required" });

        const testimonials = await Promise.all(
            texts.map(text => generateTestimonial(text, tone))
        );

        res.json({ testimonials });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Bulk generation failed" });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});