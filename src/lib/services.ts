import { apiClient } from "@/lib/api";
import {
  User,
  Customer,
  Package,
  Payment,
  DashboardStats,
  ApiResponse,
  LoginCredentials,
  AuthResponse,
  CustomerFormData,
  PackageFormData,
  PaymentFormData,
} from "@/types";

// Auth Services
export const authService = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiClient.post("/users/login", credentials),

  refreshToken: (refreshToken: string): Promise<{ access_token: string; access_token_exp: number }> =>
    apiClient.post("/users/login/refresh", { refresh_token: refreshToken }),

  getMe: (): Promise<User> =>
    apiClient.get("/users/me"),

  register: (userData: any): Promise<User> =>
    apiClient.post("/users/register", userData),
};

// User Services
export const userService = {
  getUsers: (params?: Record<string, any>): Promise<ApiResponse<User>> =>
    apiClient.get("/users", { params }),

  getUser: (uid: string): Promise<User> =>
    apiClient.get(`/users/${uid}`),

  createUser: (userData: any): Promise<User> =>
    apiClient.post("/users", userData),

  updateUser: (uid: string, userData: any): Promise<User> =>
    apiClient.patch(`/users/${uid}`, userData),

  deleteUser: (uid: string): Promise<void> =>
    apiClient.delete(`/users/${uid}`),
};

// Customer Services
export const customerService = {
  getCustomers: (params?: Record<string, any>): Promise<ApiResponse<Customer>> =>
    apiClient.get("/customers", { params }),

  getCustomer: (uid: string): Promise<Customer> =>
    apiClient.get(`/customers/${uid}`),

  createCustomer: (customerData: CustomerFormData): Promise<Customer> =>
    apiClient.post("/customers", customerData),

  updateCustomer: (uid: string, customerData: Partial<CustomerFormData>): Promise<Customer> =>
    apiClient.patch(`/customers/${uid}`, customerData),

  deleteCustomer: (uid: string): Promise<void> =>
    apiClient.delete(`/customers/${uid}`),

  getCustomerPayments: (uid: string, params?: Record<string, any>): Promise<ApiResponse<Payment>> =>
    apiClient.get(`/customers/${uid}/payments`, { params }),

  // NEW: Create a payment for a specific customer via customer payments endpoint
  createCustomerPayment: (uid: string, data: PaymentFormData): Promise<Payment> =>
    apiClient.post(`/customers/${uid}/payments`, data),

  toggleCustomerStatus: (data: { username: string; is_active: boolean }): Promise<void> =>
    apiClient.post("/customers/status/toggle", data),

  generateBills: (params?: { month?: string }): Promise<{ message: string; created_payments_count: number }> =>
    apiClient.post("/customers/bills/generate", {}, { params }),
};

// Package Services
export const packageService = {
  getPackages: (params?: Record<string, any>): Promise<ApiResponse<Package>> =>
    apiClient.get("/packages", { params }),

  getPackage: (uid: string): Promise<Package> =>
    apiClient.get(`/packages/${uid}`),

  createPackage: (packageData: PackageFormData): Promise<Package> =>
    apiClient.post("/packages", packageData),

  updatePackage: (uid: string, packageData: Partial<PackageFormData>): Promise<Package> =>
    apiClient.patch(`/packages/${uid}`, packageData),

  deletePackage: (uid: string): Promise<void> =>
    apiClient.delete(`/packages/${uid}`),

  getPackageCustomers: (uid: string, params?: Record<string, any>): Promise<ApiResponse<Customer>> =>
    apiClient.get(`/packages/${uid}/customers`, { params }),
};

// Payment Services
export const paymentService = {
  getPayments: (params?: Record<string, any>): Promise<ApiResponse<Payment>> =>
    apiClient.get("/payments", { params }),

  getPayment: (uid: string): Promise<Payment> =>
    apiClient.get(`/payments/${uid}`),

  createPayment: (data: PaymentFormData): Promise<Payment> =>
    apiClient.post("/payments", data),

  updatePayment: (uid: string, data: Partial<PaymentFormData>): Promise<Payment> =>
    apiClient.patch(`/payments/${uid}`, data),

  deletePayment: (uid: string): Promise<void> =>
    apiClient.delete(`/payments/${uid}`),
};

// Dashboard Services
export const dashboardService = {
  getStats: (): Promise<DashboardStats> =>
    apiClient.get("/dashboard"),
};
