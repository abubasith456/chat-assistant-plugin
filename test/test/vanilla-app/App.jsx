import React from 'react'
import { createRoot } from 'react-dom/client'
import Widget from 'react-chat-widget'

const App = () => {
  return (
    React.createElement('div', {style:{padding:20, fontFamily:'system-ui'}}, [
      React.createElement('h2', {key:'h2'}, 'React plugin test'),
      React.createElement('div', {key:'widget'}, React.createElement(Widget, { title: 'React test', placeholder: 'Type...' }))
    ])
  )
}

const container = document.getElementById('root')
createRoot(container).render(React.createElement(App))
