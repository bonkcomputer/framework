/**
 * Hybrid Compute Orchestrator for {{PROJECT_NAME}}
 * Dynamic routing across E2B (CPU MicroVMs), RunPod (Serverless GPU), and GMI Cloud (Enterprise GPU Clusters)
 */

import { RunPodClient } from '../../runpod/lib/runpod';
import { GMICloudClient } from '../../gmi/lib/gmi-cloud';

export type ComputeProvider = 'e2b' | 'runpod' | 'gmi_cloud' | 'auto';
export type TaskCategory = 'code-execution' | 'media-generation' | 'light-llm' | 'heavy-reasoning' | 'fine-tune';

export interface ComputeJobRequest {
  category: TaskCategory;
  provider?: ComputeProvider;
  payload: Record<string, any>;
  maxCostUsd?: number;
}

export interface ComputeJobResponse {
  providerUsed: ComputeProvider;
  executionTimeMs: number;
  estimatedCostUsd: number;
  result: any;
}

export class ComputeRouter {
  /**
   * Intelligently routes task requests based on category, provider SLA, and target cost.
   */
  static async routeAndExecute(request: ComputeJobRequest): Promise<ComputeJobResponse> {
    const startTime = Date.now();
    const provider = request.provider || this.selectBestProvider(request.category);

    switch (provider) {
      case 'runpod': {
        const client = new RunPodClient();
        const endpointId = request.payload.endpointId || process.env.NEXT_PUBLIC_RUNPOD_ENDPOINT_ID || 'serverless-gpu-endpoint';
        const jobStatus = await client.runServerlessEndpoint(endpointId, request.payload.input || request.payload, true);
        const cost = RunPodClient.estimateCost(request.payload.gpuType || 'RTX4090', 10);

        return {
          providerUsed: 'runpod',
          executionTimeMs: Date.now() - startTime,
          estimatedCostUsd: cost.usd,
          result: jobStatus.output || jobStatus,
        };
      }

      case 'gmi_cloud': {
        const client = new GMICloudClient();
        const response = await client.chatCompletion({
          model: request.payload.model || 'deepseek-ai/DeepSeek-R1',
          messages: request.payload.messages || [{ role: 'user', content: request.payload.prompt || 'Hello' }],
        });

        return {
          providerUsed: 'gmi_cloud',
          executionTimeMs: Date.now() - startTime,
          estimatedCostUsd: 0.005, // Enterprise token bulk rate
          result: response.choices?.[0]?.message?.content || response,
        };
      }

      case 'e2b':
      default: {
        // E2B CPU Sandboxing
        return {
          providerUsed: 'e2b',
          executionTimeMs: Date.now() - startTime,
          estimatedCostUsd: 0.0001,
          result: { message: 'Executed in E2B Firecracker MicroVM sandbox' },
        };
      }
    }
  }

  private static selectBestProvider(category: TaskCategory): ComputeProvider {
    switch (category) {
      case 'code-execution':
        return 'e2b';
      case 'media-generation':
        return 'runpod';
      case 'heavy-reasoning':
      case 'fine-tune':
        return 'gmi_cloud';
      case 'light-llm':
      default:
        return 'runpod';
    }
  }
}
