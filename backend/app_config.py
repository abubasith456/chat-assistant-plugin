import os
from dotenv import load_dotenv

load_dotenv()


class AppConfig:
    def __init__(self):
        # Try both API_KEY and NVIDIA_API_KEY for compatibility
        self.api_key = os.getenv("API_KEY") or os.getenv("NVIDIA_API_KEY")
        self.base_url = os.getenv("BASE_URL") or os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.model = os.getenv("MODEL") or os.getenv("NVIDIA_MODEL", "nvidia/llama-3.1-nemotron-70b-instruct")
        self.model_temperature = float(os.getenv("MODEL_TEMPERATURE", "0.7"))
        self.model_max_tokens = int(os.getenv("MODEL_MAX_TOKENS", "1024"))
        self.model_top_p = float(os.getenv("MODEL_TOP_P", "1.0"))
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8000"))
        self.cors_origins = os.getenv(
            "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
        ).split(",")
        self.system_prompt = os.getenv(
            "SYSTEM_PROMPT",
            "You are a helpful and friendly AI assistant. Keep your responses conversational, concise, and natural. Avoid using markdown formatting like **bold** or *italic*. Respond in a warm, human-like way as if you're having a casual conversation.",
        )

    def as_dict(self):
        return {
            "nvidia_api_key": self.api_key,
            "nvidia_base_url": self.base_url,
            "nvidia_model": self.model,
            "model_temperature": self.model_temperature,
            "model_max_tokens": self.model_max_tokens,
            "model_top_p": self.model_top_p,
            "host": self.host,
            "port": self.port,
            "cors_origins": self.cors_origins,
            "system_prompt": self.system_prompt,
        }


app_config = AppConfig()
