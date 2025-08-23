"""
Simple test client for WebSocket chat server
Run this to test your backend server
"""

import asyncio
import json
import websockets
from datetime import datetime

async def test_chat_client():
    uri = "ws://localhost:8000/ws/test_user_123"
    
    print("🚀 Connecting to chat server...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Listen for incoming messages
            async def listen_for_messages():
                try:
                    while True:
                        message = await websocket.recv()
                        data = json.loads(message)
                        
                        timestamp = data.get('timestamp', datetime.now().isoformat())
                        sender = data.get('sender', 'unknown')
                        msg_type = data.get('type', 'message')
                        content = data.get('message', '')
                        
                        print(f"\n[{timestamp}] {sender.upper()} ({msg_type}): {content}")
                        
                except websockets.exceptions.ConnectionClosed:
                    print("🔌 Connection closed by server")
                except Exception as e:
                    print(f"❌ Error receiving message: {e}")
            
            # Start listening in background
            listen_task = asyncio.create_task(listen_for_messages())
            
            # Interactive chat loop
            print("\n💬 Chat started! Type your messages (or 'quit' to exit):")
            print("=" * 50)
            
            while True:
                try:
                    # Get user input
                    user_input = input("\nYou: ")
                    
                    if user_input.lower() in ['quit', 'exit', 'bye']:
                        print("👋 Goodbye!")
                        break
                    
                    if user_input.strip():
                        # Send message to server
                        message_data = {
                            "message": user_input,
                            "user_id": "test_user_123",
                            "session_id": "test_session"
                        }
                        
                        await websocket.send(json.dumps(message_data))
                        
                except KeyboardInterrupt:
                    print("\n🛑 Interrupted by user")
                    break
                except Exception as e:
                    print(f"❌ Error sending message: {e}")
                    break
            
            # Cancel listening task
            listen_task.cancel()
            
    except websockets.exceptions.ConnectionRefused:
        print("❌ Could not connect to server. Is it running on localhost:8000?")
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    print("🤖 Chat Assistant - Test Client")
    print("Make sure your server is running: python main.py")
    print()
    
    asyncio.run(test_chat_client())
