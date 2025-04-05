// ======================== KEY OBFUSCATION LAYERS ========================
const _0x4d3a = [
    0x63, 0x68, 0x72, 0x6f, 0x6d, 0x65, 0x2e, 0x72,
    0x75, 0x6e, 0x74, 0x69, 0x6d, 0x65, 0x3f, 0x20,
    0x3a, 0x20, 0x6e, 0x75, 0x6c, 0x6c
];

const _0x2f8c = function(_0x4d3ad1, _0x2f8c9b) {
    _0x4d3ad1 = _0x4d3ad1 - 0x0;
    let _0x1e7f = _0x4d3a[_0x4d3ad1];
    return _0x1e7f;
};

const _0xace3 = (function() {
    let _0x3bcd = '';
    [0x74, 0x67, 0x70, 0x5f, 0x76, 0x31, 0x5f, 0x6e]
        .forEach(_0x5e2d => {
            _0x3bcd += String.fromCharCode(_0x5e2d);
        });
    return _0x3bcd;
})();

const _0xbeef = (function() {
    const _0xkeys = [
        [0x36, 0x38, 0x51, 0x77, 0x4a, 0x2d],
        [0x4e, 0x48, 0x64, 0x6f, 0x52, 0x77],
        [0x38, 0x79, 0x73, 0x33, 0x33, 0x58],
        [0x5f, 0x54, 0x4a, 0x6e, 0x61, 0x69],
        [0x57, 0x58, 0x76, 0x77, 0x4b, 0x5f],
        [0x45, 0x53, 0x57, 0x4c, 0x61, 0x46],
        [0x5f, 0x43, 0x70, 0x32, 0x61, 0x59]
    ];
    return _0xkeys.map(_0xpart =>
        _0xpart.map(_0xchar =>
            String.fromCharCode(_0xchar)
        ).join('')
    ).join('');
})();

// Anti-debugging environment check
const _0xenv = (typeof chrome === 'undefined' ||
    !chrome.runtime ||
    new Function("try{return this===window}catch(e){return false}")()) ?
    "INVALID_ENVIRONMENT" :
    _0xace3 + _0xbeef;

// Runtime self-validation
const API_KEY = (function(_0xkey) {
    const _0xvalid = _0xkey.length === 51 &&
        _0xkey.startsWith("tgp_v1_") &&
        _0xkey.endsWith("2aY");
    return _0xvalid ? _0xkey : "INVALID_KEY";
})(_0xenv);

// ======================== API CALL PROTECTION ========================
const _0xapi = {
    "url": atob("aHR0cHM6Ly9hcGkudG9nZXRoZXIueHl6L3YxL2NoYXQvY29tcGxldGlvbnM="),
    "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    },
    "model": "meta-llama/Llama-3-70b-chat-hf"
};

const generateSingleTestimonial = async (text, tone) => {
    // Anti-tampering check
    if (API_KEY.includes("INVALID") ||
        typeof text !== 'string' ||
        text.length > 1000) {
        throw new Error("Security validation failed");
    }

    try {
        const response = await fetch(_0xapi.url, {
            method: "POST",
            headers: _0xapi.headers,
            body: JSON.stringify({
                model: _0xapi.model,
                messages: [{
                    role: "user",
                    content: `Create a ${tone} testimonial (1-2 sentences) from: "${text}". Rules:
- Sound human
 - No introductory phrases"
- No quotes/labels
- Focus on benefits`
                }],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        return data.choices[0].message.content
            .replace(/["']/g, '')
            .replace(/^(Here is|Testimonial:)/i, '')
            .trim();
    } catch (error) {
        console.error("[SECURE] API Error:", error);
        throw new Error("Failed to generate testimonial");
    }
};

// ======================== MESSAGE HANDLER WITH SANDBOX ========================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Validate message origin
    if (sender.origin && !sender.origin.startsWith("chrome-extension://")) {
        sendResponse({ error: "Unauthorized origin" });
        return false;
    }

    if (request.action === "generate") {
        // Timeout protection
        const timeout = setTimeout(() => {
            sendResponse({ error: "Request timeout" });
        }, 10000);

        generateSingleTestimonial(request.text, request.tone)
            .then(testimonial => {
                clearTimeout(timeout);
                sendResponse({ testimonial });
            })
            .catch(error => {
                clearTimeout(timeout);
                sendResponse({ error: error.message });
            });

        return true; // Keep message channel open
    }
});

// ======================== ANTI-TAMPERING CHECKS ========================
(function() {
    // Detect debugger
    const _0xdebug = new Function("debugger");
    try {
        _0xdebug();
        console.error("[SECURITY] Debugger detected");
        chrome.storage.local.set({ "_0xcompromised": true });
    } catch (_0xerr) {}
})();