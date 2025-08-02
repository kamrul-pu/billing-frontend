// Auth types (simplified)
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Me;
}

export interface Me {
  id?: number;
  uid?: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  email?: string;
  gender?: 'FEMALE' | 'MALE' | 'UNKNOWN';
  image?: string;
  kind?: 'ADMIN' | 'CUSTOMER' | 'MANAGER' | 'STAFF' | 'SUPER_ADMIN' | 'OTHER';
  created_at?: string;
  updated_at?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

// Package types
export interface PackageBase {
  id?: number;
  uid?: string;
  name: string;
  speed_mbps?: number;
  price?: string; // Decimal format from backend
  description?: string;
}

export interface PackageList extends PackageBase {}

export interface PackageDetail extends PackageBase {
  created_at?: string;
  updated_at?: string;
}

// Customer types
export interface CustomerBase {
  id?: number;
  uid?: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  nid?: string;
}

export interface CustomerList extends CustomerBase {
  package?: PackageBase;
  package_id?: number;
  connection_start_date?: string;
  is_active?: boolean;
  ip_address?: string;
  mac_address?: string;
  username?: string;
  password?: string;
  connection_type?: 'DHCP' | 'STATIC' | 'PPPoE';
  credentials?: Record<string, any>;
}

export interface CustomerDetail extends CustomerList {
  user?: {
    id?: number;
    uid?: string;
    first_name?: string;
    last_name?: string;
    phone: string;
    email?: string;
    kind?: 'ADMIN' | 'CUSTOMER' | 'MANAGER' | 'STAFF' | 'SUPER_ADMIN' | 'OTHER';
  };
  package: PackageBase;
  package_uid?: string;
  connection_start_date?: string;
  is_active?: boolean;
}

// Payment types
export interface PaymentBase {
  id?: number;
  uid?: string;
  customer?: CustomerBase;
  entry_by?: {
    id?: number;
    uid?: string;
    first_name?: string;
    last_name?: string;
    phone: string;
    email?: string;
  };
  amount?: string; // Decimal format from backend
  billing_month?: 'JANUARY' | 'FEBRUARY' | 'MARCH' | 'APRIL' | 'MAY' | 'JUNE' | 'JULY' | 'AUGUST' | 'SEPTEMBER' | 'OCTOBER' | 'NOVEMBER' | 'DECEMBER';
  payment_method?: 'BANK_TRANSFER' | 'BKASH' | 'CASH' | 'NAGAD' | 'MOBILE_BANKING' | 'ONLINE_PAYMENT' | 'ROCKET' | 'OTHER';
  paid?: boolean;
  transaction_id?: string;
  payment_date?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentList extends PaymentBase {
  customer_id?: number;
}

export interface PaymentDetail extends PaymentBase {}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
