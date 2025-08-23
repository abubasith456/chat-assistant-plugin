from app_config import app_config
from services.prompt_service import prompt_service
from services.tools_service import tool_service

from haystack.utils import Secret
from haystack.components.agents import Agent
from haystack.dataclasses import ChatMessage
from haystack.components.generators.chat import OpenAIChatGenerator


class AgentService:
    def __init__(
        self, api_base_url: str = "", api_key: str = "", model: str = ""
    ):
        if not app_config.api_key:
            raise ValueError("API_KEY environment variable is not set.")
        self.api_key = Secret.from_token(api_key or app_config.api_key)
        self.api_base_url = api_base_url or app_config.base_url
        self.model = model or app_config.model
        self.agent = Agent(
            chat_generator=OpenAIChatGenerator(
                api_base_url=self.api_base_url, 
                api_key=self.api_key, 
                model=self.model
            ),
            system_prompt=prompt_service.get_system_prompt(),
            tools=tool_service.get_tools(),
        )

    def run(self, user_message: str, conversation_history: list = None, client_timezone: str = "UTC") -> str:
        # Set client timezone for tools
        tool_service.set_client_timezone(client_timezone)
        
        messages = []
        
        if conversation_history:
            for msg in conversation_history[-10:]:
                if msg.get("role") == "user":
                    messages.append(ChatMessage.from_user(msg["content"]))
                elif msg.get("role") == "assistant":
                    messages.append(ChatMessage.from_assistant(msg["content"]))
        
        messages.append(ChatMessage.from_user(user_message))
        result = self.agent.run(messages=messages)
        return result["messages"][-1].text
