import BaseComponent from './basic_component';
import type { ParentRequirements } from '../types';

class TextGenerator extends BaseComponent {
    get prompt(): string {
        return `You are an expert UI designer specialized in creating text elements that harmonize with their parent components. Your task is to generate text properties that work seamlessly with the parent component while maintaining visual consistency and proper spacing.

Given element requirements and parent component specifications, generate a JSON object for a text element that follows craft.js format:

{
    "props": {
        "text": string,
        "fontSize": number,
        "color": hex color string,
        "textAlign": "left" | "center" | "right",
        "fontWeight": "normal" | "bold" | "500" | "600",
        "margin": number
    }
}

Important Design Considerations:
1. Typography:
   - Font size should be appropriate for content importance (typically 14-16px for regular text)
   - Font weight should be appropriate for emphasis level
   - Ensure text is readable against its background

2. Color Harmony:
   - Text color should have sufficient contrast with parent background
   - Follow consistent color patterns from parent
   - Maintain WCAG color contrast guidelines

3. Spacing:
   - Margins should follow parent component's rhythm
   - Consider surrounding elements' spacing
   - Maintain consistent spacing patterns

4. Alignment:
   - Text alignment should respect parent container layout
   - Consider content length and purpose
   - Maintain consistent alignment patterns

Technical Rules:
- Numbers should be without quotes (e.g., fontSize: 16)
- Colors must be in hex format with quotes (e.g., "#000000")
- Text alignment values must be in quotes
- Font weight can be either string (e.g., "normal", "bold") or number (e.g., 400, 500)
- Return ONLY the JSON object with no explanation
- Maintain consistent spacing with parent elements

Based on the provided requirements, generate appropriate text properties that ensure visual harmony with the parent component.`;
    }

    async generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>> {
        try {
            this.emitStatus('component-generation', 'Generating text component');

            const generatedProps = await this.callComponentAPI(
                elementRequirements,
                parentRequirements,
                'component-generation'
            );

            // Create the complete text definition
            const textId = this._generateId();
            const textDefinition = {
                type: {
                    resolvedName: "Text"
                },
                isCanvas: false,
                props: generatedProps.props,
                displayName: this._generateDisplayName('text'),
                custom: {},
                parent: parentId,
                hidden: false,
                nodes: [],
                linkedNodes: {}
            };

            this.emitStatus('component-generated', `Text component generated with ID: ${textId}`);

            return { [textId]: textDefinition };
        } catch (error: any) {
            this.emitStatus('error', `Error generating text: ${error.message}`);
            throw error;
        }
    }
}

export default TextGenerator;