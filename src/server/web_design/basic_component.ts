import { v4 as uuidv4 } from 'uuid';
import type { StatusEmitter, LLMClient, ClaudeAPIParams, ParentRequirements } from '../types';
import type { CoreMessage, CoreUserMessage, CoreSystemMessage } from 'ai';

/**
 * Base component class that provides common functionality for all component generators
 */
export abstract class BaseComponent {
    protected emitStatus: StatusEmitter;
    protected llmClient: LLMClient;

    constructor(statusEmitter: StatusEmitter, llmClient: LLMClient) {
        this.emitStatus = statusEmitter;
        this.llmClient = llmClient;
    }

    /**
     * Generate a unique ID for the component
     */
    protected _generateId(): string {
        return uuidv4().slice(0, 10);
    }

    /**
     * Generate a display name for the component
     */
    protected _generateDisplayName(prefix: string): string {
        return `${prefix}-${uuidv4().slice(0, 2)}`;
    }

    /**
     * Get the prompt for the component
     */
    abstract get prompt(): string;

    /**
     * Generate the component properties using Claude API
     */
    abstract generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>>;

    /**
     * Call Claude API to generate component properties
     */
    protected async callComponentAPI(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        statusPrefix: string
    ): Promise<any> {
        // Create system message
        const systemMessage: CoreSystemMessage = {
            role: 'system',
            content: this.prompt
        };

        // Create user message
        const userMessage: CoreUserMessage = {
            role: 'user',
            content: `
        Generate properties with the following context:

        Element Requirements:
        ${elementRequirements}

        Parent Component Requirements:
        ${typeof parentRequirements === 'string'
                ? parentRequirements
                : JSON.stringify(parentRequirements, null, 2)}

        Ensure the generated element maintains visual harmony with the parent component
        while fulfilling its specific requirements.
        `
        };

        // Create message array
        const messages: CoreMessage[] = [systemMessage, userMessage];

        const response = await this.llmClient.callClaudeAPI({
            statusPrefix,
            messages
        });

        console.log(response.text);

        return JSON.parse(response.text);
    }
}

export default BaseComponent;