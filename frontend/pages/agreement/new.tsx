import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Head from 'next/head';
import Link from 'next/link';

// Schema for step 1: basic property info (expand later)
const step1Schema = z.object({
  landlordName: z.string().min(1, 'Required'),
  tenantName: z.string().min(1, 'Required'),
  propertyAddress: z.string().min(1, 'Required'),
});

// Combine schemas for all steps (placeholder single step for now)
const formSchema = step1Schema;

type FormData = z.infer<typeof formSchema>;

export default function NewAgreementPage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      landlordName: '',
      tenantName: '',
      propertyAddress: '',
    },
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const [submitted, setSubmitted] = useState(false);

  const {
    setError,
    reset
  } = methods;

  const onSubmit = async (data: FormData) => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/agreements`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.errors) {
          Object.entries(body.errors).forEach(([field, message]) => {
            setError(field as keyof FormData, { type: 'server', message: message as string });
          });
          return; // validation errors handled
        }
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
      reset();
    } catch (err:any) {
      alert(err.message || 'Submission failed');
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold">Agreement Created!</h1>
        <p className="mb-6">You can track signature status in the dashboard.</p>
        <Link href="/" className="rounded bg-blue-600 px-4 py-2 text-white">Back home</Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>New Rental Agreement · DocTurbo</title>
      </Head>
      <div className="mx-auto mt-10 max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">BC Rental Agreement</h1>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Parties Section */}
            <details open className="rounded border border-gray-300 p-4">
              <summary className="cursor-pointer select-none font-medium">
                Parties
              </summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col">
                  <label htmlFor="landlordName" className="text-sm font-medium">Landlord Name</label>
                  <input
                    id="landlordName"
                    {...register('landlordName')}
                    className={
                      `w-full rounded border px-3 py-2 focus:outline-none ${errors.landlordName ? 'ring-1 ring-rose-500' : 'ring-1 ring-gray-300 focus:ring-blue-500'}`
                    }
                  />
                  {errors.landlordName && <p className="text-xs text-rose-600 mt-1">{errors.landlordName.message}</p>}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="tenantName" className="text-sm font-medium">Tenant Name</label>
                  <input
                    id="tenantName"
                    {...register('tenantName')}
                    className={
                      `w-full rounded border px-3 py-2 focus:outline-none ${errors.tenantName ? 'ring-1 ring-rose-500' : 'ring-1 ring-gray-300 focus:ring-blue-500'}`
                    }
                  />
                  {errors.tenantName && <p className="text-xs text-rose-600 mt-1">{errors.tenantName.message}</p>}
                </div>
              </div>
            </details>

            {/* Property Section */}
            <details open className="rounded border border-gray-300 p-4">
              <summary className="cursor-pointer select-none font-medium">Property Details</summary>
              <div className="mt-4 space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="propertyAddress" className="text-sm font-medium">Property Address</label>
                  <input
                    id="propertyAddress"
                    {...register('propertyAddress')}
                    className={
                      `w-full rounded border px-3 py-2 focus:outline-none ${errors.propertyAddress ? 'ring-1 ring-rose-500' : 'ring-1 ring-gray-300 focus:ring-blue-500'}`
                    }
                  />
                  {errors.propertyAddress && <p className="text-xs text-rose-600 mt-1">{errors.propertyAddress.message}</p>}
                </div>
              </div>
            </details>

            {/* Submit sticky on mobile */}
            <div className="sticky bottom-0 bg-white py-4">
              <button
                type="submit"
                className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 md:w-auto"
              >
                Submit
              </button>
            </div>
          </form>
              <input
                {...register('landlordName')}
                className="w-full rounded border px-3 py-2"
              />
              {errors.landlordName && (
                <p className="text-sm text-red-600">{errors.landlordName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Tenant Name</label>
              <input
                {...register('tenantName')}
                className="w-full rounded border px-3 py-2"
              />
              {errors.tenantName && (
                <p className="text-sm text-red-600">{errors.tenantName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Property Address</label>
              <input
                {...register('propertyAddress')}
                className="w-full rounded border px-3 py-2"
              />
              {errors.propertyAddress && (
                <p className="text-sm text-red-600">{errors.propertyAddress.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </FormProvider>
      </div>
    </>
  );
}
