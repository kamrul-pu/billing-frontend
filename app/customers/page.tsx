'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerList, PackageList } from '@/lib/types';
import { customerService, packageService } from '@/lib/api-services';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [packages, setPackages] = useState<PackageList[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Applied filters (what's actually being used for search)
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    phone: '',
    package_id: 'all' as string | number,
    is_active: 'all' as string | boolean
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, appliedFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build filters object from applied filters
      const filters: {
        name?: string;
        phone?: string;
        package_id?: number;
        is_active?: boolean;
      } = {};
      if (appliedFilters.name.trim()) filters.name = appliedFilters.name.trim();
      if (appliedFilters.phone.trim()) filters.phone = appliedFilters.phone.trim();
      if (appliedFilters.package_id !== 'all') filters.package_id = parseInt(appliedFilters.package_id as string);
      if (appliedFilters.is_active !== 'all') filters.is_active = appliedFilters.is_active === 'active';
      
      const [customersData, packagesData] = await Promise.all([
        customerService.getCustomers(currentPage, pageSize, filters),
        packageService.getPackages(1, 100) // Get all packages for filter
      ]);
      
      setCustomers(customersData.results);
      setTotalCount(customersData.count);
      setPackages(packagesData.results);
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      try {
        await customerService.deleteCustomer(uid);
        fetchData(); // Refresh the list
      } catch (error: unknown) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. It may have associated payments or other dependencies.');
      }
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(parseFloat(amount?.toString() || '0'));
  };

  const handleSearch = () => {
    setAppliedFilters({
      name: nameFilter,
      phone: phoneFilter,
      package_id: packageFilter,
      is_active: statusFilter
    });
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setNameFilter('');
    setPhoneFilter('');
    setPackageFilter('all');
    setStatusFilter('all');
    setAppliedFilters({
      name: '',
      phone: '',
      package_id: 'all',
      is_active: 'all'
    });
    setCurrentPage(1);
  };

  const handleGenerateBills = async () => {
    const month = prompt('Enter month for billing (e.g., JANUARY, FEBRUARY) or leave empty for current month:');
    if (month === null) return; // User cancelled
    
    try {
      await customerService.generateBills(month || undefined);
      alert('Bills generated successfully!');
      fetchData(); // Refresh the list to show new payments
    } catch (error) {
      console.error('Error generating bills:', error);
      alert('Failed to generate bills. Please try again.');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Customers</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGenerateBills}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Generate Bills
              </button>
              <Link
                href="/customers/new"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add New Customer
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {/* Name Filter */}
              <div>
                <label htmlFor="name-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name-filter"
                  type="text"
                  placeholder="Search by name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Phone Filter */}
              <div>
                <label htmlFor="phone-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="phone-filter"
                  type="text"
                  placeholder="Search by phone..."
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Package Filter */}
              <div>
                <label htmlFor="package-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Package
                </label>
                <select
                  id="package-filter"
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Packages</option>
                  {packages.map((pkg) => (
                    <option key={pkg.uid} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Page Size Selector */}
              <div>
                <label htmlFor="page-size" className="block text-sm font-medium text-gray-700 mb-1">
                  Page Size
                </label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                >
                  Search
                </button>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 truncate">Name</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 truncate">Contact</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 truncate">Address</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 truncate">Status</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 truncate">Actions</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 truncate">Package</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-gray-50">
                    {/* Name (clickable) */}
                    <td className="px-2 py-4 whitespace-nowrap w-32 truncate">
                      <div className="truncate">
                        <Link href={`/customers/${customer.uid}`} className="text-sm font-medium text-indigo-600 hover:underline truncate">
                          {customer.name}
                        </Link>
                        <div className="text-sm text-gray-500 truncate">ID: #{customer.id}</div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-2 py-4 whitespace-nowrap w-32 truncate">
                      <div className="truncate">
                        <div className="text-sm text-gray-900 truncate">{customer.phone}</div>
                        {/* {customer.email && (
                          <div className="text-sm text-gray-500 truncate">{customer.email}</div>
                        )} */}
                      </div>
                    </td>
                    {/* Address */}
                    <td className="px-2 py-4 whitespace-nowrap w-40 truncate">
                      <div className="truncate">
                        <div className="text-sm text-gray-900 truncate">{customer.address || 'N/A'}</div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-2 py-4 whitespace-nowrap w-20 truncate">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium w-28 truncate">
                      <div className="flex space-x-2">
                        <Link
                          href={`/customers/${customer.uid}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.uid!, customer.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    {/* Package */}
                    <td className="px-2 py-4 whitespace-nowrap w-32 truncate">
                      <div className="truncate">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {customer.package?.name || 'N/A'}
                        </div>
                        {customer.package && (
                          <div className="text-sm text-gray-500 truncate">
                            {customer.package.speed_mbps} Mbps - {formatCurrency(customer.package.price || '0')}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {customers.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {nameFilter || phoneFilter || packageFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating a new customer.'}
              </p>
              <div className="mt-6">
                <Link
                  href="/customers/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Customer
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                    <span className="text-gray-500 ml-2">({pageSize} per page)</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}