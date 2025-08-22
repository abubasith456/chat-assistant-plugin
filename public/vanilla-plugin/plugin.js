;(function () {
  // Simple standalone plugin exposing an init(target) API.
  const SAMPLE = [
    { id: '1', role: 'system', text: 'You are Aurora, a helpful assistant.' },
    { id: '2', role: 'assistant', text: 'Hello! I am Aurora. How can I assist you today?' },
    { id: '3', role: 'user', text: "Show me a sample of things you can do." },
    { id: '4', role: 'assistant', text: "I can answer questions, summarize text, and demo mock replies. Try typing something!" },
  ]

  function createElement(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.firstElementChild
  }

  function init(container) {
    const root = typeof container === 'string' ? document.querySelector(container) : container
    if (!root) throw new Error('Container not found')

    const widget = createElement("<div class='va-widget'></div>")
    const header = createElement("<div style='display:flex;align-items:center;gap:8px;margin-bottom:8px'><div style='width:36px;height:36px;border-radius:10px;background:linear-gradient(90deg,#6366f1,#8b5cf6)'></div><div><strong>Aurora</strong><div style='font-size:12px;color:#cbd5e1'>Offline mock</div></div></div>")
    const messages = createElement("<div class='va-messages'></div>")
    const inputWrap = createElement("<div style='display:flex;gap:8px;margin-top:8px'><input style='flex:1;padding:8px;border-radius:8px;border:0;background:#0f1724;color:white' placeholder='Type a message...'><button style='padding:8px 12px;border-radius:8px;background:#6366f1;color:white;border:0'>Send</button></div>")

    widget.appendChild(header)
    widget.appendChild(messages)
    widget.appendChild(inputWrap)
    root.appendChild(widget)

    function renderList(list) {
      messages.innerHTML = ''
      list.forEach((m) => {
        const el = document.createElement('div')
        el.className = 'va-bubble ' + (m.role === 'user' ? 'va-user' : 'va-assistant')
        el.textContent = m.text
        messages.appendChild(el)
      })
      messages.scrollTop = messages.scrollHeight
    }

    renderList(SAMPLE)

    const input = inputWrap.querySelector('input')
    const btn = inputWrap.querySelector('button')

    btn.addEventListener('click', () => {
      const text = input.value.trim()
      if (!text) return
      SAMPLE.push({ id: String(Date.now()), role: 'user', text })
      renderList(SAMPLE)
      input.value = ''
      setTimeout(() => {
        SAMPLE.push({ id: String(Date.now()+1), role: 'assistant', text: `Mock reply to: ${text}` })
        renderList(SAMPLE)
      }, 700)
    })
  }

  window.AuroraPlugin = { init }
})()
