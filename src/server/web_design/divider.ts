import BaseComponent from './basic_component';
import type { ParentRequirements } from '../types';

class DividerGenerator extends BaseComponent {
    get prompt(): string {
        return `You are an expert UI designer specialized in creating divider elements that harmonize with their parent components. Your task is to generate divider properties that work seamlessly with the parent component while maintaining visual consistency and proper spacing.

Given element requirements and parent component specifications, generate a JSON object for a divider that follows craft.js format:

{
    "props": {
        "width": number,
        "color": hex color string,
        "thickness": number,
        "style": "solid" | "dashed" | "dotted",
        "margin": number
    }
}

Important Design Considerations:
1. Visual Style:
   - Width should be appropriate for the container (typically 100 for full width)
   - Color should complement the parent component's color scheme
   - Thickness should be subtle but visible (typically 1-2px)
   - Style should match the overall design language

2. Spacing:
   - Margins should maintain proper vertical rhythm
   - Consider parent padding when determining margins
   - Ensure consistent spacing with other elements

3. Visual Harmony:
   - Match color with parent component's color scheme
   - Use appropriate opacity for subtle separation
   - Maintain consistent styling across similar contexts

Technical Rules:
- Numbers should be without quotes (e.g., width: 100)
- Colors must be in hex format with quotes (e.g., "#000000")
- Style must be one of: "solid", "dashed", "dotted"
- Return ONLY the JSON object with no explanation

Based on the provided requirements, generate appropriate divider properties that ensure visual harmony with the parent component.`;
    }

    async generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>> {
        try {
            this.emitStatus('component-generation', 'Generating divider component');

            const generatedProps = await this.callComponentAPI(
                elementRequirements,
                parentRequirements,
                'component-generation'
            );

            // Create the complete divider definition
            const dividerId = this._generateId();
            const dividerDefinition = {
                type: {
                    resolvedName: "Divider"
                },
                isCanvas: false,
                props: generatedProps.props,
                displayName: this._generateDisplayName('divider'),
                custom: {},
                parent: parentId,
                hidden: false,
                nodes: [],
                linkedNodes: {}
            };

            this.emitStatus('component-generated', `Divider component generated with ID: ${dividerId}`);

            return { [dividerId]: dividerDefinition };
        } catch (error: any) {
            this.emitStatus('error', `Error generating divider: ${error.message}`);
            throw error;
        }
    }
}

export default DividerGenerator;