'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { customerService, packageService } from '@/lib/api-services';
import { Customer, PackageList } from '@/lib/types';
import Link from 'next/link';

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  package_uid: string;
  is_active: boolean;
};

export default function CustomerEditPage({ params }: { params: { uid: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [packages, setPackages] = useState<PackageList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CustomerForm>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerData, packagesData] = await Promise.all([
          customerService.getCustomer(params.uid),
          packageService.getPackages(1, 100)
        ]);
        
        setCustomer(customerData);
        setPackages(packagesData.results);
        reset({
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || '',
          address: customerData.address,
          package_uid: customerData.package_uid,
          is_active: customerData.is_active
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load customer data');
        setLoading(false);
      }
    };
    fetchData();
  }, [params.uid, reset]);

  const onSubmit = async (data: CustomerForm) => {
    try {
      await customerService.updateCustomer(params.uid, data);
      router.push('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update customer');
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Customer</h1>
          <p className="mt-2 text-sm text-gray-700">
            Update customer information and package details.
          </p>
        </div>
        <div>
          <Link
            href="/customers"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Back to Customers
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                Phone Number
              </label>
              <input
                type="text"
                {...register('phone', { required: 'Phone number is required' })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="package" className="block text-sm font-medium text-gray-900">
                Internet Package
              </label>
              <select
                {...register('package_uid', { required: 'Package is required' })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.uid} value={pkg.uid}>
                    {pkg.name} - {pkg.speed_mbps}Mbps (৳{pkg.price})
                  </option>
                ))}
              </select>
              {errors.package_uid && (
                <p className="mt-2 text-sm text-red-600">{errors.package_uid.message}</p>
              )}
            </div>

            <div className="col-span-full">
              <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                Address
              </label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                rows={3}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="col-span-full">
              <div className="flex items-center gap-x-3">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="is_active" className="block text-sm font-medium leading-6 text-gray-900">
                  Active Customer
                </label>
              </div>
              {errors.is_active && (
                <p className="mt-2 text-sm text-red-600">{errors.is_active.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Link
              href="/customers"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
