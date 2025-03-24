import { generateText } from 'ai';
import type { CoreMessage, CoreSystemMessage, CoreUserMessage, CoreAssistantMessage, CoreToolMessage, TextPart, ImagePart, FilePart, GenerateTextResult, ToolSet } from 'ai';
import type { StatusEmitter } from './types';

/**
 * ClaudeAdapter - Adapter class for working with Claude API in different environments
 * This class standardizes the interface for making Claude API calls
 */
export class ClaudeAdapter {
    private anthropicClient: any;
    private statusEmitter?: StatusEmitter;

    constructor(anthropicClient: any, statusEmitter?: StatusEmitter) {
        this.anthropicClient = anthropicClient;
        this.statusEmitter = statusEmitter;
    }

    /**
     * Set or update status emitter
     */
    setStatusEmitter(statusEmitter: StatusEmitter): void {
        this.statusEmitter = statusEmitter;
    }

    /**
     * Add cache control to all messages
     * This function processes each message and adds Anthropic cache control
     */
    private addCacheControlToMessages(messages: CoreMessage[]): CoreMessage[] {
        return messages.map(message => {
            // Add cache control based on message type
            if (message.role === 'system') {
                // System message
                const systemMessage = message as CoreSystemMessage;
                return {
                    ...systemMessage,
                    providerOptions: {
                        ...(systemMessage.providerOptions || {}),
                        anthropic: { cacheControl: { type: 'ephemeral' } }
                    }
                };
            } else if (message.role === 'user') {
                // User message
                const userMessage = message as CoreUserMessage;

                // Handle different content formats for user messages
                if (typeof userMessage.content === 'string') {
                    // String content
                    return {
                        ...userMessage,
                        providerOptions: {
                            ...(userMessage.providerOptions || {}),
                            anthropic: { cacheControl: { type: 'ephemeral' } }
                        }
                    };
                } else if (Array.isArray(userMessage.content)) {
                    // Array content (text parts, image parts, etc.)
                    const contentWithCache = userMessage.content.map(part => {
                        if (part.type === 'text') {
                            // Add cache control to text parts
                            const textPart = part as TextPart;
                            return {
                                ...textPart,
                                providerOptions: {
                                    ...(textPart.providerOptions || {}),
                                    anthropic: { cacheControl: { type: 'ephemeral' } }
                                }
                            };
                        }
                        // Return other parts unchanged (images, files)
                        return part;
                    });

                    return {
                        ...userMessage,
                        content: contentWithCache,
                        providerOptions: {
                            ...(userMessage.providerOptions || {}),
                            anthropic: { cacheControl: { type: 'ephemeral' } }
                        }
                    };
                }
            } else if (message.role === 'assistant') {
                // Assistant message
                const assistantMessage = message as CoreAssistantMessage;
                return {
                    ...assistantMessage,
                    providerOptions: {
                        ...(assistantMessage.providerOptions || {}),
                        anthropic: { cacheControl: { type: 'ephemeral' } }
                    }
                };
            } else if (message.role === 'tool') {
                // Tool message
                const toolMessage = message as CoreToolMessage;
                return {
                    ...toolMessage,
                    providerOptions: {
                        ...(toolMessage.providerOptions || {}),
                        anthropic: { cacheControl: { type: 'ephemeral' } }
                    }
                };
            }

            // If none of the above, return the original message
            return message;
        });
    }

    /**
     * Generate text using Claude API
     */
    async generateText<TOOLS extends ToolSet = {}>(params: {
        messages: CoreMessage[];
        temperature?: number;
        max_tokens?: number;
    }): Promise<GenerateTextResult<TOOLS, never>> {
        const { messages, temperature, max_tokens } = params;

        try {
            if (this.statusEmitter) {
                this.statusEmitter('claude-api', 'Generating text with Claude API');
            }

            // Add cache control to all messages
            const messagesWithCache = this.addCacheControlToMessages(messages);

            // Handle AI SDK's generateText
            const response = await generateText({
                model: this.anthropicClient('claude-3-7-sonnet-20250219'),
                messages: messagesWithCache,
                temperature: temperature || 0,
                maxTokens: max_tokens || 4096
            });

            return response as GenerateTextResult<TOOLS, never>;
        } catch (error: any) {
            if (this.statusEmitter) {
                this.statusEmitter('error', `Error in Claude API: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Call Claude API with the simplified interface for our components
     */
    async callClaudeAPI<TOOLS extends ToolSet = {}>(params: {
        statusPrefix: string;
        messages: CoreMessage[];
    }): Promise<GenerateTextResult<TOOLS, never>> {
        const { statusPrefix, messages } = params;

        if (this.statusEmitter) {
            this.statusEmitter(statusPrefix, 'Calling Claude API');
        }

        try {
            const result = await this.generateText<TOOLS>({
                messages: messages,
                temperature: 0,
                max_tokens: 4096
            });

            if (this.statusEmitter) {
                this.statusEmitter(statusPrefix, 'Claude API response received');
            }

            return result;
        } catch (error: any) {
            if (this.statusEmitter) {
                this.statusEmitter('error', `Error calling Claude API: ${error.message}`);
            }
            throw error;
        }
    }
}

export default ClaudeAdapter;