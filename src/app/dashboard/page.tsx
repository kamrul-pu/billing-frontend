"use client";

import React from "react";
import { Users, Package, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDashboardStats, useGenerateBills } from "@/hooks/api";
import { formatCurrency } from "@/lib/utils";

const StatCard = ({ title, value, description, icon: Icon, trend }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-gray-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-500">
        {trend && <span className="text-green-600">{trend}</span>}
        {description}
      </p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const generateBillsMutation = useGenerateBills();

  // Debug logging
  console.log('Dashboard component rendered');
  console.log('Stats data:', stats);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  const handleGenerateBills = () => {
    generateBillsMutation.mutate(undefined, {
      onSuccess: (data) => {
        alert(`Bills generated successfully! Created ${data.created_payments_count} payment records.`);
      },
      onError: (error: any) => {
        alert(`Failed to generate bills: ${error.message}`);
      },
    });
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
    console.error('Dashboard error:', error);
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load dashboard data</p>
            <p className="text-sm text-gray-500 mt-2">
              Error: {error.message || 'Unknown error occurred'}
            </p>
            <pre className="text-xs text-gray-400 mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Console log for debugging
  console.log('Dashboard stats:', stats);
  console.log('Raw stats data:', {
    total_customers: stats?.total_customers,
    active_customers: stats?.active_customers,
    total_packages: stats?.total_packages,
    total_payments: stats?.total_payments,
    total_revenue: stats?.total_revenue,
    pending_payments: stats?.pending_payments,
    current_month_payments: stats?.current_month_payments
  });

  // Safe access to stats data with defaults - matching backend API structure
  const customersTotal = stats?.total_customers ?? 0;
  const customersActive = stats?.active_customers ?? 0;
  const packagesTotal = stats?.total_packages ?? 0;
  const paymentsTotal = stats?.total_revenue ?? 0;
  const paymentsPaid = stats?.total_payments ?? 0;
  const paymentsPending = stats?.pending_payments ?? 0;
  const paymentsThisMonth = stats?.current_month_payments ?? 0;

  // Debug the extracted values
  console.log('Extracted values:', {
    customersTotal,
    customersActive,
    packagesTotal,
    paymentsTotal,
    paymentsPaid,
    paymentsPending,
    paymentsThisMonth
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Overview of your ISP management system</p>
            </div>
            <Button 
              onClick={handleGenerateBills}
              loading={generateBillsMutation.isPending}
              disabled={generateBillsMutation.isPending}
            >
              Generate Monthly Bills
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Customers"
              value={stats ? customersTotal : "Loading..."}
              description="registered customers"
              icon={Users}
            />
            <StatCard
              title="Active Customers"
              value={stats ? customersActive : "Loading..."}
              description="currently active"
              icon={Users}
              trend="+2.5%"
            />
            <StatCard
              title="Available Packages"
              value={stats ? packagesTotal : "Loading..."}
              description="service packages"
              icon={Package}
            />
            <StatCard
              title="Total Revenue"
              value={stats ? formatCurrency(paymentsTotal) : "Loading..."}
              description="from paid invoices"
              icon={CreditCard}
              trend="+12.3%"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Current month payment overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Paid Invoices</span>
                  <span className="font-medium text-green-600">
                    {stats ? paymentsPaid : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments</span>
                  <span className="font-medium text-blue-600">
                    {stats ? paymentsPending : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>This Month Collected</span>
                  <span className="font-medium text-blue-600">
                    {stats ? paymentsThisMonth : "Loading..."}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/customers/new">Add New Customer</a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/packages/new">Create Package</a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/payments">Manage Payments</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Service</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Backup</span>
                  <span className="text-sm text-gray-600">2 hours ago</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">New customer registered: John Doe</span>
                  <span className="text-xs text-gray-500 ml-auto">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Payment received from Customer #1234</span>
                  <span className="text-xs text-gray-500 ml-auto">5 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Package updated: Premium 100Mbps</span>
                  <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Monthly bills generated</span>
                  <span className="text-xs text-gray-500 ml-auto">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
