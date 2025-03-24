import BaseComponent from './basic_component';
import type { ParentRequirements } from '../types';

class HeadingGenerator extends BaseComponent {
    get prompt(): string {
        return `You are an expert UI designer specialized in creating heading elements that harmonize with their parent components. Your task is to generate heading properties that work seamlessly with the parent component while maintaining visual consistency and proper spacing.

Given element requirements and parent component specifications, generate a JSON object for a heading that follows craft.js format:

{
    "props": {
        "text": string,
        "fontSize": number,
        "color": hex color string,
        "textAlign": "left" | "center" | "right",
        "level": number (1-6),
        "margin": number,
        "fontWeight": number (400-900),
        "lineHeight": number
    }
}

Important Design Considerations:
1. Typography Hierarchy:
   - Font size should reflect heading level importance (h1: 40px, h2: 32px, h3: 28px, h4: 24px, h5: 20px, h6: 16px)
   - Font weight should emphasize heading hierarchy (h1-h2: 600, h3-h6: 500)
   - Line height should ensure proper readability (1.2 to 1.45)

2. Color Harmony:
   - Text color should have sufficient contrast with parent background
   - Follow consistent color patterns from parent

3. Spacing:
   - Margins should maintain proper vertical rhythm
   - Consider parent padding when determining margins

4. Alignment:
   - Text alignment should respect parent container layout
   - Consider the overall page composition

Technical Rules:
- Numbers should be without quotes (e.g., fontSize: 32)
- Colors must be in hex format with quotes (e.g., "#000000")
- Text alignment values must be in quotes
- Return ONLY the JSON object with no explanation

Based on the provided requirements, generate appropriate heading properties that ensure visual harmony with the parent component.`;
    }

    async generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>> {
        try {
            this.emitStatus('component-generation', 'Generating heading component');

            const generatedProps = await this.callComponentAPI(
                elementRequirements,
                parentRequirements,
                'component-generation'
            );

            // Create the complete heading definition
            const headingId = this._generateId();
            const headingDefinition = {
                type: {
                    resolvedName: "Heading"
                },
                isCanvas: false,
                props: generatedProps.props,
                displayName: this._generateDisplayName('heading'),
                custom: {},
                parent: parentId,
                hidden: false,
                nodes: [],
                linkedNodes: {}
            };

            this.emitStatus('component-generated', `Heading component generated with ID: ${headingId}`);

            return { [headingId]: headingDefinition };
        } catch (error: any) {
            this.emitStatus('error', `Error generating heading: ${error.message}`);
            throw error;
        }
    }
}

export default HeadingGenerator;