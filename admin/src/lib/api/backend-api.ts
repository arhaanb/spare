/**
 * Backend API Client - Direct connection to Python FastAPI backend
 * 
 * This replaces the temporary Next.js API routes with direct backend calls.
 * All CRUD operations are now handled by the Python backend at ml/ml_service/main.py
 */

import { Merchant } from '@/lib/types';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api';

export class BackendAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public detail?: any
  ) {
    super(message);
    this.name = 'BackendAPIError';
  }
}

// ============================================================================
// MERCHANT ENDPOINTS
// ============================================================================

export interface CreateMerchantInput {
  merchant_name: string;
  email: string;
  password: string;
  location: string;
  contact: {
    phone: string;
  };
  menu: any[];
  bag_pricing: {
    regular_bag_price: number;
    large_bag_price: number;
  };
  operating_hours: {
    opening: string;
    closing: string;
  };
}

/**
 * Create a new merchant account
 * POST /api/merchants
 */
export async function createMerchant(data: CreateMerchantInput): Promise<Merchant> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/merchants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new BackendAPIError(
        error.error || error.detail || 'Failed to create merchant',
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BackendAPIError) {
      throw error;
    }
    throw new BackendAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login merchant with email and password
 * POST /api/merchants/login
 */
export async function loginMerchant(credentials: LoginCredentials): Promise<Merchant> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/merchants/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new BackendAPIError(
        error.error || error.detail || 'Invalid email or password',
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BackendAPIError) {
      throw error;
    }
    throw new BackendAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

/**
 * Get merchant by ID
 * GET /api/merchants/{merchant_id}
 */
export async function getMerchantById(merchant_id: string): Promise<Merchant> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/merchants/${merchant_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new BackendAPIError(
        error.error || error.detail || 'Merchant not found',
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BackendAPIError) {
      throw error;
    }
    throw new BackendAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

// ============================================================================
// LEFTOVER ITEMS ENDPOINTS
// ============================================================================

export interface LeftoverItem {
  type: string;
  quantity: number;
  closest_menu_item: string;
  confidence: number;
  price: number;
  non_veg: boolean;
}

export interface SaveLeftoverItemsInput {
  merchant_id: string;
  date: string;
  items: LeftoverItem[];
}

/**
 * Save or update leftover items (UPSERT)
 * POST /api/leftover-items
 */
export async function saveLeftoverItems(
  data: SaveLeftoverItemsInput
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/leftover-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new BackendAPIError(
        error.error || error.detail || 'Failed to save leftover items',
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BackendAPIError) {
      throw error;
    }
    throw new BackendAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

// ============================================================================
// RESCUE BAGS ENDPOINTS
// ============================================================================

export interface RescueBagItem {
  food_name: string;
  quantity: number;
  unit_price: number;
}

export interface RescueBag {
  bag_type: string;
  target_price: number;
  items: RescueBagItem[];
  estimated_total_value: number;
}

export interface SaveRescueBagsInput {
  merchant_id: string;
  date: string;
  bags: RescueBag[];
}

/**
 * Save rescue bags (INSERT)
 * POST /api/rescue-bags
 */
export async function saveRescueBags(
  data: SaveRescueBagsInput
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/rescue-bags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new BackendAPIError(
        error.error || error.detail || 'Failed to save rescue bags',
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BackendAPIError) {
      throw error;
    }
    throw new BackendAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check backend API health
 * GET /health
 */
export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  try {
    const response = await fetch(`${BACKEND_API_URL.replace('/api', '')}/health`);
    if (!response.ok) {
      throw new Error('Backend API is not healthy');
    }
    return await response.json();
  } catch (error) {
    throw new BackendAPIError(
      `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}
