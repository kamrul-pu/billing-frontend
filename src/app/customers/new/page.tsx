"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomerForm from "@/components/forms/CustomerForm";

export default function NewCustomerPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-gray-600">Create a new customer account</p>
          </div>
          
          <CustomerForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
