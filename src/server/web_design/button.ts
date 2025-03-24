import BaseComponent from './basic_component';
import type { ParentRequirements } from '../types';

class UserButtonGenerator extends BaseComponent {
    get prompt(): string {
        return `You are an expert UI designer specialized in creating button elements that harmonize with their parent components. Your task is to generate button properties that work seamlessly with the parent component while maintaining visual consistency and proper spacing.

Given element requirements and parent component specifications, generate a JSON object for a button that follows craft.js format:

{
    "props": {
        "text": string,
        "size": "small" | "medium" | "large",
        "variant": "text" | "contained" | "outlined",
        "color": "primary" | "secondary" | "error" | "warning" | "info" | "success",
        "fullWidth": boolean,
        "margin": number
    }
}

Important Design Considerations:
1. Button Appearance:
   - Size should be appropriate for importance and context (medium is default)
   - Variant should match the interaction significance
   - Color should follow the application's color scheme

2. Visual Hierarchy:
   - Primary actions should use contained variant
   - Secondary actions should use outlined or text variants
   - Error/Warning actions should use appropriate color schemes

3. Spacing:
   - Margins should consider surrounding elements
   - Full width should be used thoughtfully for mobile or special layouts
   - Maintain consistent spacing with other elements

4. Interaction Design:
   - Primary buttons should stand out visually
   - Warning/Error buttons should be clearly distinguishable
   - Maintain consistent button patterns across the interface

Technical Rules:
- Text must be in quotes (e.g., "Click Me")
- Size must be one of: "small", "medium", "large"
- Variant must be one of: "text", "contained", "outlined"
- Color must be one of: "primary", "secondary", "error", "warning", "info", "success"
- fullWidth must be boolean without quotes (true or false)
- margin must be a number without quotes
- Return ONLY the JSON object with no explanation

Based on the provided requirements, generate appropriate button properties that ensure visual harmony with the parent component.`;
    }

    async generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>> {
        try {
            this.emitStatus('component-generation', 'Generating button component');

            const generatedProps = await this.callComponentAPI(
                elementRequirements,
                parentRequirements,
                'component-generation'
            );

            // Create the complete button definition
            const buttonId = this._generateId();
            const buttonDefinition = {
                type: {
                    resolvedName: "UserButton"
                },
                isCanvas: false,
                props: generatedProps.props,
                displayName: this._generateDisplayName('button'),
                custom: {},
                parent: parentId,
                hidden: false,
                nodes: [],
                linkedNodes: {}
            };

            this.emitStatus('component-generated', `Button component generated with ID: ${buttonId}`);

            return { [buttonId]: buttonDefinition };
        } catch (error: any) {
            this.emitStatus('error', `Error generating button: ${error.message}`);
            throw error;
        }
    }
}

export default UserButtonGenerator;