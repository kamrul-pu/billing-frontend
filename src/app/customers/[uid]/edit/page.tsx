"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomerForm from "@/components/forms/CustomerForm";
import { useCustomer } from "@/hooks/api";

export default function EditCustomerPage() {
  const params = useParams();
  const uid = params?.uid as string;

  const { data: customer, isLoading, error } = useCustomer(uid);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !customer) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-red-600">Customer not found</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-gray-600">Update {customer.name}'s information</p>
          </div>
          
          <CustomerForm customer={customer} isEditing={true} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
