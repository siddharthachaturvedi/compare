# 🌟 AI Model Benchmarking Web Application 🚀

Welcome to the **AI Model Benchmarking Web App**! This project provides a beautiful, intuitive interface to compare AI models like **GPT-4** and **Claude 3.5 Sonnet**. Monitor performance metrics, send prompts, and get real-time responses—all with a few clicks! 🎉

![AI Model Benchmarking Interface](screenshot.png)

## ✨ Features

- 🆚 **Compare AI Models**: Benchmark GPT-4 and Claude 3.5 Sonnet side by side.
- 📊 **KPIs Dashboard**: Track average response time, tokens per second, total tokens, and estimated cost.
- 💬 **Interactive Chat Interface**: Send prompts and receive responses in real-time.
- 🌗 **Dark/Light Mode Toggle**: Switch between dark and light modes for enhanced readability.
- 🔐 **Secure API Key Storage**: API keys are securely handled and never stored.

## 🛠️ Installation

### Prerequisites

- 🐍 Python 3.x
- 🟢 Node.js (if JavaScript-related builds are needed)

### Setup Instructions

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/ai-model-benchmarking.git
    cd ai-model-benchmarking
    ```

2. Install Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. (Optional) Install JavaScript dependencies:

    ```bash
    npm install
    ```

4. Run the Flask app locally:

    ```bash
    python app.py
    ```

5. Open your browser and navigate to: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 💻 Usage Guide

1. Launch the web interface.
2. 🛡️ Enter your API keys for **GPT-4** and **Claude 3.5 Sonnet**.
3. Toggle the models you want to benchmark.
4. 📝 Input your prompt and hit the ➤ send button.
5. 🎯 Track real-time KPIs like **Response Time**, **Tokens/Second**, and **Estimated Cost**.

### 📊 KPIs (Key Performance Indicators)

- ⏱️ **Avg. Response Time**: Measures how fast the model responds.
- 🔢 **Tokens/Second**: Tracks the number of tokens processed per second.
- 🧮 **Total Tokens**: Displays the total number of tokens used.
- 💸 **Estimated Cost**: Provides an estimate of the cost for each interaction.

### 🌗 Dark/Light Mode

You can easily toggle between dark and light modes using the 🌓 button in the top right corner of the interface.

### 🔐 API Keys Handling

- 🛡️ API keys are securely handled in the backend and are not stored.
- Use OpenAI's API key for **GPT-4** and Anthropic's API key for **Claude 3.5 Sonnet**.

### 📦 Dependencies

- **Flask** (2.0.1) 🍃
- **Werkzeug** (2.3.7) 🛠️
- **Flask-CORS** (3.0.10) 🌐
- **requests** (2.26.0) 🔗
- **gunicorn** (20.1.0) 🐋

For full dependency details, see the [`requirements.txt`](requirements.txt) file.


### 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

💡 _"Made with ❤️ in Bellevue"_
