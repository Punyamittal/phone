import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { HealthMetricsGrid } from '@/components/dashboard/health-metrics-grid';
import { AIInsightsPanel } from '@/components/dashboard/ai-insights-panel';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { UpcomingReminders } from '@/components/dashboard/upcoming-reminders';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <QuickActions className="mt-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <HealthMetricsGrid />
          <AIInsightsPanel className="mt-6" />
        </div>
        <div className="space-y-6">
          <UpcomingReminders />
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}