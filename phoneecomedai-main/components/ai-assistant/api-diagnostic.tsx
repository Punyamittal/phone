"use client";

import React, { useState, useEffect } from 'react';
import { runDiagnostic, getDiagnosticReport } from '@/lib/geminiDiagnostic';

type DiagnosticProps = {
  onClose?: () => void;
};

export default function ApiDiagnostic({ onClose }: DiagnosticProps) {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Run the diagnostic test
  useEffect(() => {
    async function runTest() {
      setLoading(true);
      try {
        const diagnosticReport = await getDiagnosticReport();
        setReport(diagnosticReport);
      } catch (error) {
        setReport(`Error running diagnostic: ${error}`);
      } finally {
        setLoading(false);
      }
    }
    
    runTest();
  }, [retryCount]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        <div className="bg-blue-500 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-medium text-lg">Gemini API Diagnostic</h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-blue-600 p-1 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white">Running diagnostic test...</p>
            </div>
          ) : (
            <div className="bg-gray-800 p-4 rounded-lg">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm overflow-x-auto">{report}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 p-4 flex justify-between">
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Test Again'}
          </button>
          
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 