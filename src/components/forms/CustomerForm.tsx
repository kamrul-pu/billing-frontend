"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { usePackages, useCreateCustomer, useUpdateCustomer } from "@/hooks/api";
import { CustomerFormData, Customer, ConnectionType } from "@/types";
import { generatePassword } from "@/lib/utils";

interface CustomerFormProps {
  customer?: Customer;
  isEditing?: boolean;
}

export default function CustomerForm({ customer, isEditing = false }: CustomerFormProps) {
  const router = useRouter();
  const { data: packagesData } = usePackages();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      nid: customer?.nid || "",
      is_free: customer?.is_free || false,
      is_active: customer?.is_active ?? true,
      package_id: customer?.package_id || (customer?.package ? customer.package.id : undefined),
      ip_address: customer?.ip_address || "",
      mac_address: customer?.mac_address || "",
      username: customer?.username || "",
      password: customer?.password || "",
      connection_type: (customer?.connection_type as ConnectionType) || ConnectionType.DHCP,
    },
  });

  // Populate form with existing customer data when customer changes
  useEffect(() => {
    if (customer && isEditing) {
      console.log("Customer data:", customer);
      console.log("Package ID:", customer.package_id);
      console.log("Package object:", customer.package);
      
      // Get the package_id from either customer.package_id or customer.package.id
      const packageId = customer.package_id || (customer.package ? customer.package.id : undefined);
      console.log("Resolved package ID:", packageId);
      
      // Reset the form with new values
      reset({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        nid: customer.nid || "",
        is_free: customer.is_free,
        is_active: customer.is_active,
        package_id: packageId,
        ip_address: customer.ip_address || "",
        mac_address: customer.mac_address || "",
        username: customer.username || "",
        password: customer.password || "",
        connection_type: (customer.connection_type as ConnectionType) || ConnectionType.DHCP,
      });
      
      // Force update the package_id field specifically
      setTimeout(() => {
        setValue("package_id", packageId);
        console.log("Set package_id to:", packageId);
      }, 100);
      
      // Also try immediate setValue
      setValue("package_id", packageId);
    }
  }, [customer, isEditing, reset, setValue]);
  
  // Additional effect to handle customer changes
  useEffect(() => {
    if (customer && isEditing) {
      const packageId = customer.package_id || (customer.package ? customer.package.id : undefined);
      console.log("Additional effect - Package ID:", packageId);
      
      // Update the package_id field
      setValue("package_id", packageId);
    }
  }, [customer, isEditing, setValue]);

  const onSubmit = async (data: CustomerFormData) => {
    console.log("Form submission data:", data);
    console.log("Current package_id:", data.package_id);
    console.log("Current form values:", watch());
    
    // Custom validation for package_id
    if (!data.package_id) {
      alert("Please select a package");
      return;
    }
    
    try {
      if (isEditing && customer) {
        await updateCustomerMutation.mutateAsync({
          uid: customer.uid,
          data,
        });
        alert("Customer updated successfully!");
      } else {
        await createCustomerMutation.mutateAsync(data);
        alert("Customer created successfully!");
      }
      router.push("/customers");
    } catch (error: any) {
      alert(`Failed to ${isEditing ? "update" : "create"} customer: ${error.message}`);
    }
  };

  const handleGenerateCredentials = () => {
    const name = watch("name");
    if (name) {
      const username = name.toLowerCase().replace(/\s+/g, "");
      const password = generatePassword(8);
      setValue("username", username);
      setValue("password", password);
    }
  };

  const isLoading = createCustomerMutation.isPending || updateCustomerMutation.isPending;
  
  // Watch package_id for debugging
  const currentPackageId = watch("package_id");
  console.log("Current form package_id:", currentPackageId);
  
  // Watch all form values for debugging
  const allValues = watch();
  console.log("All form values:", allValues);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the customer's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />
            <Input
              label="Phone Number *"
              type="tel"
              {...register("phone", { required: "Phone is required" })}
              error={errors.phone?.message}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="National ID"
              {...register("nid")}
              error={errors.nid?.message}
            />
          </div>

          <Input
            label="Address"
            {...register("address")}
            error={errors.address?.message}
          />
        </CardContent>
      </Card>

      {/* Package & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Package & Status</CardTitle>
          <CardDescription>Select package and set customer status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Package
              </label>
              <select
                value={watch("package_id") || ""}
                onChange={(e) => setValue("package_id", e.target.value ? Number(e.target.value) : undefined)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a package</option>
                {packagesData?.results?.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - {pkg.speed_mbps} Mbps - ৳{pkg.price}
                  </option>
                ))}
              </select>
              {!watch("package_id") && (
                <p className="text-xs text-red-500 mt-1">Package is required</p>
              )}
              {isEditing && customer?.package && (
                <p className="text-xs text-gray-500 mt-1">
                  Current package: {customer.package.name} - {customer.package.speed_mbps} Mbps - ৳{customer.package.price}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Connection Type
              </label>
              <select
                {...register("connection_type")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={ConnectionType.DHCP}>DHCP</option>
                <option value={ConnectionType.STATIC}>Static IP</option>
                <option value={ConnectionType.PPPoE}>PPPoE</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("is_active")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Active Customer</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("is_free")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Free Customer</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Network Configuration</CardTitle>
          <CardDescription>Configure network settings and credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="IP Address"
              {...register("ip_address")}
              error={errors.ip_address?.message}
            />
            <Input
              label="MAC Address"
              {...register("mac_address")}
              error={errors.mac_address?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              {...register("username")}
              error={errors.username?.message}
            />
            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                {...register("password")}
                error={errors.password?.message}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateCredentials}
              >
                Generate Credentials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {isEditing ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
