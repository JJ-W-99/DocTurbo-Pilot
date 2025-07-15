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

  const onSubmit = async (data: FormData) => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/agreements`;
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      API_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      FullURL: url
    });
    
    try {
      console.log('Submitting to:', url);
      console.log('Data:', data);
      
      // Test if we can reach the server
      try {
        const ping = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/ping`);
        console.log('Ping status:', ping.status, await ping.text());
      } catch (pingError) {
        console.error('Ping failed:', pingError);
      }
      
      const startTime = performance.now();
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
      
      const endTime = performance.now();
      console.log(`Request took ${(endTime - startTime).toFixed(2)}ms`);
      
      // Log response details
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      const responseText = await res.text();
      console.log('Response text:', responseText);
      
      if (!res.ok) {
        let errorMessage = responseText || `HTTP ${res.status}: ${res.statusText}`;
        console.error('Server error response:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: responseText
        });
        throw new Error(errorMessage);
      }
      
      const result = responseText ? JSON.parse(responseText) : {};
      console.log('Success:', result);
      setSubmitted(true);
    } catch (err) {
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        cause: err.cause
      });
      alert(`Submission failed: ${err.message || 'Unknown error'}`);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Landlord Name</label>
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
