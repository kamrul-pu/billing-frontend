"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PackageForm from "@/components/forms/PackageForm";

export default function NewPackagePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Package</h1>
            <p className="text-gray-600">Create a new service package</p>
          </div>
          
          <PackageForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
