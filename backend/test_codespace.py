"""
WebSocket test client for GitHub Codespaces
Replace the URL with your actual Codespace URL
"""

import asyncio
import json
import websockets
from datetime import datetime

# Your Codespace WebSocket URL
WS_URL = "wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/test_user_123"

async def test_codespace_chat():
    print("🚀 Connecting to Codespace WebSocket server...")
    print(f"📡 URL: {WS_URL}")
    
    try:
        async with websockets.connect(WS_URL) as websocket:
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
                            "user_id": "codespace_test_user",
                            "session_id": "codespace_session"
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
            
    except websockets.exceptions.InvalidURI:
        print("❌ Invalid WebSocket URL. Please check the URL format.")
    except websockets.exceptions.ConnectionRefused:
        print("❌ Could not connect to server. Is it running?")
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    print("🤖 Chat Assistant - Codespace WebSocket Test")
    print("Make sure your backend server is running in Codespace")
    print()
    
    asyncio.run(test_codespace_chat())
