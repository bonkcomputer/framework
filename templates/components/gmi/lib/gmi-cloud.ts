/**
 * GMI Cloud Enterprise GPU Cluster Integration for {{PROJECT_NAME}}
 * Powered by GMI Cloud Native GPU Infrastructure (https://gmi.cloud)
 */

export interface GMIClusterJobOptions {
  jobName: string;
  gpuModel: 'NVIDIA-H100' | 'NVIDIA-H200' | 'NVIDIA-A100-80GB' | 'NVIDIA-L40S';
  gpuCount: number;
  containerImage: string;
  command: string[];
  environment?: Record<string, string>;
}

export interface GMIClusterJobStatus {
  jobId: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  allocatedGpus: number;
  nodeName?: string;
  logs?: string[];
  createdAt: string;
}

export interface GMIVLLMRequest {
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export class GMICloudClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GMI_API_KEY || process.env.GMI_API_KEY || '';
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_GMI_ENDPOINT_URL || 'https://api.gmi.cloud/v1';
  }

  /**
   * High-throughput chat inference using GMI Cloud vLLM / TensorRT-LLM hosted endpoint.
   */
  async chatCompletion(request: GMIVLLMRequest): Promise<any> {
    if (!this.apiKey) {
      throw new Error('GMI Cloud API key is missing. Set GMI_API_KEY in your environment.');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || 'deepseek-ai/DeepSeek-R1',
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2048,
        stream: request.stream ?? false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GMI Cloud API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Submit an enterprise GPU batch / fine-tuning job to a GMI Cloud Kubernetes/Slurm Cluster.
   */
  async submitClusterJob(options: GMIClusterJobOptions): Promise<GMIClusterJobStatus> {
    if (!this.apiKey) {
      throw new Error('GMI Cloud API Key is missing.');
    }

    const response = await fetch(`${this.baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit GMI cluster job: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Get the status of a cluster job running on GMI Cloud H100/H200 nodes.
   */
  async getJobStatus(jobId: string): Promise<GMIClusterJobStatus> {
    if (!this.apiKey) {
      throw new Error('GMI Cloud API key is missing.');
    }

    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GMI job status for ${jobId}`);
    }

    return await response.json();
  }
}
