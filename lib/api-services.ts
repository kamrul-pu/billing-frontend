import apiClient from './api-client';
import { 
  PaginatedResponse, 
  PackageList, 
  PackageDetail, 
  CustomerList, 
  CustomerDetail, 
  PaymentList, 
  PaymentDetail,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  Me
} from './types';

// Auth Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/users/login', credentials);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post('/users/login/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  getMe: async (): Promise<Me> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Package Services
export const packageService = {
  getPackages: async (page = 1, pageSize = 10): Promise<PaginatedResponse<PackageList>> => {
    const response = await apiClient.get('/packages', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  getPackage: async (uid: string): Promise<PackageDetail> => {
    const response = await apiClient.get(`/packages/${uid}`);
    return response.data;
  },

  createPackage: async (packageData: Partial<PackageList>): Promise<PackageList> => {
    const response = await apiClient.post('/packages', packageData);
    return response.data;
  },

  updatePackage: async (uid: string, packageData: Partial<PackageDetail>): Promise<PackageDetail> => {
    const response = await apiClient.put(`/packages/${uid}`, packageData);
    return response.data;
  },

  deletePackage: async (uid: string): Promise<void> => {
    await apiClient.delete(`/packages/${uid}`);
  },

  getPackageCustomers: async (uid: string, page = 1, pageSize = 10): Promise<PaginatedResponse<CustomerList>> => {
    const response = await apiClient.get(`/packages/${uid}/customers`, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  }
};

// Customer Services
export const customerService = {
  getCustomers: async (page = 1, pageSize = 10): Promise<PaginatedResponse<CustomerList>> => {
    const response = await apiClient.get('/customers', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  getCustomer: async (uid: string): Promise<CustomerDetail> => {
    const response = await apiClient.get(`/customers/${uid}`);
    return response.data;
  },

  createCustomer: async (customerData: Partial<CustomerList>): Promise<CustomerList> => {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (uid: string, customerData: Partial<CustomerDetail>): Promise<CustomerDetail> => {
    const response = await apiClient.put(`/customers/${uid}`, customerData);
    return response.data;
  },

  deleteCustomer: async (uid: string): Promise<void> => {
    await apiClient.delete(`/customers/${uid}`);
  },

  getCustomerPayments: async (uid: string, page = 1, pageSize = 10): Promise<PaginatedResponse<PaymentList>> => {
    const response = await apiClient.get(`/customers/${uid}/payments`, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  createCustomerPayment: async (uid: string, paymentData: Partial<PaymentList>): Promise<PaymentList> => {
    const response = await apiClient.post(`/customers/${uid}/payments`, paymentData);
    return response.data;
  }
};

// Payment Services
export const paymentService = {
  getPayments: async (page = 1, pageSize = 10): Promise<PaginatedResponse<PaymentList>> => {
    const response = await apiClient.get('/payments', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  getPayment: async (uid: string): Promise<PaymentDetail> => {
    const response = await apiClient.get(`/payments/${uid}`);
    return response.data;
  },

  createPayment: async (paymentData: Partial<PaymentList>): Promise<PaymentList> => {
    const response = await apiClient.post('/payments', paymentData);
    return response.data;
  },

  updatePayment: async (uid: string, paymentData: Partial<PaymentDetail>): Promise<PaymentDetail> => {
    const response = await apiClient.put(`/payments/${uid}`, paymentData);
    return response.data;
  },

  deletePayment: async (uid: string): Promise<void> => {
    await apiClient.delete(`/payments/${uid}`);
  }
};
