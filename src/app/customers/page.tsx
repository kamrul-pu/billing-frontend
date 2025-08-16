"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useCustomers, useDeleteCustomer, useToggleCustomerStatus, usePackages } from "@/hooks/api";

import { formatDate, formatCurrency } from "@/lib/utils";
import { Customer } from "@/types";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [isFreeFilter, setIsFreeFilter] = useState<string>("all");
  const [connectionTypeFilter, setConnectionTypeFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // State for actual filter values (used in API calls)
  const [activeNameFilter, setActiveNameFilter] = useState("");
  const [activePhoneFilter, setActivePhoneFilter] = useState("");
  const [activeUsernameFilter, setActiveUsernameFilter] = useState("");
  
  const { data: packagesData } = usePackages();
  
  // Use all available backend filters with pagination
  const { data, isLoading, error } = useCustomers({
    search: search || undefined,
    name: activeNameFilter || undefined,
    phone: activePhoneFilter || undefined,
    username: activeUsernameFilter || undefined,
    is_active: isActiveFilter !== "all" ? isActiveFilter === "active" : undefined,
    is_free: isFreeFilter !== "all" ? isFreeFilter === "free" : undefined,
    connection_type: connectionTypeFilter !== "all" ? connectionTypeFilter : undefined,
    package_id: packageFilter !== "all" ? packageFilter : undefined,
    page: currentPage,
    page_size: pageSize,
  });

  const deleteCustomerMutation = useDeleteCustomer();
  const toggleStatusMutation = useToggleCustomerStatus();

  // Calculate pagination info
  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;
  const hasNextPage = data?.next ? true : false;
  const hasPreviousPage = data?.previous ? true : false;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeNameFilter, activePhoneFilter, activeUsernameFilter, isActiveFilter, isFreeFilter, connectionTypeFilter, packageFilter]);

  // Handle all filters submission at once
  const handleAllFiltersSubmit = () => {
    setActiveNameFilter(nameFilter);
    setActivePhoneFilter(phoneFilter);
    setActiveUsernameFilter(usernameFilter);
  };

  // Handle filter submission on Enter key
  const handleFilterSubmit = (filterType: 'name' | 'phone' | 'username') => {
    switch (filterType) {
      case 'name':
        setActiveNameFilter(nameFilter);
        break;
      case 'phone':
        setActivePhoneFilter(phoneFilter);
        break;
      case 'username':
        setActiveUsernameFilter(usernameFilter);
        break;
    }
  };

  // Handle key press for filters
  const handleFilterKeyPress = (e: React.KeyboardEvent, filterType: 'name' | 'phone' | 'username') => {
    if (e.key === 'Enter') {
      handleFilterSubmit(filterType);
    }
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      deleteCustomerMutation.mutate(customer.uid, {
        onSuccess: () => {
          alert("Customer deleted successfully");
        },
        onError: (error: any) => {
          alert(`Failed to delete customer: ${error.message}`);
        },
      });
    }
  };

  const handleToggleStatus = (customer: Customer) => {
    if (!customer.username) {
      alert("Customer must have a username to toggle status");
      return;
    }
    
    const action = customer.is_active ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} ${customer.name}?`)) {
      toggleStatusMutation.mutate({
        username: customer.username,
        is_active: !customer.is_active,
      }, {
        onSuccess: () => {
          alert(`Customer ${action}d successfully`);
        },
        onError: (error: any) => {
          alert(`Failed to ${action} customer: ${error.message}`);
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
            <p className="text-red-600">Failed to load customers</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600">Manage your ISP customers</p>
            </div>
            <Button asChild>
              <Link href="/customers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter customers by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* General Search */}
                {/* <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Search</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search customers by name, phone, or username..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          // Search is already triggered by state change
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        // Trigger search by clearing and resetting to force re-render
                        const currentSearch = search;
                        setSearch('');
                        setTimeout(() => setSearch(currentSearch), 10);
                      }}
                      className="px-4"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div> */}
                
                {/* Individual Filters */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Name Filter */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Name</label>
                      <Input
                        placeholder="Filter by name"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAllFiltersSubmit();
                          }
                        }}
                        className="text-sm"
                      />
                    </div>
                    
                    {/* Phone Filter */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        placeholder="Filter by phone"
                        value={phoneFilter}
                        onChange={(e) => setPhoneFilter(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAllFiltersSubmit();
                          }
                        }}
                        className="text-sm"
                      />
                    </div>
                    
                    {/* Username Filter */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Username</label>
                      <Input
                        placeholder="Filter by username"
                        value={usernameFilter}
                        onChange={(e) => setUsernameFilter(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAllFiltersSubmit();
                          }
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Search Button for Filters */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleAllFiltersSubmit}
                      className="px-8"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
                
                {/* Filter Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                    <select
                      value={isActiveFilter}
                      onChange={(e) => setIsActiveFilter(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  {/* Free Customer Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
                    <select
                      value={isFreeFilter}
                      onChange={(e) => setIsFreeFilter(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Types</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  
                  {/* Connection Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Connection</label>
                    <select
                      value={connectionTypeFilter}
                      onChange={(e) => setConnectionTypeFilter(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Types</option>
                      <option value="DHCP">DHCP</option>
                      <option value="STATIC">Static IP</option>
                      <option value="PPPoE">PPPoE</option>
                    </select>
                  </div>
                  
                  {/* Package Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Package</label>
                    <select
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Packages</option>
                      {packagesData?.results?.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setNameFilter("");
                      setPhoneFilter("");
                      setUsernameFilter("");
                      setActiveNameFilter("");
                      setActivePhoneFilter("");
                      setActiveUsernameFilter("");
                      setIsActiveFilter("all");
                      setIsFreeFilter("all");
                      setConnectionTypeFilter("all");
                      setPackageFilter("all");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
                
                {/* Active Filters Display */}
                {(search || activeNameFilter || activePhoneFilter || activeUsernameFilter || isActiveFilter !== "all" || isFreeFilter !== "all" || connectionTypeFilter !== "all" || packageFilter !== "all") && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {search && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Search: {search}
                        <button
                          onClick={() => setSearch("")}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {activeNameFilter && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Name: {activeNameFilter}
                        <button
                          onClick={() => {
                            setActiveNameFilter("");
                            setNameFilter("");
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {activePhoneFilter && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Phone: {activePhoneFilter}
                        <button
                          onClick={() => {
                            setActivePhoneFilter("");
                            setPhoneFilter("");
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {activeUsernameFilter && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Username: {activeUsernameFilter}
                        <button
                          onClick={() => {
                            setActiveUsernameFilter("");
                            setUsernameFilter("");
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {isActiveFilter !== "all" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Status: {isActiveFilter === "active" ? "Active" : "Inactive"}
                        <button
                          onClick={() => setIsActiveFilter("all")}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {isFreeFilter !== "all" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        Type: {isFreeFilter === "free" ? "Free" : "Paid"}
                        <button
                          onClick={() => setIsFreeFilter("all")}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {connectionTypeFilter !== "all" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        Connection: {connectionTypeFilter}
                        <button
                          onClick={() => setConnectionTypeFilter("all")}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {packageFilter !== "all" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Package: {packagesData?.results?.find(p => p.id.toString() === packageFilter)?.name}
                        <button
                          onClick={() => setPackageFilter("all")}
                          className="ml-1 text-indigo-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customers ({data?.count || 0})</CardTitle>
              <CardDescription>A list of all customers in your system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Connection</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results?.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.email && (
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        {customer.package ? (
                          <div>
                            <div className="font-medium">{customer.package.name}</div>
                            <div className="text-sm text-gray-500">
                              {customer.package.speed_mbps} Mbps - {formatCurrency(customer.package.price)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No package</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {customer.connection_type || "N/A"}
                          </span>
                          {customer.ip_address && (
                            <div className="text-xs text-gray-500 mt-1">
                              {customer.ip_address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              customer.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {customer.is_active ? "Active" : "Inactive"}
                          </span>
                          {customer.is_free && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Free
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${customer.uid}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${customer.uid}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {customer.username && (
                            <Button
                              variant={customer.is_active ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleStatus(customer)}
                              disabled={toggleStatusMutation.isPending}
                              className={customer.is_active ? "text-red-600 border-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                            >
                              {customer.is_active ? "Disable" : "Enable"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer)}
                            disabled={deleteCustomerMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {!data?.results?.length && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No customers found</p>
                </div>
              )}

              {/* Pagination */}
              {data && data.count > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                  {/* Mobile-first pagination info and controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-sm text-gray-700 hidden sm:inline">per page</span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.count)} of {data.count}
                    </span>
                  </div>
                  
                  {/* Navigation controls */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!hasPreviousPage}
                      className="px-2 sm:px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Prev</span>
                    </Button>
                    
                    {/* Page numbers - hidden on mobile if more than 3 pages */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Mobile page info */}
                    <div className="sm:hidden flex items-center px-2 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                      {currentPage} / {totalPages}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasNextPage}
                      className="px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
