from app_config import app_config
from services.prompt_service import prompt_service
from services.tools_service import tool_service
from services.project_service import project_service, AgentConfig

from haystack.utils import Secret
from haystack.components.agents import Agent
from haystack.dataclasses import ChatMessage
from haystack.components.generators.chat import OpenAIChatGenerator
from typing import Optional


class AgentService:
    def __init__(
        self, api_base_url: str = "", api_key: str = "", model: str = ""
    ):
        if not app_config.api_key:
            raise ValueError("API_KEY environment variable is not set.")
        self.api_key = Secret.from_token(api_key or app_config.api_key)
        self.api_base_url = api_base_url or app_config.base_url
        self.model = model or app_config.model
        # We'll create the agent dynamically based on project config
        self._default_agent = None

    def _get_or_create_agent(self, project_config: Optional[AgentConfig] = None) -> Agent:
        """Get or create an agent based on project configuration"""
        if project_config:
            # Use project-specific configuration
            model = project_config.llm_model or self.model
            system_prompt = project_config.system_prompt or prompt_service.get_system_prompt()
            
            return Agent(
                chat_generator=OpenAIChatGenerator(
                    api_base_url=self.api_base_url,
                    api_key=self.api_key,
                    model=model,
                    generation_kwargs={
                        "temperature": project_config.temperature,
                        "max_tokens": project_config.max_tokens,
                        "top_p": project_config.top_p,
                    }
                ),
                system_prompt=system_prompt,
                tools=tool_service.get_tools(),
            )
        else:
            # Use default configuration
            if not self._default_agent:
                self._default_agent = Agent(
                    chat_generator=OpenAIChatGenerator(
                        api_base_url=self.api_base_url, 
                        api_key=self.api_key, 
                        model=self.model
                    ),
                    system_prompt=prompt_service.get_system_prompt(),
                    tools=tool_service.get_tools(),
                )
            return self._default_agent

    def run(self, user_message: str, conversation_history: list = None, 
            client_timezone: str = "UTC", project_id: Optional[str] = None) -> str:
        # Set client timezone for tools
        tool_service.set_client_timezone(client_timezone)
        
        # Get project configuration if project_id is provided
        project_config = None
        if project_id:
            project_config = project_service.get_project_config(project_id)
        
        # Get the appropriate agent
        agent = self._get_or_create_agent(project_config)
        
        messages = []
        
        if conversation_history:
            for msg in conversation_history[-10:]:
                if msg.get("role") == "user":
                    messages.append(ChatMessage.from_user(msg["content"]))
                elif msg.get("role") == "assistant":
                    messages.append(ChatMessage.from_assistant(msg["content"]))
        
        messages.append(ChatMessage.from_user(user_message))
        result = agent.run(messages=messages)
        return result["messages"][-1].text

    def get_welcome_message(self, project_id: Optional[str] = None) -> str:
        """Get welcome message for a project"""
        if project_id:
            return project_service.get_welcome_message(project_id)
        return "Hello! How can I help you today?"
