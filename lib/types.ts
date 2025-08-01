// User types
export interface UserBase {
  id?: number;
  uid?: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  email?: string;
  gender?: 'FEMALE' | 'MALE' | 'UNKNOWN';
  image?: string;
}

export interface UserList extends UserBase {
  kind?: 'ADMIN' | 'CUSTOMER' | 'MANAGER' | 'STAFF' | 'SUPER_ADMIN' | 'OTHER';
}

export interface UserDetail extends UserList {
  status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'REMOVED';
  is_staff?: boolean;
}

// Package types
export interface PackageBase {
  uid: string;
  name: string;
  description?: string;
  price: number;
  speed_mbps: number;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface PackageList extends PackageBase {
  customer_count?: number;
}

export interface PackageDetail extends PackageBase {
  is_active: boolean;
  usage_stats?: {
    total_customers: number;
    active_customers: number;
  };
}

// Customer types
export interface CustomerBase {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  package_uid: string;
  connection_start_date?: string;
  ip_address?: string;
  mac_address?: string;
  username?: string;
  connection_type?: 'DHCP' | 'STATIC' | 'PPPoE';
  credentials?: Record<string, any>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerList extends CustomerBase {
  package?: {
    uid: string;
    name: string;
    speed_mbps: number;
    price: number;
  };
  package_name?: string;
}

export interface Customer extends CustomerList {
  package_details?: PackageDetail;
  payment_history?: {
    total_payments: number;
    last_payment_date?: string;
    last_payment_amount?: number;
  };
  user?: UserList;
}

export interface CustomerDetail extends Customer {
  total_due?: number;
  connection_details?: {
    ip_address: string;
    mac_address: string;
    username: string;
    password: string;
    connection_type: 'DHCP' | 'STATIC' | 'PPPoE';
  };
}

// Payment types
export interface PaymentBase {
  uid: string;
  customer_uid: string;
  amount: number;
  billing_month: 'JANUARY' | 'FEBRUARY' | 'MARCH' | 'APRIL' | 'MAY' | 'JUNE' | 'JULY' | 'AUGUST' | 'SEPTEMBER' | 'OCTOBER' | 'NOVEMBER' | 'DECEMBER';
  payment_method: 'BANK_TRANSFER' | 'BKASH' | 'CASH' | 'NAGAD' | 'MOBILE_BANKING' | 'ONLINE_PAYMENT' | 'ROCKET' | 'OTHER';
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  payment_date: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentList extends PaymentBase {
  customer_name: string;
  package_name: string;
}

export interface PaymentDetail extends PaymentBase {
  customer_details: CustomerBase;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
