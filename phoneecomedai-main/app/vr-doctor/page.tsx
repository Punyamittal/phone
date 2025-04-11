'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the VR Doctor component with no SSR
// This is necessary because it uses browser APIs that are not available during server-side rendering
const VRDoctorConsultation = dynamic(
  () => import('../../components/vr-doctor/vr-doctor-consultation'),
  { ssr: false }
);

export default function VRDoctorPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Loading VR Doctor...</h2>
            <p className="mt-2 text-gray-500">Please wait while we set up your virtual consultation</p>
          </div>
        </div>
      }>
        <VRDoctorConsultation />
      </Suspense>
    </main>
  );
} 