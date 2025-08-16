"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { usePayments, useDeletePayment, useCreatePayment, useCustomers } from "@/hooks/api";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";
import { Payment, PaymentFormData, PaymentMethod, Months } from "@/types";
import { useForm } from "react-hook-form";

export default function PaymentsPage() {
  // Filter states
  const [paidFilter, setPaidFilter] = useState<string>("all");
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState("");
  const [collectedByFilter, setCollectedByFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [paymentDateFilter, setPaymentDateFilter] = useState("");
  
  // Active filters for API calls
  const [activeCustomerNameFilter, setActiveCustomerNameFilter] = useState("");
  const [activeCustomerPhoneFilter, setActiveCustomerPhoneFilter] = useState("");
  const [activeCollectedByFilter, setActiveCollectedByFilter] = useState("");
  const [activePaymentDateFilter, setActivePaymentDateFilter] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Customer search states
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchName, setCustomerSearchName] = useState("");
  const [customerSearchUsername, setCustomerSearchUsername] = useState("");
  const [customerSearchPhone, setCustomerSearchPhone] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Payment form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // API calls
  const { data, isLoading, error } = usePayments({
    paid: paidFilter !== "all" ? paidFilter === "paid" : undefined,
    customer_name: activeCustomerNameFilter || undefined,
    customer_phone: activeCustomerPhoneFilter || undefined,
    collected_by: activeCollectedByFilter || undefined,
    month: monthFilter !== "all" ? monthFilter : undefined,
    payment_method: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    payment_date: activePaymentDateFilter || undefined,
    page: currentPage,
    page_size: pageSize,
  });

  const { data: customersData } = useCustomers({ 
    name: customerSearchName || undefined,
    username: customerSearchUsername || undefined,
    phone: customerSearchPhone || undefined,
  });
  const deletePaymentMutation = useDeletePayment();
  const createPaymentMutation = useCreatePayment();

  // Payment form
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      customer_id: undefined,
      amount: 0,
      billing_month: "",
      payment_method: PaymentMethod.CASH,
      paid: false,
      note: "",
      payment_date: new Date().toISOString().split('T')[0],
    }
  });

  // Calculate pagination info
  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;
  const hasNextPage = data?.next ? true : false;
  const hasPreviousPage = data?.previous ? true : false;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [paidFilter, monthFilter, paymentMethodFilter, activeCustomerNameFilter, activeCustomerPhoneFilter, activeCollectedByFilter, activePaymentDateFilter]);

  // Handle filter submission (Enter key or button click)
  const handleFilterSubmit = (filterType: string) => {
    switch (filterType) {
      case 'customerName':
        setActiveCustomerNameFilter(customerNameFilter);
        break;
      case 'customerPhone':
        setActiveCustomerPhoneFilter(customerPhoneFilter);
        break;
      case 'collectedBy':
        setActiveCollectedByFilter(collectedByFilter);
        break;
      case 'paymentDate':
        setActivePaymentDateFilter(paymentDateFilter);
        break;
    }
  };

  // Handle Enter key press for filters
  const handleFilterKeyPress = (e: React.KeyboardEvent, filterType: string) => {
    if (e.key === 'Enter') {
      handleFilterSubmit(filterType);
    }
  };

  // Handle customer search
  const handleCustomerSearch = () => {
    if (customerSearchName.trim() || customerSearchUsername.trim() || customerSearchPhone.trim()) {
      setCustomerSearchResults(customersData?.results || []);
    }
  };

  // Handle clear customer search filters
  const handleClearCustomerSearch = () => {
    setCustomerSearchName("");
    setCustomerSearchUsername("");
    setCustomerSearchPhone("");
    setCustomerSearchResults([]);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setValue("customer_id", customer.id);
    setValue("amount", customer.package?.price || 0);
    setShowCustomerSearch(false);
    setShowPaymentForm(true);
  };

  // Handle payment creation
  const onSubmit = async (data: PaymentFormData) => {
    try {
      await createPaymentMutation.mutateAsync(data);
      alert("Payment created successfully!");
      reset();
      setShowPaymentForm(false);
      setSelectedCustomer(null);
    } catch (error: any) {
      // Extract the specific error message from API response
      let errorMessage = "Failed to create payment";
      
      if (error.response?.data) {
        const apiError = error.response.data;
        
        // Handle validation errors (field-specific errors)
        if (typeof apiError === 'object' && !Array.isArray(apiError)) {
          const fieldErrors = [];
          for (const [field, message] of Object.entries(apiError)) {
            if (typeof message === 'string') {
              fieldErrors.push(message);
            } else if (Array.isArray(message)) {
              fieldErrors.push(...message);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(', ');
          }
        }
        // Handle array of error messages
        else if (Array.isArray(apiError)) {
          errorMessage = apiError.join(', ');
        }
        // Handle string error message
        else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
        // Handle detail field in error response
        else if (apiError.detail) {
          errorMessage = apiError.detail;
        }
      }
      // Fallback to generic error message if no specific message found
      else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = (payment: Payment) => {
    if (confirm(`Are you sure you want to delete this payment?`)) {
      deletePaymentMutation.mutate(payment.uid, {
        onSuccess: () => {
          alert("Payment deleted successfully");
        },
        onError: (error: any) => {
          alert(`Failed to delete payment: ${error.message}`);
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
            <p className="text-red-600">Failed to load payments</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600">Manage customer payments and billing</p>
            </div>
            <Button onClick={() => setShowCustomerSearch(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter payments by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                    <select
                      value={paidFilter}
                      onChange={(e) => setPaidFilter(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  
                  {/* Month Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Month</label>
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Months</option>
                      {Object.values(Months).map((month) => (
                        <option key={month} value={month}>
                          {month.charAt(0) + month.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Payment Method Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Method</label>
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="all">All Methods</option>
                      {Object.values(PaymentMethod).map((method) => (
                        <option key={method} value={method}>
                          {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Payment Date Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Payment Date</label>
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={paymentDateFilter}
                        onChange={(e) => {
                          setPaymentDateFilter(e.target.value);
                          // Auto-apply filter when date is selected
                          if (e.target.value) {
                            setActivePaymentDateFilter(e.target.value);
                          }
                        }}
                        className="text-sm flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleFilterSubmit('paymentDate')}
                        className="px-2"
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Additional Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Customer Name Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Customer Name</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Filter by customer name"
                        value={customerNameFilter}
                        onChange={(e) => setCustomerNameFilter(e.target.value)}
                        onKeyPress={(e) => handleFilterKeyPress(e, 'customerName')}
                        className="text-sm flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleFilterSubmit('customerName')}
                        className="px-2"
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Customer Phone Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Customer Phone</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Filter by customer phone"
                        value={customerPhoneFilter}
                        onChange={(e) => setCustomerPhoneFilter(e.target.value)}
                        onKeyPress={(e) => handleFilterKeyPress(e, 'customerPhone')}
                        className="text-sm flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleFilterSubmit('customerPhone')}
                        className="px-2"
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Collected By Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Collected By</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Filter by collector name"
                        value={collectedByFilter}
                        onChange={(e) => setCollectedByFilter(e.target.value)}
                        onKeyPress={(e) => handleFilterKeyPress(e, 'collectedBy')}
                        className="text-sm flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleFilterSubmit('collectedBy')}
                        className="px-2"
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Customer ID Filter */}
                  {/* <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Customer ID</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Filter by customer ID"
                        value={customerIdFilter}
                        onChange={(e) => setCustomerIdFilter(e.target.value)}
                        onKeyPress={(e) => handleFilterKeyPress(e, 'customerId')}
                        className="text-sm flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleFilterSubmit('customerId')}
                        className="px-2"
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                  </div> */}
                </div>
                
                {/* Active Filters Display */}
                {(activeCustomerNameFilter || activeCustomerPhoneFilter || activeCollectedByFilter || paidFilter !== "all" || monthFilter !== "all" || paymentMethodFilter !== "all" || activePaymentDateFilter) && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Active Filters:</div>
                    <div className="flex flex-wrap gap-2">
                      {activeCustomerNameFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Name: {activeCustomerNameFilter}
                          <button
                            onClick={() => {
                              setActiveCustomerNameFilter("");
                              setCustomerNameFilter("");
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {activeCustomerPhoneFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Phone: {activeCustomerPhoneFilter}
                          <button
                            onClick={() => {
                              setActiveCustomerPhoneFilter("");
                              setCustomerPhoneFilter("");
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {activeCollectedByFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Collected By: {activeCollectedByFilter}
                          <button
                            onClick={() => {
                              setActiveCollectedByFilter("");
                              setCollectedByFilter("");
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {paidFilter !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Status: {paidFilter === "paid" ? "Paid" : "Unpaid"}
                          <button
                            onClick={() => setPaidFilter("all")}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {monthFilter !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Month: {monthFilter}
                          <button
                            onClick={() => setMonthFilter("all")}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {paymentMethodFilter !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Method: {paymentMethodFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <button
                            onClick={() => setPaymentMethodFilter("all")}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {activePaymentDateFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Payment Date: {activePaymentDateFilter}
                          <button
                            onClick={() => {
                              setActivePaymentDateFilter("");
                              setPaymentDateFilter("");
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Clear Filters */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPaidFilter("all");
                      setCustomerNameFilter("");
                      setCustomerPhoneFilter("");
                      setCollectedByFilter("");
                      setMonthFilter("all");
                      setPaymentMethodFilter("all");
                      setPaymentDateFilter("");
                      setActiveCustomerNameFilter("");
                      setActiveCustomerPhoneFilter("");
                      setActiveCollectedByFilter("");
                      setActivePaymentDateFilter("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Search Modal */}
          {showCustomerSearch && (
            <Card className="fixed inset-4 z-50 overflow-y-auto bg-white">
              <CardHeader>
                <CardTitle>Search Customer</CardTitle>
                <CardDescription>Find a customer to create payment for</CardDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomerSearch(false)}
                  className="absolute right-4 top-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Name</label>
                      <Input
                        placeholder="Filter by name"
                        value={customerSearchName}
                        onChange={(e) => setCustomerSearchName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCustomerSearch();
                          }
                        }}
                        className="text-sm flex-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Username</label>
                      <Input
                        placeholder="Filter by username"
                        value={customerSearchUsername}
                        onChange={(e) => setCustomerSearchUsername(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCustomerSearch();
                          }
                        }}
                        className="text-sm flex-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        placeholder="Filter by phone"
                        value={customerSearchPhone}
                        onChange={(e) => setCustomerSearchPhone(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCustomerSearch();
                          }
                        }}
                        className="text-sm flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handleClearCustomerSearch}
                      disabled={!customerSearchName && !customerSearchUsername && !customerSearchPhone}
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={handleCustomerSearch}>Search</Button>
                  </div>

                  {customerSearchResults.length > 0 && (
                    <div className="max-h-64 overflow-y-auto">
                      {customerSearchResults.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-600">
                            {customer.phone} • {customer.username || 'No username'}
                          </div>
                          {customer.package && (
                            <div className="text-sm text-gray-500">
                              Package: {customer.package.name} - {formatCurrency(customer.package.price)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Creation Form */}
          {showPaymentForm && selectedCustomer && (
            <Card className="fixed inset-4 z-50 overflow-y-auto bg-white">
              <CardHeader>
                <CardTitle>Create Payment for {selectedCustomer.name}</CardTitle>
                <CardDescription>Enter payment details</CardDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedCustomer(null);
                    reset();
                  }}
                  className="absolute right-4 top-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Customer:</span> {selectedCustomer.name} ({selectedCustomer.phone})
                    </div>
                    {selectedCustomer.package && (
                      <div className="text-sm text-gray-600">
                        Package: {selectedCustomer.package.name} - Bill Amount: {formatCurrency(selectedCustomer.package.price)}
                      </div>
                    )}
                  </div>
                  
                  {/* Payment Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Billing Month *
                      </label>
                      <select
                        {...register("billing_month", { required: "Billing month is required" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Month</option>
                        {Object.values(Months).map((month) => (
                          <option key={month} value={month}>
                            {month.charAt(0) + month.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      {errors.billing_month && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_month.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Payment Method *
                      </label>
                      <select
                        {...register("payment_method", { required: "Payment method is required" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {Object.values(PaymentMethod).map((method) => (
                          <option key={method} value={method}>
                            {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Amount *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("amount", { 
                          required: "Amount is required",
                          min: { value: 0, message: "Amount must be positive" }
                        })}
                        placeholder="Enter amount"
                        error={errors.amount?.message}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Payment Date
                      </label>
                      <Input
                        type="date"
                        {...register("payment_date")}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Notes
                    </label>
                    <textarea
                      {...register("note")}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Additional notes about the payment"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register("paid")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Mark as fully paid
                    </label>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={createPaymentMutation.isPending}
                      className="flex-1"
                    >
                      {createPaymentMutation.isPending ? "Creating..." : "Create Payment"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setSelectedCustomer(null);
                        reset();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payments ({data?.count || 0})</CardTitle>
              <CardDescription>A list of all payments in your system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results?.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customer.name}</div>
                          <div className="text-sm text-gray-500">{payment.customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          {payment.bill_amount !== payment.amount && (
                            <div className="text-sm text-gray-500">
                              Bill: {formatCurrency(payment.bill_amount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.billing_month}</TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.paid
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.paid ? "Paid" : "Unpaid"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date || payment.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/payments/${payment.uid}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/payments/${payment.uid}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(payment)}
                            disabled={deletePaymentMutation.isPending}
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
                  <p className="text-gray-500">No payments found</p>
                </div>
              )}

              {/* Pagination */}
              {data && data.count > 0 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-sm text-gray-700">per page</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.count)} of {data.count} results
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
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
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasNextPage}
                    >
                      Next
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
