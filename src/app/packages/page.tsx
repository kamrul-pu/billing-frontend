"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { usePackages, useDeletePackage } from "@/hooks/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Package } from "@/types";

export default function PackagesPage() {
  const [search, setSearch] = useState("");
  
  // Fetch all packages once, no search parameters
  const { data, isLoading, error } = usePackages();
  
  // Client-side filtering for packages
  const filteredPackages = data?.results?.filter((pkg: Package) => {
    if (!search) return true;
    return pkg.name.toLowerCase().includes(search.toLowerCase()) ||
           pkg.speed_mbps.toString().includes(search) ||
           pkg.price.toString().includes(search);
  }) || [];

  const deletePackageMutation = useDeletePackage();

  const handleDelete = (pkg: Package) => {
    if (confirm(`Are you sure you want to delete ${pkg.name}?`)) {
      deletePackageMutation.mutate(pkg.uid, {
        onSuccess: () => {
          alert("Package deleted successfully");
        },
        onError: (error: any) => {
          alert(`Failed to delete package: ${error.message}`);
        },
      });
    }
  };

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

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load packages</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Packages</h1>
              <p className="text-gray-600">Manage your service packages</p>
            </div>
            <Button asChild>
              <Link href="/packages/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
              <CardDescription>Find packages by name, speed, or price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search packages by name, speed, or price..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Search Results Info */}
                {search && (
                  <div className="text-sm text-gray-600">
                    Showing {filteredPackages.length} of {data?.results?.length || 0} packages
                    {search && (
                      <span className="ml-2">
                        matching "<span className="font-medium">{search}</span>"
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Packages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Packages ({filteredPackages.length})</CardTitle>
              <CardDescription>A list of all service packages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg: Package) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div className="font-medium">{pkg.name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{pkg.speed_mbps} Mbps</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          {formatCurrency(pkg.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/packages/${pkg.uid}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pkg)}
                            disabled={deletePackageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {!filteredPackages.length && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {search ? `No packages found matching "${search}"` : "No packages found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
