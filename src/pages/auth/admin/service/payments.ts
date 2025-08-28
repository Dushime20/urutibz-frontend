import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError } from './config';
import type { 
  PaymentMethod, 
  PaymentProvider, 
  CreatePaymentProviderInput, 
  PaymentProviderStats, 
  FeeCalculationResult, 
  ProviderComparisonResponse, 
  BulkUpdatePaymentProvidersPayload, 
  InsuranceProvider, 
  CreateInsuranceProviderInput, 
  InsuranceProviderStats,
  PaymentTransactionResponse
} from '../interfaces';

// Payment Methods Functions
export async function fetchPaymentMethods(token?: string): Promise<PaymentMethod[]> {
  const response = await axios.get(`${API_BASE_URL}/payment-methods`, { 
    headers: createAuthHeaders(token) 
  });
  return response.data.data.data;
}

// Payment Providers CRUD Functions
export async function fetchPaymentProviders(token?: string): Promise<PaymentProvider[]> {
  const response = await axios.get(`${API_BASE_URL}/payment-providers`, { 
    headers: createAuthHeaders(token) 
  });
  // Support both {data:{data:[]}} and {data:[]} response shapes
  return response.data?.data?.data ?? response.data?.data ?? response.data ?? [];
}

export async function createPaymentProvider(payload: CreatePaymentProviderInput, token?: string): Promise<{ data: PaymentProvider | null; error: string | null }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment-providers`, payload, { 
      headers: createJsonHeaders(token) 
    });
    return { data: response.data?.data ?? response.data, error: null };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to create payment provider');
    return { data: null, error: errorMsg };
  }
}

export async function updatePaymentProvider(providerId: string, payload: Partial<CreatePaymentProviderInput>, token?: string): Promise<{ data: PaymentProvider | null; error: string | null }> {
  try {
    const response = await axios.put(`${API_BASE_URL}/payment-providers/${providerId}`, payload, { 
      headers: createJsonHeaders(token) 
    });
    return { data: response.data?.data ?? response.data, error: null };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to update payment provider');
    return { data: null, error: errorMsg };
  }
}

export async function deletePaymentProvider(providerId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
  try {
    await axios.delete(`${API_BASE_URL}/payment-providers/${providerId}`, { 
      headers: createAuthHeaders(token) 
    });
    return { success: true, error: null };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to delete payment provider');
    return { success: false, error: errorMsg };
  }
}

// Payment Providers Additional APIs
export async function fetchPaymentProviderById(id: string, token?: string): Promise<PaymentProvider> {
  const response = await axios.get(`${API_BASE_URL}/payment-providers/${id}`, { 
    headers: createAuthHeaders(token) 
  });
  return response.data?.data ?? response.data;
}

export async function searchPaymentProviders(query: string, token?: string): Promise<PaymentProvider[]> {
  const response = await axios.get(`${API_BASE_URL}/payment-providers/search`, { 
    params: { query }, 
    headers: createAuthHeaders(token) 
  });
  return response.data?.data ?? response.data ?? [];
}

export async function fetchPaymentProviderStats(token?: string): Promise<PaymentProviderStats> {
  const response = await axios.get(`${API_BASE_URL}/payment-providers/stats`, { 
    headers: createAuthHeaders(token) 
  });
  const raw = response.data?.data ?? response.data ?? {};
  // Normalize snake_case payload to our camelCase interface
  const normalized: PaymentProviderStats = {
    totalProviders: Number(raw.total_providers ?? raw.totalProviders ?? 0),
    activeProviders: Number(raw.active_providers ?? raw.activeProviders ?? 0),
    avgFeePercentage: raw.average_fee_percentage ?? raw.avgFeePercentage ?? null,
    byType: raw.providers_by_type ?? raw.byType ?? undefined,
    byCurrency: raw.providers_by_currency ?? raw.byCurrency ?? undefined,
  };
  return normalized;
}

export async function bulkUpdatePaymentProviders(payload: BulkUpdatePaymentProvidersPayload, token?: string): Promise<{ success: boolean; error: string | null }> {
  try {
    await axios.patch(`${API_BASE_URL}/payment-providers/bulk`, payload, { 
      headers: createJsonHeaders(token) 
    });
    return { success: true, error: null };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to bulk update payment providers');
    return { success: false, error: errorMsg };
  }
}

export async function fetchPaymentProvidersByCountry(countryId: string, token?: string): Promise<PaymentProvider[]> {
  const response = await axios.get(`${API_BASE_URL}/payment-providers/country/${countryId}`, { 
    headers: createAuthHeaders(token) 
  });
  return response.data?.data ?? response.data ?? [];
}

export async function calculateFeesForCountry(options: { countryId: string; amount: number; currency: string; provider_type?: string }, token?: string): Promise<FeeCalculationResult[]> {
  const { countryId, amount, currency, provider_type } = options;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/country/${countryId}/calculate`, { 
    params: { amount, currency, provider_type }, 
    headers: createAuthHeaders(token) 
  });
  return response.data?.data ?? response.data ?? [];
}

export async function compareProvidersForCountry(options: { countryId: string; amount: number; currency: string; provider_type?: string }, token?: string): Promise<ProviderComparisonResponse> {
  const { countryId, amount, currency, provider_type } = options;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/country/${countryId}/compare`, { 
    params: { amount, currency, provider_type }, 
    headers: createAuthHeaders(token) 
  });
  const data = response.data?.data ?? response.data;
  return Array.isArray(data) ? { items: data } : data;
}

// Insurance Providers API Functions
export async function fetchInsuranceProviders(params?: Record<string, any>, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data;
}

export async function searchInsuranceProviders(params: Record<string, any>, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/search`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data;
}

export async function fetchInsuranceProviderStats(params?: { country_id?: string }, token?: string): Promise<InsuranceProviderStats> {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/stats`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data?.data ?? response.data;
}

export async function fetchLiveInsuranceProviders(params?: { country_id?: string; include_credentials?: boolean }, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/live`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data;
}

export async function compareInsuranceProviders(params: { category_id: string; coverage_amount?: number; country_id?: string }, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/compare`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data;
}

export async function coverageAnalysis(params: { category_id: string; country_id: string }, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/coverage-analysis`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data;
}

export async function bulkUpdateInsuranceProviders(payload: { ids: string[]; updates: Partial<CreateInsuranceProviderInput> }, token?: string) {
  const response = await axios.post(`${API_BASE_URL}/insurance-providers/bulk`, payload, { 
    headers: createJsonHeaders(token) 
  });
  return response.data;
}

export async function fetchInsuranceProvidersByCountry(countryId: string, params?: { include_inactive?: boolean; include_credentials?: boolean }, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/country/${countryId}`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data;
}

export async function fetchInsuranceProvidersByCategory(categoryId: string, params?: { country_id?: string; include_inactive?: boolean; include_credentials?: boolean }, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/category/${categoryId}`, { 
    headers: createAuthHeaders(token), 
    params 
  });
  return response.data;
}

export async function fetchInsuranceMarketAnalysis(countryId: string, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/market-analysis/${countryId}`, { 
    headers: createAuthHeaders(token) 
  });
  return response.data;
}

export async function fetchInsuranceProviderById(id: string, params?: { include_inactive?: boolean; include_credentials?: boolean; include_stats?: boolean }, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/insurance-providers/${id}`, { 
      headers: createAuthHeaders(token), 
      params 
    });
    return { success: true, data: response.data?.data ?? response.data };
  } catch (err: any) {
    console.error('Error fetching insurance provider by ID:', err);
    return { success: false, error: handleApiError(err, 'Failed to fetch insurance provider') };
  }
}

export async function createInsuranceProvider(payload: CreateInsuranceProviderInput, token?: string): Promise<{ data: InsuranceProvider | null; error: string | null }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/insurance-providers`, payload, { 
      headers: createJsonHeaders(token) 
    });
    return { data: response.data?.data ?? response.data, error: null };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to create insurance provider');
    return { data: null, error: errorMsg };
  }
}

export async function updateInsuranceProvider(id: string, payload: Partial<CreateInsuranceProviderInput>, token?: string) {
  const response = await axios.put(`${API_BASE_URL}/insurance-providers/${id}`, payload, { 
    headers: createJsonHeaders(token) 
  });
  return response.data;
}

export async function deleteInsuranceProvider(id: string, token?: string) {
  const response = await axios.delete(`${API_BASE_URL}/insurance-providers/${id}`, { 
    headers: createAuthHeaders(token) 
  });
  return response.data;
}

// Payment Transactions Functions
export async function fetchRecentPaymentTransactions(
  limit: number = 10,
  token?: string,
  page: number = 1,
  status?: string,
  type?: string,
  search?: string
): Promise<PaymentTransactionResponse> {
  let url = `${API_BASE_URL}/payment-transactions?page=${page}&limit=${limit}`;
  if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (type && type !== 'all') url += `&transaction_type=${encodeURIComponent(type)}`;
  if (search && search.trim() !== '') url += `&search=${encodeURIComponent(search)}`;
  try {
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch payment transactions');
    console.error('Error fetching payment transactions:', errorMsg);
    throw new Error(errorMsg);
  }
}
