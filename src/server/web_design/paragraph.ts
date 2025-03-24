import BaseComponent from './basic_component';
import type { ParentRequirements } from '../types';

class ParagraphGenerator extends BaseComponent {
    get prompt(): string {
        return `You are an expert UI designer specialized in creating paragraph elements that harmonize with their parent components. Your task is to generate paragraph properties that work seamlessly with the parent component while maintaining visual consistency and proper spacing.

Given element requirements and parent component specifications, generate a JSON object for a paragraph that follows craft.js format:

{
    "props": {
        "text": string,
        "fontSize": number,
        "color": hex color string,
        "textAlign": "left" | "center" | "right",
        "lineHeight": number,
        "margin": number,
        "maxWidth": string
    }
}

Important Design Considerations:
1. Typography:
   - Font size should be readable (typically 14-18px)
   - Line height should ensure comfortable reading (typically 1.5-1.8)
   - Max width should optimize readability (65-75 characters per line)

2. Color Harmony:
   - Text color should have sufficient contrast with parent background
   - Follow consistent color patterns from parent
   - Ensure readability in different lighting conditions

3. Spacing:
   - Margins should create proper vertical rhythm
   - Consider parent padding when determining margins
   - Ensure proper spacing between paragraphs

4. Alignment:
   - Text alignment should respect parent container layout
   - Left alignment is typically best for readability
   - Consider content length and context

Technical Rules:
- Numbers should be without quotes (e.g., fontSize: 16)
- Colors must be in hex format with quotes (e.g., "#000000")
- Text alignment values must be in quotes
- maxWidth should use "ch" units (e.g., "75ch")
- Return ONLY the JSON object with no explanation

Based on the provided requirements, generate appropriate paragraph properties that ensure visual harmony with the parent component while maximizing readability.`;
    }

    async generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>> {
        try {
            this.emitStatus('component-generation', 'Generating paragraph component');

            const generatedProps = await this.callComponentAPI(
                elementRequirements,
                parentRequirements,
                'component-generation'
            );

            // Create the complete paragraph definition
            const paragraphId = this._generateId();
            const paragraphDefinition = {
                type: {
                    resolvedName: "Paragraph"
                },
                isCanvas: false,
                props: generatedProps.props,
                displayName: this._generateDisplayName('paragraph'),
                custom: {},
                parent: parentId,
                hidden: false,
                nodes: [],
                linkedNodes: {}
            };

            this.emitStatus('component-generated', `Paragraph component generated with ID: ${paragraphId}`);

            return { [paragraphId]: paragraphDefinition };
        } catch (error: any) {
            this.emitStatus('error', `Error generating paragraph: ${error.message}`);
            throw error;
        }
    }
}

export default ParagraphGenerator;