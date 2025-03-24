# Web Design AI Agent

An AI-powered web design agent that dynamically generates web pages and provides real-time interactive editing capabilities for each component.

## Installation

### Prerequisites

- Cloudflare account (for R2 storage and deployment)
- Anthropic API key (for Claude AI model access)

### Setup Instructions

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Cloudflare R2**

   Modify `wrangler.toml` to bind your Cloudflare R2 bucket:

   ```toml
   [[r2_buckets]]
   binding = "R2_BUCKET"
   bucket_name = "your-bucket-name"
   ```

3. **Configure Environment Variables**

   Update the variables in `wrangler.toml`:

   ```toml
   [vars]
   ANTHROPIC_API_KEY = "your-anthropic-api-key"
   R2_ENDPOINT_URL = "https://your-r2-custom-domain.com"
   ```

   **IMPORTANT**: Ensure your `R2_ENDPOINT_URL` allows cross-origin access (CORS). This is critical as the generated web pages will need to access images from this endpoint. Without proper CORS configuration, the images won't display correctly.

## Running the Application

### Local Development

To run the application locally:

```bash
npm start
```

This will start the development server with hot reloading enabled.

### Deployment

To deploy the application to Cloudflare:

```bash
npm run deploy
```

This command builds the application and deploys it to Cloudflare in one step.

## Key Features

### AI-Powered Web Design

This project utilizes advanced AI agent technology to dynamically generate web pages. Key features include:

1. **Dynamic Web Page Generation**: AI-powered creation of responsive web layouts based on user requirements

2. **Real-time Component Editing**: Each UI component can be edited interactively in the browser

3. **WebSocket Real-time Status Updates**: Provides immediate feedback during the design generation process

4. **Cloudflare-based Architecture**: Built on Cloudflare's infrastructure for reliability and performance


## Technology Stack
- React for the frontend UI
- Craft.js for the component editing system
- Anthropic Claude AI model for intelligent design generation
- Cloudflare Workers for serverless deployment
- Cloudflare R2 for asset storage