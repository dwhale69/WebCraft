import { type Connection, routeAgentRequest } from "agents";
import LayoutDesign from "./layout_design";
import {type R2Bucket} from "@cloudflare/workers-types"

type Env = {
    ANTHROPIC_API_KEY: string;
    R2_BUCKET: R2Bucket; // Add R2 storage type
    R2_ENDPOINT_URL: string; // Add R2 endpoint URL environment variable
};

export { LayoutDesign };

// Function to sanitize filename
function sanitizeFilename(filename: string): string {
    if (!filename) return 'image';

    // Remove path information if present
    const base = filename.split(/[\\/]/).pop() || '';

    // Replace spaces with underscores and remove special characters
    return base
        .replace(/[^\w\-\.]/g, '_') // Replace non-alphanumeric chars (except dashes, underscores, dots)
        .replace(/_{2,}/g, '_')     // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '')    // Remove leading/trailing underscores
        .toLowerCase();             // Convert to lowercase for consistency
}


// Function to handle image upload requests
async function handleImageUpload(request: Request, env: Env): Promise<Response> {
    const r2 = env.R2_BUCKET;

    try {
        // Check if this is a multipart form data request (file upload)

        const formData = await request.formData();
        const file = formData.get('file');

            if (!file || !(file instanceof File)) {
                return new Response(JSON.stringify({
                    success: false,
                    message: "No file provided"
                }), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    status: 400
                });
            }

            // Process the uploaded file
            const originalFilename = file.name || 'uploaded_image.jpg';
            const safeFilename = sanitizeFilename(originalFilename);
            const fileType = file.type || 'image/jpeg';

            // Generate unique filename
            const uniqueFilename = `${safeFilename}`;

            // Get file data as ArrayBuffer and create Blob
            const fileArrayBuffer = await file.arrayBuffer();
            const blob = new Blob([fileArrayBuffer], { type: fileType });

            // Upload to R2
            await r2.put(uniqueFilename, blob, {
                httpMetadata: {
                    contentType: fileType
                }
            });

            const imageUrl = `${env.R2_ENDPOINT_URL}/${uniqueFilename}`;

            // Return success with the URL
            return new Response(JSON.stringify({
                success: true,
                url: imageUrl
            }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        } catch (error: any) {
        console.error("Error in upload handler:", error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            status: 500
        });
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);

        // Handle image upload route
        if (url.pathname === '/api/upload') {


            // Only allow POST method
            if (request.method !== 'POST') {
                return new Response(`Method ${request.method} Not Allowed`, {
                    headers: {
                        'Allow': 'POST'
                    },
                    status: 405
                });
            }

            return handleImageUpload(request, env);
        }

        // Route agent request or return 404
        return (
            await routeAgentRequest(request, env) ||
            new Response("Not found", { status: 404 })
        );
    },
} satisfies ExportedHandler<Env>;