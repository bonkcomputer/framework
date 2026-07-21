'use server';

import { GMICloudClient, GMIVLLMRequest } from '../lib/gmi-cloud';

export async function runGMIInferenceAction(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, model: string = 'deepseek-ai/DeepSeek-R1') {
  try {
    const client = new GMICloudClient();
    const result = await client.chatCompletion({
      model,
      messages,
      temperature: 0.6,
      max_tokens: 2048,
    });

    return {
      success: true,
      text: result.choices?.[0]?.message?.content || '',
      usage: result.usage,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'GMI Cloud inference action failed',
    };
  }
}

export async function submitGMIFineTuneJobAction(datasetUrl: string, modelName: string, gpuCount: number = 8) {
  try {
    const client = new GMICloudClient();
    const job = await client.submitClusterJob({
      jobName: `finetune-${modelName}-${Date.now()}`,
      gpuModel: 'NVIDIA-H100',
      gpuCount,
      containerImage: 'gmicloud/pytorch-deepspeed:latest',
      command: ['python3', '-m', 'torch.distributed.run', 'train_lora.py', '--dataset', datasetUrl],
    });

    return {
      success: true,
      job,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to submit GMI Cloud fine-tuning job',
    };
  }
}
