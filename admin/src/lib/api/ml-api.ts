import { FoodExtractionResponse, RescueBagCreationResponse } from '@/lib/types';

const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

export class MLAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public detail?: any
  ) {
    super(message);
    this.name = 'MLAPIError';
  }
}

export async function extractFoodFromImage(
  merchant_id: string,
  image_base64: string
): Promise<FoodExtractionResponse> {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/api/ml/food-extraction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id,
        image_base64,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new MLAPIError(
        `Food extraction failed: ${error.detail || response.statusText}`,
        response.status,
        error.detail
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof MLAPIError) {
      throw error;
    }
    throw new MLAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

export async function createRescueBags(
  merchant_id: string
): Promise<RescueBagCreationResponse> {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/api/ml/rescue-bag-creation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new MLAPIError(
        `Rescue bag creation failed: ${error.detail || response.statusText}`,
        response.status,
        error.detail
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof MLAPIError) {
      throw error;
    }
    throw new MLAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

export async function checkMLHealth(): Promise<{ status: string; service: string }> {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('ML API is not healthy');
    }
    return await response.json();
  } catch (error) {
    throw new MLAPIError(
      `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}
