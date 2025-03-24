# Web 设计 AI 代理

一个由 AI 驱动的网页设计代理，能够动态生成网页并为每个组件提供实时交互式编辑功能。

## 演示
<a href="https://www.youtube.com/watch?v=RVpkhKiDSg4" target="_blank">
  查看演示
</a>

## 安装

### 依赖

- Cloudflare 账户（用于 R2 存储和部署）
- Anthropic API 密钥（用于访问 Claude AI 模型）

### 设置说明

1. **安装依赖**

   ```bash
   npm install
   ```

2. **配置 Cloudflare R2**

   修改 `wrangler.toml` 以绑定您的 Cloudflare R2 存储桶：

   ```toml
   [[r2_buckets]]
   binding = "R2_BUCKET"
   bucket_name = "your-bucket-name"
   ```

3. **配置环境变量**

   更新 `wrangler.toml` 中的变量：

   ```toml
   [vars]
   ANTHROPIC_API_KEY = "your-anthropic-api-key"
   R2_ENDPOINT_URL = "https://your-r2-custom-domain.com"
   ```

   **重要提示**：确保您的 `R2_ENDPOINT_URL` 允许跨源访问（CORS）。这一点至关重要，因为生成的网页将需要从此端点访问图像。如果没有正确配置 CORS，图像将无法正确显示。

## 运行应用

### 本地开发

要在本地运行应用：

```bash
npm start
```

这将启动开发服务器，并启用热重载功能。

### 部署

要将应用部署到 Cloudflare：

```bash
npm run deploy
```

此命令将在一个步骤中构建应用并将其部署到 Cloudflare。

## 主要功能

### AI 驱动的网页设计

本项目利用先进的 AI 代理技术动态生成网页。主要功能包括：

1. **动态网页生成**：基于用户需求，AI 驱动创建响应式网页布局

2. **实时组件编辑**：每个 UI 组件都可以在浏览器中进行交互式编辑

3. **WebSocket 实时状态更新**：在设计生成过程中提供即时反馈

4. **基于 Cloudflare 的架构**：构建在 Cloudflare 的基础设施上，以确保可靠性和性能
