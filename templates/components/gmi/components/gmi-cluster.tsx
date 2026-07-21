'use client';

import React, { useState } from 'react';
import { runGMIInferenceAction, submitGMIFineTuneJobAction } from '../actions/gmi-actions';

export function GMIClusterDashboard() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('deepseek-ai/DeepSeek-R1');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    const res = await runGMIInferenceAction([{ role: 'user', content: prompt }], model);
    setLoading(false);

    if (res.success && res.text) {
      setResponse(res.text);
    } else {
      setResponse(`Error: ${res.error || 'Failed to communicate with GMI Cloud H100 cluster'}`);
    }
  };

  return (
    <div className="rounded-xl border border-sky-500/20 bg-slate-900/80 p-6 backdrop-blur-md shadow-2xl text-white max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 border-b border-sky-500/20 pb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">☁️</span>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              GMI Cloud Enterprise GPU Cluster
            </h3>
            <p className="text-xs text-slate-400">Bare-Metal NVIDIA H100/H200 Clusters & vLLM Inference Engines</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
          gmi.cloud Active
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Cluster Specs</div>
          <div className="text-sm font-bold text-sky-400">8x H100 SXM5</div>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Model Engine</div>
          <div className="text-sm font-bold text-indigo-400">vLLM / TensorRT</div>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Cluster Status</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center justify-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>READY</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleInference} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select Enterprise Model Endpoint</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="deepseek-ai/DeepSeek-R1">DeepSeek-R1 (High-Reasoning vLLM)</option>
            <option value="meta-llama/Llama-3.3-70B-Instruct">Llama-3.3-70B-Instruct (GMI H100 Cluster)</option>
            <option value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen2.5-Coder-32B-Instruct</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Query / Complex Enterprise Task Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Audit this Solana Anchor smart contract code for security vulnerabilities..."
            className="w-full h-24 rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 font-bold text-sm hover:from-sky-400 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Processing on GMI Cloud H100 Cluster...</span>
          ) : (
            <span>⚡ Dispatch to GMI Cloud Cluster</span>
          )}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-sky-500/30 text-xs space-y-2">
          <div className="font-bold text-sky-300">Cluster Response:</div>
          <div className="text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-900 p-3 rounded border border-slate-800">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
