"""
WebSocket Message Handlers
Handles different types of WebSocket messages and responses
"""

import json
import logging
from datetime import datetime
from typing import List, Dict, Optional
from services.websocket.connection_manager import ConnectionManager
from services.agent_service import AgentService

logger = logging.getLogger(__name__)


class WebSocketHandler:
    def __init__(self, connection_manager: ConnectionManager, agent_service: AgentService):
        self.manager = connection_manager
        self.agent_service = agent_service
        self.conversation_histories: Dict[str, List[dict]] = {}

    async def handle_message(self, websocket, client_id: str, raw_message: str):
        """Handle incoming WebSocket message"""
        try:
            message_data = json.loads(raw_message)
            user_message = message_data.get("message", "")

            if not user_message.strip():
                return

            # Get client metadata (including timezone)
            client_metadata = self.manager.get_client_metadata(client_id)
            client_timezone = client_metadata.get('timezone', 'UTC')
            
            logger.info(f"Received from {client_id}: {user_message} (timezone: {client_timezone})")

            # Initialize conversation history if not exists
            if client_id not in self.conversation_histories:
                self.conversation_histories[client_id] = []

            # Echo user message back (optional, for UI confirmation)
            await self._send_user_message_confirmation(client_id, user_message)

            # Add to conversation history
            self.conversation_histories[client_id].append({
                "role": "user", 
                "content": user_message
            })

            # Send typing indicator
            await self._send_typing_indicator(client_id)

            # Get AI response with client's timezone context
            ai_response = await self._get_ai_response(
                user_message, 
                self.conversation_histories[client_id],
                client_timezone,
                client_metadata
            )

            # Add AI response to conversation history
            self.conversation_histories[client_id].append({
                "role": "assistant", 
                "content": ai_response
            })

            # Send AI response
            await self._send_ai_response(client_id, ai_response)

        except json.JSONDecodeError:
            await self._send_error_message(client_id, "Invalid message format. Please send valid JSON.")
        except Exception as e:
            logger.error(f"Error handling message from {client_id}: {str(e)}")
            await self._send_error_message(client_id, f"Sorry, I encountered an error: {str(e)}")

    async def _send_user_message_confirmation(self, client_id: str, message: str):
        """Send user message confirmation back to client"""
        user_msg = {
            "type": "user",
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "sender": "user",
        }
        await self.manager.send_personal_message(user_msg, client_id)

    async def _send_typing_indicator(self, client_id: str):
        """Send typing indicator to client"""
        typing_msg = {
            "type": "typing",
            "message": "Assistant is typing...",
            "timestamp": datetime.now().isoformat(),
            "sender": "assistant",
        }
        await self.manager.send_personal_message(typing_msg, client_id)

    async def _get_ai_response(self, message: str, conversation_history: List[dict], 
                              timezone: str, metadata: dict) -> str:
        """Get AI response using agent service with client context"""
        try:
            response = self.agent_service.run(
                user_message=message,
                conversation_history=conversation_history,
                client_timezone=timezone
            )
            return response
        except Exception as e:
            logger.error(f"Agent service error: {str(e)}")
            return f"Sorry, I encountered an error: {str(e)}"

    async def _send_ai_response(self, client_id: str, response: str):
        """Send AI response to client"""
        ai_msg = {
            "type": "assistant",
            "message": response,
            "timestamp": datetime.now().isoformat(),
            "sender": "assistant",
        }
        await self.manager.send_personal_message(ai_msg, client_id)

    async def _send_error_message(self, client_id: str, error_message: str):
        """Send error message to client"""
        error_msg = {
            "type": "error",
            "message": error_message,
            "timestamp": datetime.now().isoformat(),
            "sender": "system",
        }
        await self.manager.send_personal_message(error_msg, client_id)

    def cleanup_client_history(self, client_id: str):
        """Clean up conversation history for disconnected client"""
        if client_id in self.conversation_histories:
            del self.conversation_histories[client_id]
            logger.info(f"Cleaned up conversation history for {client_id}")

    def get_conversation_stats(self) -> dict:
        """Get conversation statistics"""
        return {
            'active_conversations': len(self.conversation_histories),
            'total_messages': sum(len(history) for history in self.conversation_histories.values())
        }
