require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Shared generation function
const generateTestimonial = async (text, tone) => {
    const prompt = `Create a ${tone} testimonial (1-2 sentences) from this feedback. Rules:
  - Sound human
  - No quotes/labels
  - Focus on benefits
  Input: "${text}"
  Output:`;

    const response = await axios.post(
        'https://api.together.xyz/v1/chat/completions',
        {
            model: "meta-llama/Llama-3-70b-chat-hf",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
            temperature: 0.7
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY.trim()}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        }
    );

    return response.data.choices[0].message.content
        .replace(/["']/g, '')
        .replace(/^(Here is|Testimonial:)/i, '')
        .trim();
};

// Single testimonial endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { text, tone } = req.body;
        if (!text) return res.status(400).json({ error: "Text required" });
        res.json({ testimonial: await generateTestimonial(text, tone) });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ error: "Generation failed" });
    }
});

// Bulk processing endpoint
app.post('/api/bulk-generate', async (req, res) => {
    try {
        const { texts, tone } = req.body;
        if (!texts?.length) return res.status(400).json({ error: "Texts array required" });

        const testimonials = await Promise.all(
            texts.map(text => generateTestimonial(text, tone))
        );

        res.json({ testimonials });
    } catch (error) {
        console.error('Bulk Error:', error.response?.data || error.message);
        res.status(500).json({ error: "Bulk generation failed" });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});