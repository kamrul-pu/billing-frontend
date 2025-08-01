'use client';

import { useEffect, useState } from 'react';
import { CustomerList } from '@/lib/types';
import { customerService } from '@/lib/api-services';
import Link from 'next/link';
import clsx from 'clsx';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers(1, 100);
      setCustomers(response.results);
      setLoading(false);
    } catch (err) {
      setError('Failed to load customers');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all customers in your ISP system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/customers/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Customer
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden bg-white shadow-md rounded-lg">
              {/* Desktop View */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                        Phone
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                        Package
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative px-4 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {customers.map((customer) => (
                      <tr key={customer.uid}>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                          {customer.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {customer.phone}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {customer.package_name || 'No Package'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          <span className={clsx(
                            'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                            customer.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}>
                            {customer.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-right space-x-3">
                          <Link
                            href={`/customers/${customer.uid}`}
                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/customers/${customer.uid}/edit`}
                            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md hover:bg-gray-100"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-gray-200">
                {customers.map((customer) => (
                  <div key={customer.uid} className="p-4 space-y-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-700">{customer.phone}</p>
                      </div>
                      <span className={clsx(
                        'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                        customer.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Package:</span>{' '}
                        {customer.package_name || 'No Package'}
                      </p>
                    </div>
                    <div className="flex space-x-3 pt-2">
                      <Link
                        href={`/customers/${customer.uid}`}
                        className="flex-1 text-center text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-md hover:bg-indigo-100"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/customers/${customer.uid}/edit`}
                        className="flex-1 text-center text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-md hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}