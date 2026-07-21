'use client';

import { useState } from 'react';
import { RunPodClient, RunPodJobStatus } from '../lib/runpod';

export function useRunPod(endpointId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<RunPodJobStatus | null>(null);

  const runGpuJob = async (input: Record<string, any>, customEndpointId?: string) => {
    const targetEndpoint = customEndpointId || endpointId;
    if (!targetEndpoint) {
      throw new Error('No RunPod endpoint ID provided');
    }

    setLoading(true);
    setError(null);

    try {
      const client = new RunPodClient();
      // Trigger job synchronously or poll
      const initialStatus = await client.runServerlessEndpoint(targetEndpoint, input, false);
      setJobStatus(initialStatus);

      if (initialStatus.status === 'COMPLETED') {
        setLoading(false);
        return initialStatus.output;
      }

      // Poll if queued/in progress
      const finalStatus = await client.pollJobUntilComplete(targetEndpoint, initialStatus.id);
      setJobStatus(finalStatus);
      setLoading(false);

      if (finalStatus.status === 'FAILED') {
        throw new Error(finalStatus.error || 'RunPod job execution failed');
      }

      return finalStatus.output;
    } catch (err: any) {
      const message = err.message || 'RunPod GPU execution error';
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  return {
    runGpuJob,
    loading,
    error,
    jobStatus,
  };
}
