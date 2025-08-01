'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { customerService, packageService } from '@/lib/api-services';
import { Customer, PackageList } from '@/lib/types';

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
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Details</h3>
            <p className="mt-1 text-sm text-gray-600">
              Update customer information and package details.
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    {...register('address', { required: 'Address is required' })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="package" className="block text-sm font-medium text-gray-700">
                    Internet Package
                  </label>
                  <select
                    {...register('package_uid', { required: 'Package is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.uid} value={pkg.uid}>
                        {pkg.name} - {pkg.speed_mbps}Mbps (৳{pkg.price})
                      </option>
                    ))}
                  </select>
                  {errors.package_uid && (
                    <p className="mt-1 text-sm text-red-600">{errors.package_uid.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_active')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">
                      Active Customer
                    </label>
                  </div>
                  {errors.is_active && (
                    <p className="mt-1 text-sm text-red-600">{errors.is_active.message}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
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
