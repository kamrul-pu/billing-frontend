import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customerService,
  packageService,
  paymentService,
  userService,
  dashboardService,
} from "@/lib/services";
import {
  Customer,
  Package,
  Payment,
  User,
  CustomerFormData,
  PackageFormData,
  PaymentFormData,
} from "@/types";

// Query Keys
export const queryKeys = {
  dashboard: ["dashboard"],
  customers: {
    all: ["customers"],
    list: (params?: Record<string, any>) => ["customers", "list", params],
    detail: (uid: string) => ["customers", "detail", uid],
    payments: (uid: string, params?: Record<string, any>) => [
      "customers",
      uid,
      "payments",
      params,
    ],
  },
  packages: {
    all: ["packages"],
    list: (params?: Record<string, any>) => ["packages", "list", params],
    detail: (uid: string) => ["packages", "detail", uid],
    customers: (uid: string, params?: Record<string, any>) => [
      "packages",
      uid,
      "customers",
      params,
    ],
  },
  payments: {
    all: ["payments"],
    list: (params?: Record<string, any>) => ["payments", "list", params],
    detail: (uid: string) => ["payments", "detail", uid],
  },
  users: {
    all: ["users"],
    list: (params?: Record<string, any>) => ["users", "list", params],
    detail: (uid: string) => ["users", "detail", uid],
  },
};

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardService.getStats,
  });
};

// Customer Hooks
export const useCustomers = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customerService.getCustomers(params),
  });
};

export const useCustomer = (uid: string) => {
  return useQuery({
    queryKey: queryKeys.customers.detail(uid),
    queryFn: () => customerService.getCustomer(uid),
    enabled: !!uid,
  });
};

export const useCustomerPayments = (uid: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.customers.payments(uid, params),
    queryFn: () => customerService.getCustomerPayments(uid, params),
    enabled: !!uid,
  });
};

export const useCreateCustomerPayment = (uid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentFormData) => customerService.createCustomerPayment(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.payments(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CustomerFormData) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<CustomerFormData> }) =>
      customerService.updateCustomer(uid, data),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uid: string) => customerService.deleteCustomer(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useToggleCustomerStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { username: string; is_active: boolean }) =>
      customerService.toggleCustomerStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

export const useGenerateBills = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params?: { month?: string }) => customerService.generateBills(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

// Package Hooks
export const usePackages = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.packages.list(params),
    queryFn: () => packageService.getPackages(params),
  });
};

export const usePackage = (uid: string) => {
  return useQuery({
    queryKey: queryKeys.packages.detail(uid),
    queryFn: () => packageService.getPackage(uid),
    enabled: !!uid,
  });
};

export const usePackageCustomers = (uid: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.packages.customers(uid, params),
    queryFn: () => packageService.getPackageCustomers(uid, params),
    enabled: !!uid,
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PackageFormData) => packageService.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<PackageFormData> }) =>
      packageService.updatePackage(uid, data),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.detail(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uid: string) => packageService.deletePackage(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

// Payment Hooks
export const usePayments = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => paymentService.getPayments(params),
  });
};

export const usePayment = (uid: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(uid),
    queryFn: () => paymentService.getPayment(uid),
    enabled: !!uid,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PaymentFormData) => paymentService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<PaymentFormData> }) =>
      paymentService.updatePayment(uid, data),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uid: string) => paymentService.deletePayment(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

// User Hooks
export const useUsers = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.getUsers(params),
  });
};

export const useUser = (uid: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(uid),
    queryFn: () => userService.getUser(uid),
    enabled: !!uid,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: any }) =>
      userService.updateUser(uid, data),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(uid) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uid: string) => userService.deleteUser(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};
