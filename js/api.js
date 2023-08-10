const URL = 'https://nodejs-openai-dot-geodata-208509.ey.r.appspot.com/openai/completions'
//const URL = 'http:localhost:8080/openai/completions'

export const askChatGPT = async (question) => {
  let response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'model': 'gpt-3.5-turbo',
      'messages': [
        {'role': 'user', 'content': question}
      ]
    })
  })
  let result = await response.json()
  return result.choices[0].message.content
}