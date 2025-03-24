import BaseComponent from './basic_component';
import type { ParentRequirements } from '../types';

class ImageGenerator extends BaseComponent {
    get prompt(): string {
        return `You are an expert UI designer specialized in creating image elements that harmonize with their parent components. Your task is to generate image properties that work seamlessly with the parent component while maintaining visual consistency and proper spacing.

Given element requirements and parent component specifications, generate a JSON object for an image that follows craft.js format:

{
    "props": {
        "src": string (URL or placeholder path),
        "alt": string,
        "width": number,
        "height": number,
        "borderRadius": number,
        "margin": number
    }
}

Important Design Considerations:
1. Image Dimensions:
   - Width and height should be appropriate for content and context
   - Maintain aspect ratio when possible
   - Consider parent container constraints
   - Default to 320x240 if not specified

2. Visual Integration:
   - Border radius should match parent component style
   - Margins should maintain proper spacing with siblings
   - Consider parent padding when setting margins

3. Accessibility:
   - Alt text must be descriptive and meaningful
   - Follow web accessibility guidelines
   - Ensure proper text alternatives

Technical Rules:
- Numbers should be without quotes (e.g., width: 320)
- Strings must be in quotes (e.g., "src": "/api/placeholder/400/300")
- Return ONLY the JSON object with no explanation
- Alt text must be informative and contextual
- Use appropriate dimensions based on context

Based on the provided requirements, generate appropriate image properties that ensure visual harmony with the parent component.`;
    }

    _generatePlaceholderUrl(width = 320, height = 240): string {
        return `/api/placeholder/${width}/${height}`;
    }

    async generate(
        elementRequirements: string,
        parentRequirements: ParentRequirements,
        parentId: string
    ): Promise<Record<string, any>> {
        try {
            this.emitStatus('component-generation', 'Generating image component');

            const generatedProps = await this.callComponentAPI(
                elementRequirements,
                parentRequirements,
                'component-generation'
            );

            // Create the complete image definition
            const imageId = this._generateId();
            const imageDefinition = {
                type: {
                    resolvedName: "Image"
                },
                isCanvas: false,
                props: generatedProps.props,
                displayName: this._generateDisplayName('image'),
                custom: {},
                parent: parentId,
                hidden: false,
                nodes: [],
                linkedNodes: {}
            };

            this.emitStatus('component-generated', `Image component generated with ID: ${imageId}`);

            return { [imageId]: imageDefinition };
        } catch (error: any) {
            this.emitStatus('error', `Error generating image: ${error.message}`);
            throw error;
        }
    }
}

export default ImageGenerator;