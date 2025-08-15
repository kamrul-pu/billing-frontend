"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PackageForm from "@/components/forms/PackageForm";
import { usePackage } from "@/hooks/api";

export default function EditPackagePage() {
  const params = useParams();
  const uid = params.uid as string;
  
  const { data: packageData, isLoading, error } = usePackage(uid);

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

  if (error || !packageData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load package</p>
            <p className="text-sm text-gray-500 mt-2">
              {error?.message || "Package not found"}
            </p>
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
            <p className="text-gray-600">Update package information</p>
          </div>
          
          <PackageForm package={packageData} isEditing={true} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
