// Handle both preview (VITE_API_URL set) and production (nginx proxy at /api)
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`  // Preview: backend URL + /api
  : '/api';                                  // Production: nginx proxies /api

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
};

const api = {
  async getCoins() {
    try {
      const response = await fetch(`${API_BASE}/coins`);
      const result = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching coins:', error);
      throw error;
    }
  },

  async getCoinById(coinId) {
    try {
      const response = await fetch(`${API_BASE}/coins/${coinId}`);
      const result = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error fetching coin ${coinId}:`, error);
      throw error;
    }
  },

  async getCoinHistory(coinId) {
    try {
      const response = await fetch(`${API_BASE}/coins/${coinId}/history`);
      const result = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error fetching history for ${coinId}:`, error);
      throw error;
    }
  },
};

export default api;
export { ApiError };
