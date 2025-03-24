// Common Types for Layout Generator and Components
import type { Connection } from 'partyserver';
import type {CoreMessage, GenerateTextResult, ToolSet} from "ai";

// Basic element types
export type ElementType = "Heading" | "Paragraph" | "Text" | "Button" | "Divider" | "Image";
export type LayoutType = "Container" | "Flexbox" | "Section";

// Basic element interface
export interface BasicElement {
    element_type: ElementType;
    element_requirements: string;
}

// Layout AI response interface
export interface LayoutAIResponse {
    index: number;
    layout_type: LayoutType;
    layout_requirements: string;
    basic_elements: BasicElement[];
}

// Parent requirements can be either a string or an object
export type ParentRequirements = string | Record<string, any>;

// Status emitter function type
export type StatusEmitter = (statusPrefix: string, message: string) => void;

// Define a communication mode enum to differentiate between WebSocket and REST API
export enum CommunicationMode {
  WEBSOCKET = 'websocket',
  REST_API = 'rest_api'
}

// Helper function to create a console-based StatusEmitter for REST API mode
export function createConsoleStatusEmitter(): StatusEmitter {
  return (statusPrefix: string, message: string) => {
    console.log(`[${statusPrefix}] ${message}`);
  };
}

// Claude API call parameters
export interface ClaudeAPIParams {
    statusPrefix: string;
    messages: CoreMessage[];
}

// LLM client interface
export interface LLMClient {
    callClaudeAPI<TOOLS extends ToolSet = {}>(params: ClaudeAPIParams): Promise<GenerateTextResult<TOOLS, never>>;
}

// Common utilities shared across components
export interface CommonUtils {
    emitStatus: StatusEmitter;
    llmClient: LLMClient;
}

// Component generator interface
export interface ComponentGenerator {
    generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>>;

    prompt: string;
}

// Layout processing result
export interface LayoutProcessingResult {
    definition: Record<string, any>;
    layout_ids: string[];
}

// Layout generation result
export interface LayoutResult {
    root_container_config: Record<string, any>;
    layout_definition: Record<string, any>;
    image_elements: Array<{
        layout_index: number;
        element_type: string;
        url: string;
        requirements: string;
    }>;
}

