import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import env from '../config/env.js';

const bedrockClient = new BedrockRuntimeClient({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKey,
    secretAccessKey: env.aws.secretKey,
  },
});

/**
 * Invoke AWS Bedrock with a system prompt and user message.
 * Returns raw text response.
 * Timeout: 10 seconds (handled by caller).
 */
export const invokeBedrock = async (systemPrompt, userMessage) => {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    temperature: 0.2,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: env.aws.bedrockModel,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  const textContent = responseBody.content?.find((c) => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in Bedrock response');
  }

  return textContent.text;
};
