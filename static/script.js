document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    promptInput: document.getElementById('prompt'),
    sendButton: document.querySelector('.send-button'),
    gpt4Toggle: document.getElementById('gpt4-toggle'),
    claudeToggle: document.getElementById('claude-toggle'),
    gpt4Column: document.getElementById('gpt4-column'),
    claudeColumn: document.getElementById('claude-column'),
    modeToggle: document.getElementById('modeToggle'),
    gpt4ApiKeyInput: document.getElementById('gpt4-api-key'),
    claudeApiKeyInput: document.getElementById('claude-api-key')
  };

  const kpiElements = {
    gpt4: {
      responseTime: document.getElementById('gpt4-response-time'),
      tokensPerSecond: document.getElementById('gpt4-tokens-per-second'),
      totalTokens: document.getElementById('gpt4-total-tokens'),
      cost: document.getElementById('gpt4-cost')
    },
    claude: {
      responseTime: document.getElementById('claude-response-time'),
      tokensPerSecond: document.getElementById('claude-tokens-per-second'),
      totalTokens: document.getElementById('claude-total-tokens'),
      cost: document.getElementById('claude-cost')
    }
  };

  const modelData = {
    gpt4: { responseTimes: [], totalTokens: 0, cost: 0, history: [] },
    claude: { responseTimes: [], totalTokens: 0, cost: 0, history: [] }
  };

  function initializeApiKeys() {
    elements.gpt4ApiKeyInput.value = localStorage.getItem('gpt4ApiKey') || '';
    elements.claudeApiKeyInput.value = localStorage.getItem('claudeApiKey') || '';

    elements.gpt4ApiKeyInput.addEventListener('input', () => {
      localStorage.setItem('gpt4ApiKey', elements.gpt4ApiKeyInput.value);
    });
    elements.claudeApiKeyInput.addEventListener('input', () => {
      localStorage.setItem('claudeApiKey', elements.claudeApiKeyInput.value);
    });
  }

  function formatAIResponse(text) {
    const paragraphs = text.split('\n\n');
  
    const formattedParagraphs = paragraphs.map(paragraph => {
      // Handle blockquotes
      if (paragraph.startsWith('> ')) {
        const quoteLines = paragraph.split('\n').map(line => line.replace(/^>\s?/, ''));
        return `<blockquote>${quoteLines.join('<br>')}</blockquote>`;
      }
  
      // Handle code blocks
      if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
        const codeContent = paragraph.slice(3, -3).trim();
        return `<pre><code>${codeContent}</code></pre>`;
      }
  
      // Improved regex to match both numbered lists and bullet points more accurately
      const listMatch = paragraph.match(/^(\d+\.\s|-)\s/m);
      if (listMatch) {
        const listItems = paragraph.split('\n').map(item => item.trim()).filter(item => item !== '');
        const listType = listMatch[1].includes('-') ? 'ul' : 'ol';
        const nestedList = (item) => {
          const nestedMatch = item.match(/^(\d+\.\s|-)\s/);
          if (nestedMatch) {
            const nestedItems = item.split('\n').map(nestedItem => nestedItem.trim()).filter(nestedItem => nestedItem !== '');
            const nestedListType = nestedMatch[1].includes('-') ? 'ul' : 'ol';
            return `<${nestedListType}>${nestedItems.map(nestedItem => `<li>${nestedItem.replace(/^(\d+\.\s|-)\s/, '')}</li>`).join('')}</${nestedListType}>`;
          }
          return `<li>${item.replace(/^(\d+\.\s|-)\s/, '')}</li>`;
        };
        return `<${listType}>${listItems.map(nestedList).join('')}</${listType}>`;
      }
  
      // Handle bold and italic text
      paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
      paragraph = paragraph.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
  
      return `<p>${paragraph}</p>`;
    });
  
    return formattedParagraphs.join('');
  }
  
  
  function addMessage(column, content, isAI = true, model = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = isAI ? `message ${model}-message` : 'message user-message';
    messageDiv.innerHTML = isAI ? formatAIResponse(content) : content;
    const chatContainer = column.querySelector('.chat-container');
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
  }

  function updateKPIs(model, responseTime, tokens) {
    const data = modelData[model];
    data.responseTimes.push(responseTime);
    data.totalTokens += tokens;

    const avgResponseTime = data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length;
    const tokensPerSecond = tokens / (responseTime / 1000);
    const cost = model === 'gpt4' ? data.totalTokens * 0.00003 : data.totalTokens * 0.000015;

    const kpi = kpiElements[model];
    kpi.responseTime.textContent = `${avgResponseTime.toFixed(0)}ms`;
    kpi.tokensPerSecond.textContent = tokensPerSecond.toFixed(2);
    kpi.totalTokens.textContent = data.totalTokens;
    kpi.cost.textContent = `$${cost.toFixed(4)}`;
  }

  async function callAPI(model, prompt) {
    const apiKey = model === 'gpt4' ? elements.gpt4ApiKeyInput.value : elements.claudeApiKeyInput.value;
    if (!apiKey) throw new Error(`${model.toUpperCase()} API key is missing`);

    const response = await fetch('/api/ProxyAIRequests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model, 
        api_key: apiKey, 
        text: prompt,
        history: modelData[model].history
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to call backend API: ${errorText}`);
    }

    return await response.json();
  }

  async function generateResponse(model, prompt) {
    const column = model === 'gpt4' ? elements.gpt4Column : elements.claudeColumn;
    addMessage(column, prompt, false);
    const loadingMessage = addMessage(column, 'Generating response...', true, model);

    const startTime = Date.now();

    try {
      const response = await callAPI(model, prompt);
      const responseTime = Date.now() - startTime;
      const tokens = response.usage.total_tokens;

      loadingMessage.remove();
      addMessage(column, response.content, true, model);

      modelData[model].history.push({ role: 'user', content: prompt });
      modelData[model].history.push({ role: 'assistant', content: response.content });

      updateKPIs(model, responseTime, tokens);
    } catch (error) {
      loadingMessage.remove();
      addMessage(column, `Error: ${error.message}. Please check your API key and try again.`, true, model);
      console.error(`Error calling ${model.toUpperCase()} API:`, error);
    }
  }

  function setupEventListeners() {
    elements.sendButton.addEventListener('click', handleSendClick);
    elements.promptInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') elements.sendButton.click();
    });
    elements.modeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  }

  async function handleSendClick() {
    const prompt = elements.promptInput.value.trim();
    if (!prompt) return;

    const promises = [];

    if (elements.gpt4Toggle.checked) {
      promises.push(generateResponse('gpt4', prompt));
    }
    if (elements.claudeToggle.checked) {
      promises.push(generateResponse('claude', prompt));
    }

    await Promise.all(promises);

    elements.promptInput.value = '';
  }

  // Initialize the application
  initializeApiKeys();
  setupEventListeners();
});