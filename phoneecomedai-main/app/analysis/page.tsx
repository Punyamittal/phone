import { AnalysisHeader } from '@/components/analysis/analysis-header';
import { RecordingInterface } from '@/components/analysis/recording-interface';
import { AIProcessingVisualizer } from '@/components/analysis/ai-processing-visualizer';
import { ResultsDisplay } from '@/components/analysis/results-display';
import { RecommendationsPanel } from '@/components/analysis/recommendations-panel';

export default function AnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AnalysisHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-8">
          <RecordingInterface />
          <AIProcessingVisualizer />
        </div>
        <div className="space-y-8">
          <ResultsDisplay />
          <RecommendationsPanel />
        </div>
      </div>
    </div>
  );
}