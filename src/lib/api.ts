import { getToken } from './storage';

const API_URL = 'http://117.206.159.20:3000/api';

interface ApiResponse {
  response: string;
}

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'llama3.2',
        max_tokens: 1000,
        temperature: 0.7,
      }),
      signal: controller.signal,
      credentials: 'include',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data.response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(`Failed to generate response: ${error.message}`);
    }
    throw new Error('An unexpected error occurred');
  }
}