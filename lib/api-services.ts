import apiClient from './api-client';
import { CustomerList, CustomerDetail, PaymentList, PackageList } from './types';

// Auth services
export const authService = {
  login: async (phone: string, password: string) => {
    const response = await apiClient.post('/users/login', { phone, password });
    // Store user data and tokens
    if (response.data.access_token) {
      localStorage.setItem('accessToken', response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/users/me');
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  hasPermission: (requiredKind: string | string[]) => {
    const user = authService.getCurrentUser();
    if (!user || !user.kind) return false;
    
    if (Array.isArray(requiredKind)) {
      return requiredKind.includes(user.kind);
    }
    return user.kind === requiredKind;
  },
};

// Customer services
export const customerService = {
  getCustomers: async (page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/customers?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
  getCustomer: async (uid: string) => {
    const response = await apiClient.get(`/customers/${uid}`);
    return response.data;
  },
  createCustomer: async (customer: Partial<CustomerList>) => {
    const response = await apiClient.post('/customers', customer);
    return response.data;
  },
  updateCustomer: async (uid: string, customer: Partial<CustomerDetail>) => {
    const response = await apiClient.put(`/customers/${uid}`, customer);
    return response.data;
  },
  deleteCustomer: async (uid: string) => {
    await apiClient.delete(`/customers/${uid}`);
  },
  getCustomerPayments: async (uid: string, page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/customers/${uid}/payments?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
};

// Package services
export const packageService = {
  getPackages: async (page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/packages?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
  getPackage: async (uid: string) => {
    const response = await apiClient.get(`/packages/${uid}`);
    return response.data;
  },
  createPackage: async (packageData: Partial<PackageList>) => {
    const response = await apiClient.post('/packages', packageData);
    return response.data;
  },
  updatePackage: async (uid: string, packageData: Partial<PackageList>) => {
    const response = await apiClient.put(`/packages/${uid}`, packageData);
    return response.data;
  },
  deletePackage: async (uid: string) => {
    await apiClient.delete(`/packages/${uid}`);
  },
  getPackageCustomers: async (uid: string, page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/packages/${uid}/customers?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
};

// Payment services
export const paymentService = {
  getPayments: async (page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/payments?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
  getPayment: async (uid: string) => {
    const response = await apiClient.get(`/payments${uid}/`);
    return response.data;
  },
  createPayment: async (payment: Partial<PaymentList>) => {
    const response = await apiClient.post('/payments', payment);
    return response.data;
  },
  updatePayment: async (uid: string, payment: Partial<PaymentList>) => {
    const response = await apiClient.put(`/payments${uid}/`, payment);
    return response.data;
  },
  deletePayment: async (uid: string) => {
    await apiClient.delete(`/payments${uid}/`);
  },
};
