import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export default function App() {
    const [input, setInput] = useState('');
    const [tone, setTone] = useState('professional');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load saved testimonial on startup
    useEffect(() => {
        const saved = localStorage.getItem('lastTestimonial');
        if (saved) setResult(saved);
    }, []);

    const generateTestimonial = async () => {
        if (!input.trim()) {
            toast.error('Please enter feedback');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await axios.post('/api/generate', {
                text: input,
                tone
            });

            setResult(data.testimonial);
            localStorage.setItem('lastTestimonial', data.testimonial);
            toast.success('Generated!');

        } catch (err) {
            console.error(err);
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
            placeholder="Paste raw customer feedback..."
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
                        onClick={generateTestimonial}
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

            {result && (
                <div className="result-section">
                    <h2>Your Polished Testimonial:</h2>
                    <div className="result-box">
                        <p>{result}</p>
                        <div className="action-buttons">
                            <button
                                onClick={generateTestimonial}
                                className="regenerate-btn"
                            >
                                🔄 Regenerate
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(result);
                                    toast.info('Copied!');
                                }}
                                className="copy-btn"
                            >
                                📋 Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}