# 🤖 Customer Support AI Bot

A beautiful, fully-functional customer support chatbot powered by your Azure OpenAI fine-tuned GPT-4o model. Built with React + Vite, designed for S3 static hosting.

## ✨ Features

- 🎨 **Premium dark UI** with animated gradients and glassmorphism
- ⚡ **Real-time streaming** — responses appear token by token
- 💬 **Multi-turn conversation** with full chat history
- 🔑 **API key entered in-browser** — never stored on a server
- 📥 **Export chat** to `.txt` file
- 💡 **Quick-start suggestion buttons** on first load
- 📱 **Responsive** — works on mobile too
- 🚀 **S3-ready** — static build, no backend needed

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- An Azure OpenAI API key with your fine-tuned deployment

### Local Development

```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build
```

Output is in the `dist/` folder — ready to upload to S3.

## ☁️ Deploy to S3

1. Run `npm run build`
2. Create an S3 bucket (e.g. `my-support-bot`)
3. Enable **Static website hosting** on the bucket
4. Set index document to `index.html`
5. Upload the entire `dist/` folder contents to the bucket root
6. Set bucket policy to allow public read:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::my-support-bot/*"
     }]
   }
   ```
7. Access via the S3 static website endpoint URL

> **Tip:** Use CloudFront in front of S3 for HTTPS and faster global delivery.

## ⚙️ Configuration (In-App)

When you open the app, you'll see a setup screen asking for:

| Field | Description |
|---|---|
| **Azure API Key** | Your Azure OpenAI subscription key |
| **Azure Endpoint** | Your resource endpoint URL |
| **Deployment Name** | Your fine-tuned model deployment name |
| **API Version** | Azure OpenAI API version |
| **Bot Name** | Display name shown in the chat |
| **System Prompt** | Personality/instructions for the bot |
| **Temperature** | Controls response creativity (0–1) |

Your API key is stored only in `sessionStorage` — it's cleared when the browser tab is closed.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── SetupScreen.jsx   # Configuration form
│   ├── SetupScreen.css
│   ├── ChatScreen.jsx    # Main chat interface
│   └── ChatScreen.css
├── App.jsx               # Root with routing between screens
├── App.css
├── index.css             # Global styles & CSS variables
└── main.jsx
```

## 🔧 Azure Config Details

- **Endpoint:** `https://2340401106-8532-resource.cognitiveservices.azure.com/`
- **Deployment:** `gpt-4o-2024-08-06-my_model`
- **API Version:** `2024-12-01-preview`
