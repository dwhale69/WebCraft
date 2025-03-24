import { v4 as uuidv4 } from 'uuid';
import { HeadingGenerator, ParagraphGenerator, TextGenerator, UserButtonGenerator, DividerGenerator, ImageGenerator } from './web_design';

// Types
import type { Connection } from 'partyserver';
import type { BasicElement, LayoutAIResponse, ParentRequirements, LLMClient } from './types';
import type { CoreMessage, CoreUserMessage, CoreSystemMessage } from 'ai';

interface StatusEmitter {
    (statusPrefix: string, message: string): void;
}

interface ClaudeAPIParams {
    statusPrefix: string;
    messages: CoreMessage[];
    system?: string;
}

export class LayoutGenerator {
    private tools: Record<string, any>;
    private emitStatus: StatusEmitter;
    private llmClient: LLMClient;

    constructor(statusEmitter: StatusEmitter, llmClient: LLMClient) {
        this.emitStatus = statusEmitter;
        this.llmClient = llmClient;

        this.emitStatus('init', 'Initializing LayoutGenerator');

        this.tools = {
            "Heading": new HeadingGenerator(statusEmitter, llmClient),
            "Paragraph": new ParagraphGenerator(statusEmitter, llmClient),
            "Text": new TextGenerator(statusEmitter, llmClient),
            "Button": new UserButtonGenerator(statusEmitter, llmClient),
            "Divider": new DividerGenerator(statusEmitter, llmClient),
            "Image": new ImageGenerator(statusEmitter, llmClient)
        };

        this.emitStatus('init', `Registered basic component tools: ${Object.keys(this.tools).join(', ')}`);
    }

    get prompt(): string {
        return `You are an expert layout engineer specialized in creating harmonious and visually appealing layouts. Your task is to generate layout definitions that work seamlessly with their parent components while maintaining visual consistency and proper spacing.

Given a parent component's design requirements and a layout type, generate a JSON object that follows these format guidelines while ensuring visual harmony with the parent:

For Container type:
{
    "props": {
        "background": "#ffffff",
        "padding": 20,
        "margin": 5,
        "borderRadius": 4,
        "elevation": 0,
        "display": "block",
        "justifyContent": "flex-start",
        "alignItems": "flex-start"
    }
}

For Flexbox type:
{
    "props": {
        "flexDirection": "row",
        "justifyContent": "flex-start",
        "alignItems": "stretch",
        "flexWrap": "nowrap",
        "gap": 8,
        "padding": 20,
        "margin": 0,
        "width": "100%",
        "minHeight": 100,
        "backgroundColor": "#f5f5f5",
        "borderRadius": 0
    }
}

For Section type:
{
    "props": {
        "backgroundColor": "#f5f5f5",
        "padding": 20,
        "margin": 0,
        "width": "100%",
        "height": "auto",
        "minHeight": 100,
        "borderRadius": 0,
        "shadow": "none",
        "alignment": "flex-start"
    }
}

Important Design Considerations:
1. Color Harmony:
   - Use colors that complement the parent component's color scheme
   - Maintain proper contrast for readability
   - Follow consistent color patterns throughout the layout

2. Spacing Hierarchy:
   - Consider parent padding when setting child component margins
   - Maintain consistent spacing ratios between components
   - Ensure proper nesting of elements

3. Visual Consistency:
   - Match border radius patterns with parent components
   - Use consistent elevation and shadow styles
   - Maintain alignment patterns

4. Responsive Behavior:
   - Consider parent container's max-width constraints
   - Use appropriate units for responsive design
   - Ensure layout adapts well at different breakpoints

Technical Rules:
- Container uses "background", others use "backgroundColor"
- Numbers should be without quotes (e.g., padding: 20)
- Strings must be in quotes (e.g., width: "100%")
- Colors must be in hex format (e.g., "#ffffff")
- Return ONLY the JSON object with no explanation or comments
- Properties must match exactly with the example for each type

Based on the layout type, requirements, and parent component specifications provided, return the appropriate JSON object that ensures visual harmony and proper integration.`;
    }

    private _generateDisplayName(layoutType: string): string {
        this.emitStatus('layout-processing', `Generating display name for layout type: ${layoutType}`);
        const displayName = `${layoutType.toLowerCase()}-${uuidv4().slice(0, 6)}`;
        this.emitStatus('layout-processing', `Generated display name: ${displayName}`);
        return displayName;
    }

    async processSingleLayout(layoutAiResponse: LayoutAIResponse, parentRequirements: ParentRequirements): Promise<Record<string, any>> {
        try {
            this.emitStatus('layout-processing', 'Starting to process single layout');

            const layoutId = uuidv4().slice(0, 10);
            const layoutType = layoutAiResponse.layout_type;
            const layoutRequirements = layoutAiResponse.layout_requirements;
            const basicElements = layoutAiResponse.basic_elements;

            this.emitStatus('layout-processing', `Processing layout type: ${layoutType} with ID: ${layoutId}`);
            this.emitStatus('layout-processing', `Number of basic elements to process: ${basicElements.length}`);

            // First process child components to get their definitions and IDs
            this.emitStatus('layout-processing', 'Processing basic elements for layout');
            const childComponents = await this.processBasicElements(basicElements, layoutRequirements, layoutId);

            // Extract child component IDs
            const childIds: string[] = [];
            const childDefinitions: Record<string, any> = {};
            for (const childComponent of childComponents) {
                for (const [componentId, componentDef] of Object.entries(childComponent)) {
                    childIds.push(componentId);
                    childDefinitions[componentId] = componentDef;
                }
            }
            this.emitStatus('layout-processing', `Processed ${childIds.length} child components`);

            // Include parent requirements in the generation process
            this.emitStatus('layout-processing', 'Generating layout definition with parent requirements');
            const generatedDefinition = await this.generateLayoutDefinition(
                layoutType,
                layoutRequirements,
                parentRequirements
            );

            // Create layout definition with child IDs in nodes
            this.emitStatus('layout-processing', 'Creating final layout definition');
            const layoutDefinition = {
                type: {
                    resolvedName: layoutType
                },
                isCanvas: true,
                props: generatedDefinition.props,
                displayName: this._generateDisplayName(layoutType),
                custom: {},
                parent: "ROOT",
                hidden: false,
                nodes: childIds,  // Add child IDs to nodes
                linkedNodes: {}
            };

            this.emitStatus('layout-processing', `Layout ${layoutId} processing completed with ${childIds.length} child components`);
            return {
                ...{ [layoutId]: layoutDefinition },
                ...childDefinitions  // Add child component definitions
            };

        } catch (error: any) {
            this.emitStatus('error', `Error processing layout: ${error.message}`);
            throw error;
        }
    }

    async generateLayoutDefinition(
        layoutType: string,
        layoutRequirements: string,
        parentRequirements: ParentRequirements
    ): Promise<{ props: Record<string, any> }> {
        this.emitStatus('layout-processing', `Generating layout definition for type: ${layoutType}`);

        // Create system message
        const systemMessage: CoreSystemMessage = {
            role: 'system',
            content: this.prompt
        };

        // Create user message
        const userMessage: CoreUserMessage = {
            role: 'user',
            content: `
        Generate layout properties for ${layoutType} with the following context:

        Layout Requirements:
        ${layoutRequirements}

        Parent Component Requirements:
        ${JSON.stringify(parentRequirements, null, 2)}

        Ensure the generated layout maintains visual harmony with the parent component
        while fulfilling its specific requirements.
        `,
            providerOptions: {
                anthropic: { cacheControl: { type: 'ephemeral' } }
            }
        };

        // Create message array
        const messages: CoreMessage[] = [systemMessage, userMessage];

        this.emitStatus('layout-processing', 'Sending request to Claude API for layout definition');

        const response = await this.llmClient.callClaudeAPI({
            statusPrefix: 'layout-processing',
            messages: messages
        });

        this.emitStatus('layout-processing', `Layout definition generated for type: ${layoutType}`);

        return JSON.parse(response.text);
    }

    async processBasicElements(
        basicElements: BasicElement[],
        parentRequirements: string,
        layoutId: string
    ): Promise<Array<Record<string, any>>> {
        this.emitStatus('layout-processing', `Processing ${basicElements.length} basic elements`);
        const childComponents: Array<Record<string, any>> = [];

        for (let index = 0; index < basicElements.length; index++) {
            const element = basicElements[index];
            const elementType = element.element_type;

            this.emitStatus('layout-processing', `Processing element ${index + 1} of ${basicElements.length}, type: ${elementType}`);

            if (elementType in this.tools) {
                const tool = this.tools[elementType];
                this.emitStatus('layout-processing', `Using ${elementType} generator tool`);

                const componentJson = await tool.generate(
                    element.element_requirements,
                    parentRequirements,
                    layoutId
                );

                childComponents.push(componentJson);
                this.emitStatus('layout-processing', `Successfully generated ${elementType} component`);
            } else {
                this.emitStatus('layout-processing', `Unsupported element type: ${elementType}, skipping`);
            }
        }

        this.emitStatus('layout-processing', `Completed processing ${childComponents.length} basic elements`);
        return childComponents;
    }

    async processLayouts(
        layouts: LayoutAIResponse[],
        parentComponentRequirements: ParentRequirements
    ): Promise<{ definition: Record<string, any>; layout_ids: string[] }> {
        this.emitStatus('layout-processing', `Starting to process ${layouts.length} layouts`);

        const combinedDefinition: Record<string, any> = {};
        const layoutIds: string[] = []; // Track only the main layout IDs

        // Sort layouts by index to maintain proper order
        const sortedLayouts = layouts.sort((a, b) => (a.index || 0) - (b.index || 0));
        this.emitStatus('layout-processing', 'Layouts sorted by index');

        for (let i = 0; i < sortedLayouts.length; i++) {
            this.emitStatus('layout-processing', `Processing layout ${i + 1} of ${sortedLayouts.length}`);

            const layoutDefinition = await this.processSingleLayout(sortedLayouts[i], parentComponentRequirements);

            if (layoutDefinition) {
                // Get the layout ID (first key) and its definition
                const layoutId = Object.keys(layoutDefinition)[0];
                layoutIds.push(layoutId); // Add only the layout ID to our tracking list

                // Update the combined definition with all components
                Object.assign(combinedDefinition, layoutDefinition);
                this.emitStatus('layout-processing', `Layout ${i + 1} processed and added to combined definition`);
            }
        }

        this.emitStatus('layout-processing', 'All layouts processed successfully');

        return {
            definition: combinedDefinition,
            layout_ids: layoutIds // Return both the full definition and just the layout IDs
        };
    }
}

export default LayoutGenerator;