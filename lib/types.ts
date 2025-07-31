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

// Customer types
export interface CustomerList {
  id?: number;
  uid?: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  package?: number;
  package_name?: string;
  connection_start_date?: string;
  is_active?: boolean;
  ip_address?: string;
  mac_address?: string;
  username?: string;
  password?: string;
  connection_type?: 'DHCP' | 'STATIC' | 'PPPoE';
  credentials?: Record<string, any>;
}

export interface CustomerDetail extends Omit<CustomerList, 'package_name'> {
  user?: UserList;
}

// Package types
export interface PackageList {
  id?: number;
  uid?: string;
  name: string;
  speed_mbps?: number;
  price?: string;
  description?: string;
}

export interface PackageDetail extends PackageList {
  created_at?: string;
  updated_at?: string;
}

// Payment types
export interface PaymentList {
  id?: number;
  customer: number;
  amount?: string;
  billing_month?: 'JANUARY' | 'FEBRUARY' | 'MARCH' | 'APRIL' | 'MAY' | 'JUNE' | 'JULY' | 'AUGUST' | 'SEPTEMBER' | 'OCTOBER' | 'NOVEMBER' | 'DECEMBER';
  payment_method?: 'BANK_TRANSFER' | 'BKASH' | 'CASH' | 'NAGAD' | 'MOBILE_BANKING' | 'ONLINE_PAYMENT' | 'ROCKET' | 'OTHER';
  paid?: boolean;
  transaction_id?: string;
  payment_date?: string;
  note?: string;
  customer_name?: string;
}

export interface PaymentDetail extends PaymentList {}
