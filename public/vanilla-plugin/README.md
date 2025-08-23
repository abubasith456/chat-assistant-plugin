# Chat Assistant Plugin (Vanilla JS)

A standalone chat assistant widget built with pure JavaScript - no dependencies required.

## Features

- ✨ Clean, modern UI design
- 📱 Responsive and mobile-friendly
- 🚀 Zero dependencies
- 🎨 Customizable styling
- ⚡ Lightweight and fast
- 🔧 Easy integration

## Installation

```bash
npm install chat-assistant-plugin
```

## Usage

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="node_modules/chat-assistant-plugin/plugin.css">
</head>
<body>
    <script src="node_modules/chat-assistant-plugin/plugin.js"></script>
    <script>
        const chatWidget = new ChatAssistant({
            container: document.body,
            apiEndpoint: 'https://your-api-endpoint.com/chat',
            title: 'Chat Assistant',
            placeholder: 'Type your message...'
        });
    </script>
</body>
</html>
```

### Configuration Options

```javascript
const chatWidget = new ChatAssistant({
    container: document.body,           // Container element
    apiEndpoint: 'https://api.com/chat', // Your chat API endpoint
    title: 'Chat Assistant',            // Widget title
    placeholder: 'Type your message...', // Input placeholder
    theme: 'light',                     // Theme: 'light' or 'dark'
    position: 'bottom-right'            // Position: 'bottom-right', 'bottom-left', etc.
});
```

## API Integration

The widget expects your API to handle POST requests with the following format:

```json
{
    "message": "User's message",
    "conversation_id": "optional-conversation-id"
}
```

And respond with:

```json
{
    "response": "Assistant's response",
    "conversation_id": "conversation-id"
}
```

## Styling

The widget uses CSS variables for easy customization:

```css
:root {
    --chat-primary-color: #007bff;
    --chat-background: #ffffff;
    --chat-text-color: #333333;
    --chat-border-radius: 8px;
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License
