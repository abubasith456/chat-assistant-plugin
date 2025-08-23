"""
WebSocket Connection Manager Service
Handles WebSocket connections, client management, and timezone detection
"""

import json
import logging
from typing import Dict
from fastapi import WebSocket
from datetime import datetime
import re

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_timezones: Dict[str, str] = {}  # Store client timezone info
        self.client_metadata: Dict[str, dict] = {}  # Store additional client info

    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept WebSocket connection and extract client information"""
        await websocket.accept()

        # Close existing connection for this client if it exists
        if client_id in self.active_connections:
            try:
                old_ws = self.active_connections[client_id]
                if old_ws.client_state != "DISCONNECTED":
                    await old_ws.close()
            except Exception as e:
                logger.warning(f"Error closing old connection for {client_id}: {e}")

        self.active_connections[client_id] = websocket
        
        # Extract timezone and other metadata from headers
        await self._extract_client_metadata(websocket, client_id)
        
        logger.info(
            f"Client {client_id} connected. Total connections: {len(self.active_connections)}"
        )

    async def _extract_client_metadata(self, websocket: WebSocket, client_id: str):
        """Extract client metadata from WebSocket headers and cookies"""
        try:
            headers = dict(websocket.headers)
            
            # Initialize metadata
            metadata = {
                'user_agent': headers.get('user-agent', ''),
                'accept_language': headers.get('accept-language', ''),
                'origin': headers.get('origin', ''),
                'timezone': 'UTC',  # Default timezone
                'country': None,
                'language': 'en'
            }
            
            # Extract timezone from Accept-Language header or other sources
            timezone = self._detect_timezone_from_headers(headers)
            metadata['timezone'] = timezone
            
            # Extract language preference
            language = self._detect_language_from_headers(headers)
            metadata['language'] = language
            
            # Store metadata
            self.client_metadata[client_id] = metadata
            self.client_timezones[client_id] = timezone
            
            logger.info(f"Client {client_id} metadata: timezone={timezone}, language={language}")
            
        except Exception as e:
            logger.warning(f"Error extracting client metadata for {client_id}: {e}")
            # Set defaults
            self.client_timezones[client_id] = 'UTC'
            self.client_metadata[client_id] = {'timezone': 'UTC', 'language': 'en'}

    def _detect_timezone_from_headers(self, headers: dict) -> str:
        """Detect timezone from various header sources"""
        
        # Method 1: Check for custom timezone header (if frontend sets it)
        timezone_header = headers.get('x-timezone', '')
        if timezone_header:
            return timezone_header
            
        # Method 2: Parse Accept-Language for region hints
        accept_language = headers.get('accept-language', '')
        if accept_language:
            # Extract region codes and map to likely timezones
            timezone = self._guess_timezone_from_language(accept_language)
            if timezone:
                return timezone
        
        # Method 3: Check User-Agent for mobile/regional indicators
        user_agent = headers.get('user-agent', '')
        if user_agent:
            timezone = self._guess_timezone_from_user_agent(user_agent)
            if timezone:
                return timezone
                
        # Default to UTC if no timezone detected
        return 'UTC'

    def _guess_timezone_from_language(self, accept_language: str) -> str:
        """Guess timezone based on language/region codes"""
        # Common language-region to timezone mappings
        timezone_map = {
            'en-US': 'America/New_York',
            'en-GB': 'Europe/London', 
            'en-AU': 'Australia/Sydney',
            'en-CA': 'America/Toronto',
            'de-DE': 'Europe/Berlin',
            'fr-FR': 'Europe/Paris',
            'es-ES': 'Europe/Madrid',
            'it-IT': 'Europe/Rome',
            'ja-JP': 'Asia/Tokyo',
            'ko-KR': 'Asia/Seoul',
            'zh-CN': 'Asia/Shanghai',
            'zh-TW': 'Asia/Taipei',
            'pt-BR': 'America/Sao_Paulo',
            'ru-RU': 'Europe/Moscow',
            'ar-SA': 'Asia/Riyadh',
            'hi-IN': 'Asia/Kolkata',
            'th-TH': 'Asia/Bangkok',
            'vi-VN': 'Asia/Ho_Chi_Minh'
        }
        
        # Parse accept-language header
        languages = accept_language.lower().split(',')
        for lang in languages:
            lang_code = lang.strip().split(';')[0]  # Remove quality values
            if lang_code in timezone_map:
                return timezone_map[lang_code]
                
            # Try just the language part (e.g., 'en' from 'en-US')
            base_lang = lang_code.split('-')[0]
            if base_lang == 'en':
                return 'America/New_York'  # Default English to US Eastern
            elif base_lang == 'es':
                return 'Europe/Madrid'  # Default Spanish to Spain
            elif base_lang == 'de':
                return 'Europe/Berlin'
            # Add more base language mappings as needed
                
        return None

    def _guess_timezone_from_user_agent(self, user_agent: str) -> str:
        """Guess timezone from User-Agent string"""
        user_agent_lower = user_agent.lower()
        
        # Mobile OS timezone hints
        if 'android' in user_agent_lower:
            return 'America/New_York'  # Default for Android
        elif 'iphone' in user_agent_lower or 'ipad' in user_agent_lower:
            return 'America/New_York'  # Default for iOS
            
        return None

    def disconnect(self, client_id: str):
        """Disconnect client and clean up resources"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.client_timezones:
            del self.client_timezones[client_id]
        if client_id in self.client_metadata:
            del self.client_metadata[client_id]
        logger.info(
            f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}"
        )

    def get_client_timezone(self, client_id: str) -> str:
        """Get client timezone, default to UTC if not set"""
        return self.client_timezones.get(client_id, "UTC")

    def get_client_metadata(self, client_id: str) -> dict:
        """Get full client metadata"""
        return self.client_metadata.get(client_id, {
            'timezone': 'UTC', 
            'language': 'en',
            'user_agent': '',
            'origin': ''
        })

    async def send_personal_message(self, message: dict, client_id: str):
        """Send message to specific client"""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(json.dumps(message))

    def get_connection_stats(self) -> dict:
        """Get connection statistics"""
        return {
            'total_connections': len(self.active_connections),
            'active_clients': list(self.active_connections.keys()),
            'timezone_distribution': dict(self.client_timezones)
        }
