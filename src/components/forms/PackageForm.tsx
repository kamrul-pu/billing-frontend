"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCreatePackage, useUpdatePackage } from "@/hooks/api";
import { PackageFormData, Package } from "@/types";

interface PackageFormProps {
  package?: Package;
  isEditing?: boolean;
}

export default function PackageForm({ package: pkg, isEditing = false }: PackageFormProps) {
  const router = useRouter();
  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PackageFormData>({
    defaultValues: {
      name: "",
      description: "",
      speed_mbps: 10,
      price: 0,
    },
  });

  // Populate form with existing package data
  useEffect(() => {
    if (pkg && isEditing) {
      setValue("name", pkg.name || "");
      setValue("description", pkg.description || "");
      setValue("speed_mbps", pkg.speed_mbps || 10);
      setValue("price", pkg.price || 0);
    }
  }, [pkg, isEditing, setValue]);

  const onSubmit = async (data: PackageFormData) => {
    try {
      if (isEditing && pkg) {
        await updatePackageMutation.mutateAsync({
          uid: pkg.uid,
          data,
        });
        alert("Package updated successfully!");
      } else {
        await createPackageMutation.mutateAsync(data);
        alert("Package created successfully!");
      }
      router.push("/packages");
    } catch (error: any) {
      alert(`Failed to ${isEditing ? "update" : "create"} package: ${error.message}`);
    }
  };

  const isLoading = createPackageMutation.isPending || updatePackageMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Package Information</CardTitle>
          <CardDescription>Enter the package details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Package Name *"
              {...register("name", { required: "Package name is required" })}
              error={errors.name?.message}
            />
            <Input
              label="Speed (Mbps) *"
              type="number"
              {...register("speed_mbps", { 
                required: "Speed is required",
                min: { value: 1, message: "Speed must be at least 1 Mbps" }
              })}
              error={errors.speed_mbps?.message}
            />
          </div>
          
          <Input
            label="Price (BDT) *"
            type="number"
            step="0.01"
            {...register("price", { 
              required: "Price is required",
              min: { value: 0, message: "Price must be non-negative" }
            })}
            error={errors.price?.message}
          />

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <textarea
              {...register("description")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
              placeholder="Enter package description..."
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
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
          {isEditing ? "Update Package" : "Create Package"}
        </Button>
      </div>
    </form>
  );
}
