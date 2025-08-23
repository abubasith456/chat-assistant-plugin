# React Chat Widget

A modern React chat widget component with TypeScript support.

## Features

- ⚡ Built with React 19 and TypeScript
- 🎨 Styled with Tailwind CSS
- 📱 Fully responsive design
- 🚀 Easy integration
- 🔧 Highly customizable
- 💪 Type-safe

## Installation

```bash
npm install @mohamedabu.basith/react-chat-widget
```

## Usage

### Basic Usage

```tsx
import ChatWidget from '@mohamedabu.basith/react-chat-widget';

function App() {
  return (
    <div>
      <ChatWidget
        apiEndpoint="https://your-api-endpoint.com/chat"
        title="Chat Assistant"
        placeholder="Type your message..."
      />
    </div>
  );
}
```

### With Custom Configuration

```tsx
import ChatWidget from '@mohamedabu.basith/react-chat-widget';

function App() {
  const handleMessage = async (message: string) => {
    // Custom message handling logic
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return response.json();
  };

  return (
    <ChatWidget
      title="AI Assistant"
      placeholder="Ask me anything..."
      onSendMessage={handleMessage}
      theme="dark"
      position="bottom-left"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | - | Your chat API endpoint |
| `title` | `string` | `'Chat'` | Widget title |
| `placeholder` | `string` | `'Type a message...'` | Input placeholder |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `position` | `string` | `'bottom-right'` | Widget position |
| `onSendMessage` | `function` | - | Custom message handler |

## Styling

The component is built with Tailwind CSS. You can customize the appearance by:

1. **Using Tailwind utilities**: Override component classes
2. **CSS variables**: Customize colors and spacing
3. **Custom CSS**: Target specific component classes

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import ChatWidget, { ChatMessage, ChatConfig } from '@mohamedabu.basith/react-chat-widget';

interface CustomChatConfig extends ChatConfig {
  customOption: boolean;
}
```

## Requirements

- React 17+ or 18+
- React DOM 17+ or 18+

## License

MIT License
