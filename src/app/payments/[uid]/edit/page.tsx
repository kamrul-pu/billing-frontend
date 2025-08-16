"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { usePayment, useUpdatePayment } from "@/hooks/api";
import { formatCurrency } from "@/lib/utils";
import { PaymentFormData, PaymentMethod, Months } from "@/types";
import { useForm } from "react-hook-form";

export default function PaymentEditPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.uid as string;
  
  const { data: payment, isLoading, error } = usePayment(uid);
  const updatePaymentMutation = useUpdatePayment();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<PaymentFormData>();

  useEffect(() => {
    if (payment) {
      reset({
        customer_id: payment.customer.id,
        amount: payment.amount,
        billing_month: payment.billing_month,
        payment_method: payment.payment_method,
        paid: payment.paid,
        note: payment.note || "",
        payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [payment, reset]);

  const handleUpdate = async (data: PaymentFormData) => {
    try {
      await updatePaymentMutation.mutateAsync({ uid, data });
      alert("Payment updated successfully!");
      router.push(`/payments/${uid}`);
    } catch (error: any) {
      alert(`Failed to update payment: ${error.message}`);
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

  if (error || !payment) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-red-600">Payment not found</p>
            <Button asChild className="mt-4">
              <Link href="/payments">Back to Payments</Link>
            </Button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/payments/${uid}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Payment
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Payment</h1>
                <p className="text-gray-600">Payment ID: {payment.uid}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Edit Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Update payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
                    {/* Customer Info Display */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <span className="ml-2 font-medium">{payment.customer.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-2">{payment.customer.phone}</span>
                        </div>
                        {payment.customer.package && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Package:</span>
                            <span className="ml-2">
                              {payment.customer.package.name} - {formatCurrency(payment.customer.package.price)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Fields */}
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
                          Billing Month *
                        </label>
                        <select
                          {...register("billing_month", { required: "Billing month is required" })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        disabled={updatePaymentMutation.isPending}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updatePaymentMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/payments/${uid}`)}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Current Amount</label>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Bill Amount</label>
                      <p className="text-sm">{formatCurrency(payment.bill_amount)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Status</label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.paid
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.paid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Created</label>
                      <p className="text-xs">{new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Update payment amount and details as needed</p>
                    <p>• Change billing month if required</p>
                    <p>• Mark as paid when payment is complete</p>
                    <p>• Add notes for any special circumstances</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
