from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder='static')
CORS(app)

def call_claude_sonnet(api_key, input_text, history):
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
    }
    messages = [{"role": msg["role"], "content": msg["content"]} for msg in history]
    messages.append({"role": "user", "content": input_text})
    payload = {
        "model": "claude-3-sonnet-20240229",
        "messages": messages,
        "max_tokens": 150
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    result = response.json()
    return {
        "content": result["content"][0]["text"],
        "usage": {
            "total_tokens": result["usage"]["output_tokens"] + result["usage"]["input_tokens"]
        }
    }

def call_gpt4(api_key, input_text, history):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    messages = [{"role": msg["role"], "content": msg["content"]} for msg in history]
    messages.append({"role": "user", "content": input_text})
    payload = {
        "model": "gpt-4",
        "messages": messages,
        "max_tokens": 150
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    result = response.json()
    return {
        "content": result["choices"][0]["message"]["content"],
        "usage": result["usage"]
    }

@app.route('/api/ProxyAIRequests', methods=['POST'])
def proxy_ai_requests():
    data = request.json
    model = data.get('model')
    api_key = data.get('api_key')
    input_text = data.get('text')
    history = data.get('history', [])

    if not all([model, api_key, input_text]):
        return jsonify({"error": "Missing parameters"}), 400

    try:
        if model == 'claude':
            result = call_claude_sonnet(api_key, input_text, history)
        elif model == 'gpt4':
            result = call_gpt4(api_key, input_text, history)
        else:
            return jsonify({"error": "Invalid model"}), 400

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

# Make sure to replace the API keys with your own