'use client';

import React, { useState } from 'react';
import { useRunPod } from '../hooks/use-runpod';
import { RunPodClient } from '../lib/runpod';

export function RunPodGPUCard() {
  const [prompt, setPrompt] = useState('');
  const [gpuType, setGpuType] = useState<'RTX4090' | 'L40S' | 'A100' | 'H100'>('RTX4090');
  const [result, setResult] = useState<any>(null);
  const { runGpuJob, loading, error, jobStatus } = useRunPod();

  const cost = RunPodClient.estimateCost(gpuType, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      const endpointId = process.env.NEXT_PUBLIC_RUNPOD_ENDPOINT_ID || 'demo-endpoint';
      const output = await runGpuJob({ prompt, gpuType }, endpointId);
      setResult(output);
    } catch (err) {
      console.error('RunPod execution error:', err);
    }
  };

  return (
    <div className="rounded-xl border border-purple-500/20 bg-slate-900/80 p-6 backdrop-blur-md shadow-2xl text-white max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 border-b border-purple-500/20 pb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              RunPod Serverless GPU Compute
            </h3>
            <p className="text-xs text-slate-400">On-demand low-latency GPU workers & media pipelines</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
          RunPod.io Connected
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target GPU Hardware</label>
          <div className="grid grid-cols-4 gap-2">
            {(['RTX4090', 'L40S', 'A100', 'H100'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setGpuType(type)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  gpuType === type
                    ? 'border-purple-500 bg-purple-600/30 text-purple-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt / GPU Workload Instructions</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Cyberpunk Solana city with Bonk mascot, 8k resolution, Flux render"
            className="w-full h-24 rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div>
            Estimated 10s Execution: <span className="text-purple-400 font-semibold">${cost.usd} USD</span>
          </div>
          <div>
            Solana Equivalent: <span className="text-emerald-400 font-semibold">{cost.estimatedSol} SOL</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Executing GPU Job ({jobStatus?.status || 'INIT'})...</span>
            </>
          ) : (
            <span>🚀 Run Serverless GPU Job</span>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-purple-500/30 text-xs space-y-2">
          <div className="font-bold text-purple-300">GPU Workload Output:</div>
          <pre className="overflow-x-auto text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
