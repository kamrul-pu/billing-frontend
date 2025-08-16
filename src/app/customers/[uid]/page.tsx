"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Edit, CreditCard, User, Package, MapPin, Phone, Mail } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useCustomer, useCustomerPayments, useCreateCustomerPayment } from "@/hooks/api";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { PaymentFormData, Months, PaymentMethod } from "@/types";
import { Input } from "@/components/ui/Input";

export default function CustomerDetailPage() {
  const params = useParams();
  const uid = params?.uid as string;

  const { data: customer, isLoading: customerLoading, error: customerError } = useCustomer(uid);
  const { data: paymentsData, isLoading: paymentsLoading } = useCustomerPayments(uid);
  const createPayment = useCreateCustomerPayment(uid);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      customer_id: undefined, // server side uses uid path param; we still pass id to serializer
      amount: 0,
      billing_month: "",
      payment_method: PaymentMethod.CASH,
      paid: false,
      note: "",
    }
  });

  React.useEffect(() => {
    if (customer) {
      setValue("customer_id", customer.id);
      setValue("amount", Number(customer.package?.price || 0));
    }
  }, [customer, setValue]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await createPayment.mutateAsync(data);
      reset();
      alert("Payment created successfully");
    } catch (e: any) {
      alert(e?.message || "Failed to create payment");
    }
  };

  if (customerLoading) {
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

  if (customerError || !customer) {
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
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex items-center gap-4 mt-2">
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
                    Free Customer
                  </span>
                )}
              </div>
            </div>
            <Button asChild>
              <Link href={`/customers/${customer.uid}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <User className="h-5 w-5 inline mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                    {customer.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {customer.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{customer.address}</span>
                      </div>
                    </div>
                  )}

                  {customer.nid && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">National ID</label>
                      <p>{customer.nid}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Since</label>
                    <p>{formatDate(customer.created_at)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Network Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Network Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Connection Type</label>
                      <p className="font-medium">{customer.connection_type}</p>
                    </div>
                    {customer.ip_address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">IP Address</label>
                        <p className="font-mono">{customer.ip_address}</p>
                      </div>
                    )}
                  </div>
                  
                  {customer.mac_address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">MAC Address</label>
                      <p className="font-mono">{customer.mac_address}</p>
                    </div>
                  )}

                  {customer.username && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Username</label>
                        <p className="font-mono">{customer.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Password</label>
                        <p className="font-mono">••••••••</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <CreditCard className="h-5 w-5 inline mr-2" />
                    Payment History
                  </CardTitle>
                  <CardDescription>Recent payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentsData?.results?.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {payment.payment_date 
                                ? formatDateTime(payment.payment_date)
                                : formatDate(payment.created_at)
                              }
                            </TableCell>
                            <TableCell>{payment.billing_month}</TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.paid
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {payment.paid ? "Paid" : "Pending"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {!paymentsLoading && !paymentsData?.results?.length && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No payment history found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Package Info */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Package className="h-5 w-5 inline mr-2" />
                    Current Package
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.package ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Package Name</label>
                        <p className="font-medium">{customer.package.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Speed</label>
                        <p>{customer.package.speed_mbps} Mbps</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Price</label>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(customer.package.price)}
                        </p>
                      </div>
                      {customer.package.description && (
                        <div>
                          <label className="text_sm font-medium text-gray-500">Description</label>
                          <p className="text-sm">{customer.package.description}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No package assigned</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Billing Month</label>
                      <select
                        {...register("billing_month", { required: "Required" })}
                        className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="">Select Month</option>
                        {Object.values(Months).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {errors.billing_month && <p className="text-xs text-red-600 mt-1">{errors.billing_month.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Payment Method</label>
                      <select
                        {...register("payment_method", { required: "Required" })}
                        className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        {Object.values(PaymentMethod).map((pm) => (
                          <option key={pm} value={pm}>{pm.replace('_',' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Amount</label>
                      <Input type="number" step="0.01" min="0" {...register("amount", { required: "Required" })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...register("paid")} />
                      <span className="text-xs">Mark as paid</span>
                    </div>
                    <Button type="submit" className="w-full" disabled={createPayment.isPending}>
                      {createPayment.isPending ? "Processing..." : "Add Payment"}
                    </Button>
                  </form>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/customers/${customer.uid}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Customer
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
