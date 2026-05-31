import { API_ENDPOINTS } from '../config/api';
import { authService } from './authService';

export async function analyzeIdea(ideaData) {
  try {
    const response = await fetch(API_ENDPOINTS.analyzeIdea, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(ideaData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao analisar ideia');
    }

    return data.data;
  } catch (error) {
    console.error('Erro ao analisar ideia:', error);
    throw error;
  }
}

export async function checkApiHealth() {
  try {
    const response = await fetch(API_ENDPOINTS.health);
    return response.ok;
  } catch (error) {
    console.error('API offline:', error);
    return false;
  }
}

export async function subscribeToAlerts(email) {
  try {
    const response = await fetch(API_ENDPOINTS.subscribeAlerts, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Nao foi possivel assinar os alertas');
    }

    return data;
  } catch (error) {
    console.error('Erro ao assinar alertas:', error);

    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      throw new Error(
        'Nao foi possivel conectar ao backend (http://localhost:3001). Verifique se o servidor backend esta em execucao.',
      );
    }

    throw error;
  }
}
