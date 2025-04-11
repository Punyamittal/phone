import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VR Doctor | EcoMed AI',
  description: 'Virtual doctor consultation with posture analysis and voice interaction',
};

export default function VRDoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="vr-doctor-layout">
      {children}
    </div>
  );
} 