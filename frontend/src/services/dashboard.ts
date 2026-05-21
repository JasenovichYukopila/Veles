import { API_BASE_URL } from '../constants';
import type { BusinessMetric, PersonalRecommendation } from '../types';

export async function fetchBusinessMetrics(): Promise<BusinessMetric[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/business`);

    if (!response.ok) {
        throw new Error(`Failed to fetch business metrics: ${response.status}`);
    }

    const json = await response.json();
    return json.data as BusinessMetric[];
}

export async function fetchPersonalRecommendations(genre: string): Promise<PersonalRecommendation[]> {
    const response = await fetch(
        `${API_BASE_URL}/dashboard/personal?genre=${encodeURIComponent(genre)}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch personal recommendations: ${response.status}`);
    }

    const json = await response.json();
    return json.data as PersonalRecommendation[];
}
