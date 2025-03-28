import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export default function App() {
    const [input, setInput] = useState('');
    const [tone, setTone] = useState('professional');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateTestimonial = async (regenerateIndex = null) => {
        if (!input.trim()) {
            toast.error('Please enter feedback');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await axios.post('/api/generate', {
                text: regenerateIndex !== null ? input : input,
                tone
            });

            if (regenerateIndex !== null) {
                // Replace specific testimonial
                setResults(results.map((r, i) =>
                    i === regenerateIndex ? data.testimonial : r
                ));
                toast.success('Testimonial regenerated!');
            } else {
                // Add new testimonial
                setResults([...results, data.testimonial]);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Generation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <ToastContainer position="bottom-right" />
            <h1>AI Testimonial Generator</h1>

            <div className="input-section">
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw feedback..."
            rows={5}
        />

                <div className="controls">
                    <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="enthusiastic">Enthusiastic</option>
                    </select>

                    <button
                        onClick={() => generateTestimonial()}
                        disabled={isLoading}
                        className={isLoading ? 'loading' : ''}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Generating...
                            </>
                        ) : 'Generate'}
                    </button>
                </div>
            </div>

            {results.length > 0 && (
                <div className="results-section">
                    <h2>Generated Testimonials</h2>
                    {results.map((result, index) => (
                        <div key={index} className="result-card">
                            <p>{result}</p>
                            <div className="result-actions">
                                <button
                                    onClick={() => generateTestimonial(index)}
                                    className="regenerate-btn"
                                >
                                    🔄 Regenerate
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(result);
                                        toast.success('Copied to clipboard!');
                                    }}
                                    className="copy-btn"
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}