import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient Report Analysis | EcoMed AI',
  description: 'Upload and analyze your medical reports with AI-powered insights and interactive visualizations',
};

export default function PatientReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="patient-report-layout">
      {children}
    </div>
  );
} 