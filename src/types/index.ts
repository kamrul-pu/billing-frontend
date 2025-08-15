// User types
export interface User {
  id: number;
  uid: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  gender?: string;
  kind: string;
  image?: string;
  is_active?: boolean;
  is_staff?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  access_token_exp: number;
  refresh_token_exp: number;
  user: User;
}

// Package types
export interface Package {
  id: number;
  uid: string;
  name: string;
  description?: string;
  speed_mbps: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface PackageFormData {
  name: string;
  description?: string;
  speed_mbps: number;
  price: number;
}

// Customer types
export interface Customer {
  id: number;
  uid: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  nid?: string;
  is_free: boolean;
  package?: Package;
  package_id?: number;
  connection_start_date?: string;
  is_active: boolean;
  ip_address?: string;
  mac_address?: string;
  username?: string;
  password?: string;
  connection_type: string;
  credentials?: Record<string, any>;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  nid?: string;
  is_free: boolean;
  package_id?: number;
  connection_start_date?: string;
  is_active: boolean;
  ip_address?: string;
  mac_address?: string;
  username?: string;
  password?: string;
  connection_type: string;
}

// Payment types
export interface Payment {
  id: number;
  uid: string;
  name?: string;
  description?: string;
  customer: Customer;
  bill_amount: number;
  amount: number;
  billing_month: string;
  payment_method: string;
  paid: boolean;
  note?: string;
  transaction_id?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  customer_id?: number;
  bill_amount: number;
  amount: number;
  billing_month: string;
  payment_method: string;
  paid: boolean;
  note?: string;
  transaction_id?: string;
  payment_date?: string;
}

// Dashboard types - matching backend API response
export interface DashboardStats {
  total_customers: number;
  active_customers: number;
  total_packages: number;
  total_payments: number;
  total_revenue: string;
  pending_payments: number;
  current_month_payments: number;
}

// API Response types
export interface ApiResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Connection types
export enum ConnectionType {
  DHCP = "DHCP",
  STATIC = "STATIC",
  PPPoE = "PPPoE",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  MOBILE_BANKING = "MOBILE_BANKING",
  ONLINE_PAYMENT = "ONLINE_PAYMENT",
  ROCKET = "ROCKET",
  OTHER = "OTHER",
}

export enum Months {
  JANUARY = "JANUARY",
  FEBRUARY = "FEBRUARY",
  MARCH = "MARCH",
  APRIL = "APRIL",
  MAY = "MAY",
  JUNE = "JUNE",
  JULY = "JULY",
  AUGUST = "AUGUST",
  SEPTEMBER = "SEPTEMBER",
  OCTOBER = "OCTOBER",
  NOVEMBER = "NOVEMBER",
  DECEMBER = "DECEMBER",
}

export enum UserKind {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
  OTHER = "OTHER",
}

export enum UserGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  UNKNOWN = "UNKNOWN",
}
