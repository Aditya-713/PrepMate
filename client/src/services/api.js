const API_BASE = '/api';

/**
 * Get JWT token from localStorage
 */
const getAuthToken = () => localStorage.getItem('prepmate_token');

/**
 * Universal API Request Wrapper
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

/**
 * Stream SSE (Server-Sent Events) from POST /api endpoint
 */
export const apiStreamPost = async (endpoint, body, onChunk, onError) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Stream connection failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete trailing fragment in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.substring(6);
          if (payload === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.chunk) {
              onChunk(parsed.chunk);
            }
            if (parsed.error) {
              onError && onError(parsed.error);
            }
          } catch (e) {
            // Ignore non-JSON stream ping
          }
        }
      }
    }
  } catch (err) {
    onError && onError(err.message);
  }
};
