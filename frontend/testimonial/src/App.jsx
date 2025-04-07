import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { toPng } from 'html-to-image';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export default function App() {
    const [input, setInput] = useState('');
    const [tone, setTone] = useState('professional');
    const [results, setResults] = useState([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('minimalist');

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

    const generate = async () => {
        if (!input.trim()) {
            toast.error('Please enter feedback');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = isBulkMode
                ? 'https://testimonialforge-production.up.railway.app/api/bulk-generate'
                : 'https://testimonialforge-production.up.railway.app/api/generate';
            const payload = isBulkMode
                ? { texts: input.split('\n').filter(t => t.trim()), tone }
                : { text: input, tone };

            const { data } = await axios.post(endpoint, payload);

            if (isBulkMode) {
                setResults(data.testimonials.map(text => ({ text, template: selectedTemplate })));
                toast.success(`Generated ${data.testimonials.length} testimonials`);
            } else {
                setResults([{ text: data.testimonial, template: selectedTemplate }]);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Generation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const exportAsImage = async (id) => {
        try {
            const element = document.getElementById(`testimonial-${id}`);
            const dataUrl = await toPng(element);

            const link = document.createElement('a');
            link.download = `testimonial-${id}.png`;
            link.href = dataUrl;
            link.click();

            toast.success('Image downloaded!');
        } catch (error) {
            toast.error('Failed to export image');
        }
    };

    const copyEmbedCode = (text) => {
        const html = `<div class="testimonial-card" style="
            background: ${templates[selectedTemplate].bg};
            color: ${templates[selectedTemplate].color};
            font-family: ${templates[selectedTemplate].font};
            padding: 1.5rem;
            border-radius: 8px;
            border: ${templates[selectedTemplate].border};
            max-width: 600px;
            margin: 1rem auto;
        ">
            <p>${text}</p>
        </div>`;

        navigator.clipboard.writeText(html);
        toast.success('Embed code copied!');
    };

    return (
        <div className="app-container">
            <ToastContainer position="bottom-right" />
            <h1>AI Testimonial Generator</h1>

            <div className="mode-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={isBulkMode}
                        onChange={() => {
                            setIsBulkMode(!isBulkMode);
                            setResults([]);
                        }}
                    />
                    Bulk Mode (One input per line)
                </label>
            </div>

            <div className="input-section">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                        isBulkMode
                            ? "Paste multiple testimonials (one per line)"
                            : "Paste raw feedback..."
                    }
                    rows={isBulkMode ? 8 : 4}
                />

                <div className="controls-grid">
                    <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="enthusiastic">Enthusiastic</option>
                    </select>

                    <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="minimalist">Minimalist</option>
                        <option value="elegant">Elegant</option>
                        <option value="modern">Modern</option>
                    </select>

                    <button
                        onClick={generate}
                        disabled={isLoading}
                        className={isLoading ? 'generating' : ''}
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            <div className="results-section">
                {results.map((result, index) => (
                    <div key={index} className="result-container">
                        <div
                            id={`testimonial-${index}`}
                            className="testimonial-preview"
                            style={{
                                background: templates[result.template].bg,
                                color: templates[result.template].color,
                                fontFamily: templates[result.template].font,
                                border: templates[result.template].border
                            }}
                        >
                            <p>{result.text}</p>
                        </div>

                        <div className="result-actions">
                            <button onClick={() => exportAsImage(index)}>
                                Download PNG
                            </button>
                            <button onClick={() => copyEmbedCode(result.text)}>
                                Copy HTML
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(result.text);
                                    toast.success('Copied text!');
                                }}
                            >
                                Copy Text
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}