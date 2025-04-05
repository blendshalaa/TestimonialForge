// Templates
const templates = {
    minimalist: {
        bg: '#1e293b',
        color: '#f8fafc',
        font: 'sans-serif',
        border: '1px solid #334155'
    },
    elegant: {
        bg: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
        color: '#f0f9ff',
        font: 'Georgia, serif',
        border: 'none'
    },
    modern: {
        bg: '#0f172a',
        color: '#e2e8f0',
        font: "'Inter', sans-serif",
        border: '1px solid #7c3aed'
    }
};

// DOM Elements
const bulkToggle = document.getElementById('bulkToggle');
const inputEl = document.getElementById('input');
const toneEl = document.getElementById('tone');
const templateEl = document.getElementById('template');
const generateBtn = document.getElementById('generate');
const resultsEl = document.getElementById('results');

// Generate Testimonial
const generate = async () => {
    const input = inputEl.value.trim();
    const tone = toneEl.value;
    const isBulk = bulkToggle.checked;

    if (!input) {
        alert('Please enter feedback');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    try {
        if (isBulk) {
            const texts = input.split('\n').filter(t => t.trim());
            resultsEl.innerHTML = '';

            for (const text of texts) {
                const testimonial = await chrome.runtime.sendMessage({
                    action: "generate",
                    text,
                    tone
                });

                if (testimonial.error) throw new Error(testimonial.error);
                addResultCard(testimonial.testimonial);
            }
        } else {
            const testimonial = await chrome.runtime.sendMessage({
                action: "generate",
                text: input,
                tone
            });

            if (testimonial.error) throw new Error(testimonial.error);
            resultsEl.innerHTML = '';
            addResultCard(testimonial.testimonial);
        }
    } catch (error) {
        alert(error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate';
    }
};

// Add Result Card
const addResultCard = (text) => {
    const template = templateEl.value;
    const card = document.createElement('div');
    card.className = `testimonial-card ${template}`;
    card.style.fontFamily = templates[template].font;
    card.innerHTML = `
    <p>${text}</p>
    <div class="result-actions">
      <button class="copy-text">Copy Text</button>
      <button class="copy-html">Copy HTML</button>
    </div>
  `;

    card.querySelector('.copy-text').addEventListener('click', () => {
        navigator.clipboard.writeText(text);
        alert('Copied text!');
    });

    card.querySelector('.copy-html').addEventListener('click', () => {
        const html = `<div style="
      background: ${templates[template].bg};
      color: ${templates[template].color};
      font-family: ${templates[template].font};
      padding: 1.5rem;
      border-radius: 8px;
      border: ${templates[template].border};
      max-width: 600px;
      margin: 1rem auto;
    "><p>${text}</p></div>`;

        navigator.clipboard.writeText(html);
        alert('Copied HTML!');
    });

    resultsEl.appendChild(card);
};

// Event Listeners
generateBtn.addEventListener('click', generate);
bulkToggle.addEventListener('change', () => {
    inputEl.placeholder = bulkToggle.checked
        ? "Paste multiple testimonials (one per line)"
        : "Paste raw feedback...";
    inputEl.rows = bulkToggle.checked ? 8 : 4;
});


