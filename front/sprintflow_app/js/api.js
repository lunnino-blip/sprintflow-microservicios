const API_CONFIG = {
    HISTORIAS_URL: 'http://127.0.0.1:8001',
    SPRINTS_URL: 'http://127.0.0.1:8002',
    INFORMES_URL: 'http://127.0.0.1:8003'
};

async function apiRequest(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}