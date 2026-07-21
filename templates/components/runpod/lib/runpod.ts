/**
 * RunPod GPU Compute Integration for {{PROJECT_NAME}}
 * Powered by RunPod Serverless & Pod APIs (https://runpod.io)
 */

export interface RunPodJobInput {
  endpointId: string;
  input: Record<string, any>;
  webhook?: string;
}

export interface RunPodJobStatus {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  output?: any;
  executionTime?: number;
  delayTime?: number;
  error?: string;
}

export interface RunPodGPUStats {
  id: string;
  name: string;
  gpuType: string;
  gpuCount: number;
  costPerHour: number;
  status: 'RUNNING' | 'STOPPED' | 'TERMINATED';
}

export class RunPodClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.runpod.ai/v2';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_RUNPOD_API_KEY || process.env.RUNPOD_API_KEY || '';
  }

  /**
   * Run a serverless job synchronously or asynchronously on a RunPod serverless endpoint.
   */
  async runServerlessEndpoint(endpointId: string, input: Record<string, any>, sync: boolean = false): Promise<RunPodJobStatus> {
    if (!this.apiKey) {
      throw new Error('RunPod API Key is missing. Set RUNPOD_API_KEY in your environment.');
    }

    const action = sync ? 'runsync' : 'run';
    const response = await fetch(`${this.baseUrl}/${endpointId}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RunPod API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Check status of an asynchronous serverless job.
   */
  async getJobStatus(endpointId: string, jobId: string): Promise<RunPodJobStatus> {
    if (!this.apiKey) {
      throw new Error('RunPod API Key is missing.');
    }

    const response = await fetch(`${this.baseUrl}/${endpointId}/status/${jobId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RunPod job status for ${jobId}`);
    }

    return await response.json();
  }

  /**
   * Poll an asynchronous job until completion or timeout.
   */
  async pollJobUntilComplete(endpointId: string, jobId: string, maxWaitMs: number = 60000, intervalMs: number = 2000): Promise<RunPodJobStatus> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getJobStatus(endpointId, jobId);
      if (status.status === 'COMPLETED' || status.status === 'FAILED' || status.status === 'CANCELLED') {
        return status;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`RunPod job ${jobId} timed out after ${maxWaitMs}ms`);
  }

  /**
   * Estimate compute cost in USD and SOL/BCT equivalent.
   */
  static estimateCost(gpuType: 'RTX4090' | 'A100' | 'H100' | 'L40S', durationSeconds: number): { usd: number; estimatedSol: number } {
    const ratesPerHour: Record<string, number> = {
      RTX4090: 0.69,
      L40S: 0.99,
      A100: 1.89,
      H100: 3.29,
    };
    const ratePerHour = ratesPerHour[gpuType] || 0.99;
    const usd = (ratePerHour / 3600) * durationSeconds;
    // Assuming SOL ~ $150 standard baseline for estimation
    const estimatedSol = usd / 150;
    return { usd: Number(usd.toFixed(6)), estimatedSol: Number(estimatedSol.toFixed(6)) };
  }
}
