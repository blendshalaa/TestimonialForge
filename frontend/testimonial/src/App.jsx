import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export default function App() {
    const [input, setInput] = useState('');
    const [tone, setTone] = useState('professional');
    const [results, setResults] = useState([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const generate = async () => {
        if (!input.trim()) {
            toast.error('Please enter feedback');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = isBulkMode ? '/api/bulk-generate' : '/api/generate';
            const payload = isBulkMode
                ? { texts: input.split('\n').filter(t => t.trim()), tone }
                : { text: input, tone };

            const { data } = await axios.post(endpoint, payload);

            if (isBulkMode) {
                setResults(data.testimonials);
                toast.success(`Generated ${data.testimonials.length} testimonials`);
            } else {
                setResults([data.testimonial]);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Generation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <ToastContainer position="bottom-right" />
            <h1>AI Testimonial Generator</h1>

            {/* Bulk Mode Toggle */}
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

            {/* Input Area */}
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

                {/* Tone Selection */}
                <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="enthusiastic">Enthusiastic</option>
                </select>

                <button onClick={generate} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>

            {/* Results */}
            <div className="results-section">
                {results.map((result, index) => (
                    <div key={index} className="result-card">
                        <p>{result}</p>
                        <div className="result-actions">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(result);
                                    toast.success('Copied!');
                                }}
                            >
                                Copy
                            </button>
                            <button
                                onClick={generate}
                                disabled={isLoading}
                            >
                                Regenerate All
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}