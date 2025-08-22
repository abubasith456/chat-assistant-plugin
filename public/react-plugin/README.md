# React Assistant Plugin (react-assistant-plugin)

Install

```bash
npm install react-assistant-plugin
```

Usage

```tsx
import React from 'react'
import ChatWidget from 'react-assistant-plugin'

export default function App(){
  return (
    <div>
      <ChatWidget />
    </div>
  )
}
```

Props
- `title` string — widget title
- `placeholder` string — input placeholder
- `theme` 'dark'|'light' — UI theme
- `position` 'bottom-right'|'bottom-left' — placement
- `adapter` — optional backend adapter implementing send/getInitialMessages

Notes
- This package has peerDependencies on `react` and `react-dom` (v17+).
- If you published this package previously without a README, republish a new version to include this file.
