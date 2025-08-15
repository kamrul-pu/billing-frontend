"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Save, X, User, CreditCard, Calendar, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { usePayment, useUpdatePayment, useDeletePayment } from "@/hooks/api";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";
import { PaymentFormData, PaymentMethod, Months } from "@/types";
import { useForm } from "react-hook-form";

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.uid as string;
  
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: payment, isLoading, error } = usePayment(uid);
  const updatePaymentMutation = useUpdatePayment();
  const deletePaymentMutation = useDeletePayment();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<PaymentFormData>();

  React.useEffect(() => {
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
      setIsEditing(false);
    } catch (error: any) {
      alert(`Failed to update payment: ${error.message}`);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this payment?")) {
      deletePaymentMutation.mutate(uid, {
        onSuccess: () => {
          alert("Payment deleted successfully");
          router.push("/payments");
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
                <Link href="/payments">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Payments
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
                <p className="text-gray-600">Payment ID: {payment.uid}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Payment
                  </Button>
                  <Button variant="outline" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSubmit(handleUpdate)} disabled={updatePaymentMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updatePaymentMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <CreditCard className="h-5 w-5 inline mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Amount</label>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bill Amount</label>
                          <p className="text-lg">
                            {formatCurrency(payment.bill_amount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Billing Month</label>
                          <p className="font-medium">{payment.billing_month}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Method</label>
                          <p className="font-medium">{payment.payment_method}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
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
                          <label className="text-sm font-medium text-gray-500">Payment Date</label>
                          <p>{payment.payment_date ? formatDateTime(payment.payment_date) : "Not specified"}</p>
                        </div>
                      </div>
                      
                      {payment.note && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Notes</label>
                          <p className="text-sm bg-gray-50 p-3 rounded-lg">{payment.note}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created</label>
                          <p className="text-sm">{formatDateTime(payment.created_at)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Updated</label>
                          <p className="text-sm">{formatDateTime(payment.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
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
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <User className="h-5 w-5 inline mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="font-medium">{payment.customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p>{payment.customer.phone}</p>
                    </div>
                    {payment.customer.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p>{payment.customer.email}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer ID</label>
                      <p className="font-mono text-sm">{payment.customer.uid}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/customers/${payment.customer.uid}`}>
                        View Customer Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Package Information */}
              {payment.customer.package && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <DollarSign className="h-5 w-5 inline mr-2" />
                      Package Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Package Name</label>
                        <p className="font-medium">{payment.customer.package.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Speed</label>
                        <p>{payment.customer.package.speed_mbps} Mbps</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Monthly Price</label>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(payment.customer.package.price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Entry Information */}
              {payment.entry_by && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <User className="h-5 w-5 inline mr-2" />
                      Entry Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created By</label>
                        <p className="font-medium">
                          {payment.entry_by.first_name} {payment.entry_by.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Username</label>
                        <p className="font-mono text-sm">{payment.entry_by.username}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
