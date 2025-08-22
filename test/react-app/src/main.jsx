import React from 'react'
import { createRoot } from 'react-dom/client'
import Widget from '@mohamedabu.basith/react-chat-widget'
import '@mohamedabu.basith/react-chat-widget/dist/index.css'

function App(){
  return (
    React.createElement('div', {style:{padding:20}}, [
      React.createElement('h2', {key:'h2'}, 'React app integration test'),
      React.createElement(Widget, { key: 'widget', title: 'React test', placeholder: 'Say hi' })
    ])
  )
}

createRoot(document.getElementById('root')).render(React.createElement(App))
