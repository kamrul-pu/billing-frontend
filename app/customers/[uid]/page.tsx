'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { customerService, packageService } from '@/lib/api-services';
import { CustomerList, PackageList } from '@/lib/types';

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  package_uid: string;
  is_active: boolean;
};

export default function CustomerDetailPage({ params }: { params: { uid: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerList | null>(null);
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
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customer Details</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update customer information and package details.
            </p>
          </div>
          <button
            onClick={() => router.push('/customers')}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Back to Customers
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-900/10">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                      Full Name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                      Phone Number
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register('phone', { required: 'Phone number is required' })}
                        className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      Email
                    </label>
                    <div className="mt-2">
                      <input
                        type="email"
                        {...register('email')}
                        className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="package" className="block text-sm font-medium leading-6 text-gray-900">
                      Internet Package
                    </label>
                    <div className="mt-2">
                      <select
                        {...register('package_uid', { required: 'Package is required' })}
                        className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                      Address
                    </label>
                    <div className="mt-2">
                      <textarea
                        {...register('address', { required: 'Address is required' })}
                        rows={3}
                        className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      {errors.address && (
                        <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          type="checkbox"
                          {...register('is_active')}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label htmlFor="is_active" className="font-medium text-gray-900">
                          Active Customer
                        </label>
                        <p className="text-gray-500">Customer will be able to access services</p>
                      </div>
                    </div>
                    {errors.is_active && (
                      <p className="mt-2 text-sm text-red-600">{errors.is_active.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-end gap-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/customers')}
                  className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
