import {createAnthropic} from '@ai-sdk/anthropic';
import {
    generateText,
    type CoreMessage,
    type CoreUserMessage,
    type ImagePart,
    type TextPart,
    type Tool as AiTool,
    type ToolSet, type GenerateTextResult, type CoreSystemMessage
} from 'ai';
import {Agent} from 'agents';
import type {Connection, WSMessage} from "partyserver";
import {z} from 'zod';

// Import the generator components
import LayoutGenerator from './layout_generator';
import {ClaudeAdapter} from './claude_adapter';
import type {LayoutAIResponse, StatusEmitter} from './types';
import {CommunicationMode} from './types';

// Environment variables type definition
type Env = {
    ANTHROPIC_API_KEY: string;
};

// Root container configuration interfaces
interface DesignRequirements {
    purpose: string;
    constraints: {
        max_width: string;
        background: string;
        padding: string;
        margin: string;
    };
    accessibility: string;
    visual_hierarchy: string;
}

interface ContainerProps {
    background: string;
    padding: number;
    margin: number;
    borderRadius: number;
    elevation: number;
    display: string;
    justifyContent: string;
    alignItems: string;
    "data-cy": string;

    [key: string]: any;
}

interface ContainerType {
    resolvedName: string;
}

interface RootContainer {
    type: ContainerType;
    isCanvas: boolean;
    props: ContainerProps;
    displayName: string;
    custom: Record<string, any>;
    hidden: boolean;
    nodes: string[];
    linkedNodes: Record<string, any>;
}

interface RootContainerConfig {
    design_requirements: DesignRequirements;
    definition: {
        ROOT: RootContainer;
        [key: string]: any;
    };
}

// Layout interfaces
interface BasicElement {
    element_type: "Heading" | "Paragraph" | "Text" | "Button" | "Image" | "Divider" | "Icon";
    element_requirements: string;
    element_url?: string;
}

interface Layout {
    index: number;
    layout_type: "Container" | "Flexbox" | "Section";
    layout_requirements: string;
    basic_elements: BasicElement[];
}

interface ImageElement {
    layout_index: number;
    element_type: string;
    url: string;
    requirements: string;
}

interface PageContent {
    prompt: string;
    images?: string[];
}

interface LayoutDesignerArgs {
    page_content: string;
    layouts: Layout[];
}



/**
 * Layout_design - A Cloudflare Agent for generating layout designs
 * using the Anthropic Claude API via AI SDK
 */
export class LayoutDesign extends Agent<Env> {
    anthropic = createAnthropic({
        apiKey: this.env.ANTHROPIC_API_KEY ?? ''
    });
    connections: Map<string, Connection> = new Map<string, Connection>();
    rootContainerConfig = {
        design_requirements: {
            purpose: "Main container for the entire page layout",
            constraints: {
                max_width: "1200px",
                background: "white",
                padding: "0px",
                margin: "auto"
            },
            accessibility: "Should be responsive and contain all page content",
            visual_hierarchy: "Should maintain proper spacing between child elements"
        },
        definition: {
            ROOT: {
                type: {
                    resolvedName: "Container"
                },
                isCanvas: true,
                props: {
                    background: "#ffffff",
                    padding: 0,
                    margin: 0,
                    borderRadius: 4,
                    elevation: 0,
                    display: "block",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    "data-cy": "root-container"
                },
                displayName: "root",
                custom: {},
                hidden: false,
                nodes: [],
                linkedNodes: {}
            }
        }
    }
    tools: ToolSet = this._initTools();

    // Create a Claude adapter that will be used by the layout generator
    claudeAdapter = new ClaudeAdapter(this.anthropic);

    async onConnect(connection: any): Promise<void> {
        // Store connection state
        this.connections.set(connection.id, connection);

        // Send welcome message
        await connection.send(JSON.stringify({
            type: "status",
            status: "init",
            message: "Connected to Layout_design"
        }));
    }

    /**
     * Called when a connection is closed
     * @param connection - The connection object
     */
    async onDisconnect(connection: any): Promise<void> {
        // Update connection state
        if (this.connections.has(connection.id)) {
            this.connections.delete(connection.id);
        }
    }

    /**
     * Send status to a specific client
     * @param connection - The connection object (optional for REST API mode)
     * @param status - Status type
     * @param message - Status message
     * @param mode - Communication mode (websocket or rest_api)
     */
    sendStatus(connection: Connection | null, status: string, message: string, mode: CommunicationMode = CommunicationMode.WEBSOCKET): void {
        const statusMsg = JSON.stringify({
            type: "status",
            status,
            message,
            timestamp: new Date().toISOString()
        });

        if (mode === CommunicationMode.WEBSOCKET && connection) {
            connection.send(statusMsg);
        } else {
            // For REST API mode, just log to console
            console.log(`[${status}] ${message}`);
        }
    }

    /**
     * Handle incoming messages
     * @param connection - The connection object
     * @param message - The message received
     */
    async onMessage(connection: any, message: string | Uint8Array): Promise<void> {
        try {
            // Parse the message if it's a string
            const data = typeof message === "string"
                ? JSON.parse(message)
                : message;

            // Handle different message types
            switch (data.type) {
                case "generate-layout":
                    this.sendStatus(connection, 'layout-design', 'Starting layout design generation');
                    const result = await this.generateLayoutDesign(connection, data.content, CommunicationMode.WEBSOCKET);
                    await connection.send(JSON.stringify({
                        type: "layout-result",
                        data: result
                    }));
                    break;

                default:
                    // Echo the message back for unknown types
                    await connection.send(JSON.stringify({
                        type: "error",
                        message: "Unknown message type",
                        originalMessage: data
                    }));
            }
        } catch (error) {
            // Handle errors
            const errorMessage = error instanceof Error ? error.message : String(error);
            await connection.send(JSON.stringify({
                type: "error",
                message: errorMessage
            }));
        }
    }

    /**
     * Handle HTTP requests
     * @param request - The HTTP request
     */
    async onRequest(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // generate by rest api
        if (url.pathname.endsWith("generate") && request.method === "POST") {
            try {
                const body = await request.json() as {content: PageContent};
                const result = await this.generateLayoutDesign(null, body.content, CommunicationMode.REST_API);
                return new Response(JSON.stringify(result), {
                    headers: {"Content-Type": "application/json"}
                });
            } catch (error) {
                console.log(error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                return new Response(JSON.stringify({ error: errorMessage }), {
                    status: 400,
                    headers: {"Content-Type": "application/json"}
                });
            }
        }

        // Default response for other paths
        return new Response("Not Found", {status: 404});
    }

    private _initTools(): ToolSet {
        // Define layout_designer tool schema
        const layoutDesignerSchema = z.object({
            page_content: z.string().describe("Natural language description of the desired page content and structure"),
            layouts: z.array(z.object({
                index: z.number(),
                layout_type: z.enum(["Container", "Flexbox", "Section"]),
                layout_requirements: z.string().describe("Natural language description of layout requirements including image URLs if specified"),
                basic_elements: z.array(z.object({
                    element_type: z.enum(["Button", "Icon", "Heading", "Paragraph", "Image", "Text", "Divider"]),
                    element_requirements: z.string().describe("Natural language description of element requirements")
                }))
            }))
        });

        // Create AI SDK ToolSet
        return {
            layout_designer: {
                description: `
                Generate layout structure by specifying the layout components and their contained basic elements in page order.
                The layouts will be placed inside a root container with white background, 20px padding, and max-width 1200px.

                CRITICAL RULE: The basic_elements array must ONLY contain the following element types: "Heading", "Paragraph", "Text", "Button", "Image", "Divider", or "Icon".
                NEVER use "Container" as an element_type within basic_elements. Containers should only be used as layout_type values.

                For nested or grouped content:
                - Do NOT attempt to nest containers inside basic_elements
                - Instead, create a new separate layout component with its own index and basic_elements array
                - Reference the nesting relationship in the layout_requirements

                IMPORTANT: Only use Flexbox layout type when ALL child elements need to be UNIFORM in size.
                Limit Flexbox layouts to a maximum of 4 elements to prevent overcrowding.
                If the elements have different sizes or proportions, use Container or Section instead.
                Using Flexbox with varied element sizes results in poor aesthetics.

                For all layouts, PREFER CENTERED DESIGNS with "justifyContent": "center" rather than "space-between".
                Use consistent padding on all sides of containers and adequate spacing between elements.

                The response should be an array of layout components where each component contains:
                    - index: Position in page order starting from 0 
                    - layout_type: Type of layout component (Container/Flexbox/Section)
                    - layout_requirements: String describing layout needs and specifications, including any image URLs
                    - basic_elements: Array of element objects with ONLY the allowed element_types
                `,
                parameters: layoutDesignerSchema,
                execute: async (args: z.infer<typeof layoutDesignerSchema>) => {
                    // This function won't be called in this Agent
                    // We're just passing the tool definition to the model
                    return args;
                }
            }
        };
    }

    /**
     * Create a status emitter function for the given connection or communication mode
     * @param connection - Optional connection object (required for websocket mode)
     * @param mode - Communication mode
     */
    private createStatusEmitter(connection: Connection | null, mode: CommunicationMode): StatusEmitter {
        return (statusPrefix: string, message: string) => {
            this.sendStatus(connection, statusPrefix, message, mode);
        };
    }

    /**
     * Generate layout design based on page content
     * @param connection - Optional connection object (required for websocket mode)
     * @param pageContent - Page content object containing prompt and images
     * @param mode - Communication mode (websocket or rest_api)
     */
    async generateLayoutDesign(connection: Connection | null, pageContent: PageContent, mode: CommunicationMode = CommunicationMode.WEBSOCKET): Promise<Record<string, any>> {
        // Send status update
        this.sendStatus(connection, 'layout-design', 'Starting layout design generation for provided content', mode);

        const prompt = pageContent.prompt;
        const images = pageContent.images || [];

        let actual_prompt = `
        Design a complete page layout based on the following content requirements:
        ${prompt}

        Consider these important factors:
        1. The page will be contained within a root container with:
           - White background
           - 20px padding
           - Maximum width constraint (1200px)
           - Proper spacing between elements

        2. Generate appropriate layout components that:
           - Follow a logical visual hierarchy
           - Maintain proper spacing and alignment
           - Consider responsive design principles
           - Use appropriate layout types (Container/Flexbox/Section)
           - Work harmoniously within the root container
           - Include any specified image URLs in the layout requirements
           - PRIORITIZE CENTERED DESIGNS with "justifyContent": "center" rather than "space-between"
           - Use consistent padding on all sides of containers (e.g., 16px or 24px)

        3. For any background images or image elements:
           - Include the image URLs directly in layout requirements
           - Ensure proper image dimensions and spacing
           - Consider responsive design for images

        4. IMPORTANT: Only use Flexbox when all child elements should be uniform in size.
           - Limit Flexbox layouts to a maximum of 4 elements to prevent overcrowding
           - If elements need different sizes, dimensions, or proportions, use Container or Section instead
           - Using Flexbox with varied element sizes creates poor aesthetics
           - Examine the content requirements carefully to determine if elements should be uniform or varied
        `;

        if (images.length > 0) {
            actual_prompt += `\n\n5. Image URLs to use (MUST include ALL of these):\n`;

            // Add each image URL on a new line
            images.forEach((imageUrl, index) => {
                actual_prompt += `  - Image ${index + 1}: ${imageUrl}\n`;
            });

            actual_prompt += `\nPlease make sure ALL of these images are incorporated into your layout design and their exact URLs are included in the element_requirements.`;
        }

        this.sendStatus(connection, 'layout-design', 'Sending layout design request to AI model with reference images', mode);

        const systemPrompt = `You are an expert web layout designer specialized in creating structured, user-friendly page layouts. Your role is to analyze user requirements and generate appropriate layout structures using layout components and basic elements.

        Follow these guidelines when designing layouts:

        1. Layout Components:

        Container:
        - A primary wrapper for content sections
        - Requirements should specify:
          * Width and height behavior (fixed or responsive)
          * Desired padding and spacing
          * Content alignment and organization (PREFER CENTERED ALIGNMENT)
          * Background styling if needed (including image URLs if provided)
          * Responsive behavior considerations

        Flexbox:
        - Used ONLY for flexible layouts where ALL child elements are of UNIFORM size
        - DO NOT use Flexbox when child elements have different sizes or proportions
        - If elements need different sizes or proportions, use Container or Section instead
        - Do not use more than 4 elements in a Flexbox layout to prevent overcrowding
        - Requirements should specify:
          * Direction of content flow
          * Content alignment and distribution (PREFER CENTER ALIGNMENT)
          * Spacing between items (use at least 20px gap)
          * Wrapping behavior
          * Background image if specified
          * Responsive layout adjustments
          * Confirmation that all child elements are uniform in size

        Section:
        - Used for distinct content blocks
        - Requirements should specify:
          * Content area dimensions
          * Internal spacing needs (use consistent padding on all sides)
          * Background treatment (including image URLs if provided)
          * Content organization (PREFER CENTERED ALIGNMENT)
          * Visual separation from other sections

        2. Basic Elements and Positioning:

        Button:
        - Interactive element for user actions
        - Requirements should specify:
          * Button type (primary, secondary, etc.)
          * Size and padding needs
          * Label text
          * Visual prominence level
          * Alignment (center-aligned for main CTAs, appropriate alignment for contextual actions)
          * Proper spacing from surrounding elements

        Icon:
        - Visual symbol or indicator
        - Requirements should specify:
          * Icon type/name to use
          * Size requirements
          * Color preferences
          * Purpose and context
          * ALWAYS position icons in relation to associated elements (next to headings, inside buttons)
          * NEVER position icons in isolation without clear relation to content

        Heading:
        - Section titles and subtitles
        - Requirements should specify:
          * Heading text content
          * Heading level (h1-h6)
          * Visual importance
          * Spacing needs
          * Alignment preferences (PREFER CENTER ALIGNMENT for headings)
          * Related icon positioning if applicable

        Paragraph:
        - Text content blocks
        - Requirements should specify:
          * Paragraph text content
          * Text formatting needs
          * Spacing requirements
          * Width constraints
          * Readability considerations

        Image:
        - Visual content element
        - Requirements should specify:
          * Image source URL if provided
          * Size constraints
          * Alt text for accessibility
          * Aspect ratio preferences
          * Responsive behavior

        3. Important Considerations:
        - Maintain clear hierarchy in layout structure
        - Ensure proper component nesting
        - Consider responsive behavior
        - Maintain accessibility standards
        - Use appropriate spacing between elements (min 20px gap for Flexbox)
        - Include provided image URLs in layout requirements when specified
        - ONLY use Flexbox for layouts with uniformly sized elements (max 4 elements)
        - If elements have varying sizes or proportions, use Container or Section instead
        - Avoid using Flexbox with varied element sizes as it will result in poor aesthetics
        - PREFER CENTERED DESIGNS: Use "justifyContent": "center" rather than "space-between"
        - Use consistent padding on all sides of containers (e.g., 16px or 24px)
        - Position icons contextually - always near related content, never in isolation
        - Buttons should have clear positioning and alignment within their parent containers`;

        const systemMessage: CoreSystemMessage = {
            role: 'system',
            content: systemPrompt
        }

        // Build the message with CoreMessage type
        const userMessage: CoreUserMessage = {
            role: 'user',
            content: [] // Will contain text and image content
        };

        // Add image content to user message
        if (images && images.length > 0) {
            images.forEach((imageUrl) => {
                // Add each image as ImagePart object
                (userMessage.content as Array<TextPart | ImagePart>).push({
                    type: 'image',
                    image: new URL(imageUrl)
                });
            });
        }

        // Add text content
        (userMessage.content as Array<TextPart | ImagePart>).push({
            type: 'text',
            text: actual_prompt,
            providerOptions: {
                anthropic: { cacheControl: { type: 'ephemeral' } }
            }
        });

        // Create complete message array
        const messages: CoreMessage[] = [systemMessage, userMessage];

        // Use AI SDK's generateText function
        let result: GenerateTextResult<any, any>;

        // Use AI SDK's generateText function
        try {
            console.log('Sending request to Claude API...');
            result = await generateText({
                model: this.anthropic('claude-3-7-sonnet-20250219'),
                messages: messages,
                temperature: 0,
                maxTokens: 4096,
                tools: this.tools
            });
        } catch (error) {
            // Detailed error logging
            console.error('Error generating text:', error);
            this.sendStatus(connection, 'error', `Error calling Claude API: ${error}`, mode);
            throw error; // Rethrow error for upper layer handling
        }

        if (!result.toolCalls || result.toolCalls.length === 0) {
            this.sendStatus(connection, 'error', `No tool calls found in response`, mode);
            throw new Error('No tool calls found in response');
        }

        const layoutDesignerTool = result.toolCalls.find(tc => tc.toolName === 'layout_designer');
        if (!layoutDesignerTool) {
            this.sendStatus(connection, 'error', `Layout designer tool not called`, mode);
            throw new Error('Layout designer tool not called');
        }

        this.sendStatus(connection, 'layout-design-result', JSON.stringify(layoutDesignerTool), mode);

        // Send status update
        this.sendStatus(connection, 'layout-design', 'Layout design generation completed', mode);
        return await this.processLayout(connection, layoutDesignerTool, mode);
    }

    /**
     * Process layout tool result and build the layout configuration
     * @param connection - Optional connection object
     * @param layoutDesignerTool - The layout designer tool result
     * @param mode - Communication mode
     */
    async processLayout(connection: Connection | null, layoutDesignerTool: any, mode: CommunicationMode = CommunicationMode.WEBSOCKET): Promise<Record<string, any>> {
        try {
            this.sendStatus(connection, 'layout-processing', 'Processing layout tool results', mode);

            const layouts: LayoutAIResponse[] = layoutDesignerTool.args?.layouts;

            if (!layouts || layouts.length === 0) {
                this.sendStatus(connection, 'error', 'No layouts found in tool arguments', mode);
                throw new Error('No layouts found in tool arguments');
            }

            this.sendStatus(connection, 'layout-processing', `Processing ${layouts.length} layouts`, mode);

            // Create status emitter for the connection
            const statusEmitter = this.createStatusEmitter(connection, mode);

            // Update the Claude adapter with the status emitter
            this.claudeAdapter.setStatusEmitter(statusEmitter);

            // Initialize the layout generator
            const layoutGenerator = new LayoutGenerator(statusEmitter, this.claudeAdapter);

            // Process layouts using the generator
            const result = await layoutGenerator.processLayouts(layouts, this.rootContainerConfig.design_requirements);
            const layouts_definition = result.definition;
            const layout_ids = result.layout_ids;

            // Update the root container nodes with layout IDs
            const root_definition = JSON.parse(JSON.stringify(this.rootContainerConfig.definition));

            // Update the nodes in the root container with layout IDs
            root_definition.ROOT.nodes = layout_ids;

            // Combine the root definition and layout definitions
            const final_definition = {
                ...root_definition,
                ...layouts_definition
            };

            this.sendStatus(connection, 'layout-processing', 'Layout processing completed', mode);

            // Return the complete layout result
            return final_definition;
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.sendStatus(connection, 'error', `Error processing layout: ${errorMessage}`, mode);
            throw error;
        }
    }
}

export default LayoutDesign;