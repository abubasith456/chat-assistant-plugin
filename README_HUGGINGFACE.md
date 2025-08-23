---
title: Chat Assistant Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Chat Assistant Backend

A FastAPI-based WebSocket chat server with Nvidia OpenAI LLM integration.

## Features

- Real-time WebSocket chat
- Nvidia OpenAI API integration
- CORS enabled for frontend connections
- Health check endpoints
- Docker containerized

## Environment Variables

Set these in your Hugging Face Space settings:

- `NVIDIA_API_KEY`: Your Nvidia API key
- `NVIDIA_BASE_URL`: API base URL (default: https://integrate.api.nvidia.com/v1)
- `NVIDIA_MODEL`: Model name (default: nvidia/llama-3.1-nemotron-70b-instruct)
- `MODEL_TEMPERATURE`: Response creativity (default: 0.7)
- `MODEL_MAX_TOKENS`: Max response length (default: 1024)
- `MODEL_TOP_P`: Nucleus sampling parameter (default: 1.0)

## API Endpoints

- `GET /`: API information
- `GET /health`: Health check
- `GET /status`: Server status and configuration
- `WebSocket /ws/{client_id}`: Chat WebSocket endpoint

## Usage

Connect to the WebSocket endpoint at `/ws/your_client_id` and send JSON messages:

```json
{
  "message": "Hello, how can you help me?"
}
```

The server will respond with typing indicators and AI responses.
