const API_BASE = '/api';

export async function fetchProperties(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE}/properties?${query}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch properties');
  }

  return response.json();
}