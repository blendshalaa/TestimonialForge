const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Validate environment variables
if (!process.env.TOGETHER_API_KEY) {
    console.error('Missing TOGETHER_API_KEY in environment variables');
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Optimized testimonial generation
app.post('/api/generate', async (req, res) => {
    try {
        const { text, tone = 'professional' } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({ error: "Text is required" });
        }

        const prompt = `Transform this into a ${tone} testimonial for a SaaS product.
Be concise (1-2 sentences), highlight benefits, and sound human.
Do NOT include labels like "Testimonial:" or quotation marks.

Feedback: "${text}"
Output:`;

        const response = await axios.post(
            'https://api.together.xyz/v1/chat/completions',
            {
                model: "meta-llama/Llama-3-70b-chat-hf",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 100,
                temperature: 0.7,
                stop: ["\n\n"]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        // Clean and format the output
        let testimonial = response.data.choices[0]?.message?.content
            .replace(/^["']|["']$/g, '')
            .replace(/^(Here is|Testimonial:)/i, '')
            .trim();

        testimonial = testimonial.charAt(0).toUpperCase() + testimonial.slice(1);

        res.json({ testimonial });

    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error?.message ||
                "Generation failed. Please try again."
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});