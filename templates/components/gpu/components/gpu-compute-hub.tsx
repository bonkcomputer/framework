'use client';

import React, { useState } from 'react';
import { ComputeRouter, ComputeProvider, TaskCategory } from '../lib/compute-router';

export function GPUComputeHub() {
  const [category, setCategory] = useState<TaskCategory>('media-generation');
  const [provider, setProvider] = useState<ComputeProvider>('auto');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await ComputeRouter.routeAndExecute({
        category,
        provider,
        payload: { prompt, input: { prompt } },
      });
      setResponse(res);
    } catch (err: any) {
      setResponse({ error: err.message || 'Compute execution error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-8 backdrop-blur-xl shadow-2xl text-white max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-purple-500/20 pb-4">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent">
            Bonk Computer Framework GPU Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unified Compute Orchestrator: E2B MicroVMs + RunPod.io + GMI.cloud
          </p>
        </div>
        <div className="flex space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-purple-950 text-purple-300 border border-purple-800">E2B</span>
          <span className="px-2.5 py-1 rounded-md bg-pink-950 text-pink-300 border border-pink-800">RunPod</span>
          <span className="px-2.5 py-1 rounded-md bg-sky-950 text-sky-300 border border-sky-800">GMI Cloud</span>
        </div>
      </div>

      <form onSubmit={handleExecute} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Workload Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="code-execution">CPU Code Execution (E2B Sandbox)</option>
              <option value="media-generation">Media / Image Gen (RunPod Serverless GPU)</option>
              <option value="heavy-reasoning">Heavy LLM Reasoning (GMI Cloud H100)</option>
              <option value="fine-tune">Cluster Fine-Tuning (GMI Cloud H100/H200)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Compute Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ComputeProvider)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="auto">🤖 Auto-Select Best Provider</option>
              <option value="e2b">E2B MicroVM (CPU)</option>
              <option value="runpod">RunPod.io (Serverless GPU)</option>
              <option value="gmi_cloud">GMI.cloud (Enterprise H100 Cluster)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Compute Prompt / Instruction Payload</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter instructions for the compute pipeline..."
            className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20"
        >
          {loading ? 'Orchestrating GPU Compute Workload...' : '⚡ Execute Hybrid Compute Workload'}
        </button>
      </form>

      {response && (
        <div className="mt-6 p-5 rounded-xl bg-slate-950 border border-purple-500/30 text-xs space-y-3">
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
            <span>Provider Used: <strong className="text-purple-400">{response.providerUsed?.toUpperCase()}</strong></span>
            {response.executionTimeMs && <span>Execution Time: <strong className="text-emerald-400">{response.executionTimeMs}ms</strong></span>}
            {response.estimatedCostUsd !== undefined && <span>Est. Cost: <strong className="text-amber-400">${response.estimatedCostUsd} USD</strong></span>}
          </div>
          <div>
            <div className="font-bold text-purple-300 mb-1">Execution Output:</div>
            <pre className="overflow-x-auto text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
              {JSON.stringify(response.result || response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
