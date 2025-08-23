from typing import Optional
from app_config import app_config


class PromptService:
    def __init__(self, system_prompt: Optional[str] = None):
        self.system_prompt = system_prompt or app_config.system_prompt

    def get_system_prompt(self) -> str:
        return self.system_prompt

    def set_system_prompt(self, prompt: str):
        self.system_prompt = prompt


prompt_service = PromptService()
