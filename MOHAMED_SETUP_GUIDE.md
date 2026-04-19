# 📦 BADALY — File Setup Guide (For Mohamed)

## What you downloaded from Claude

| File | What it is |
|------|-----------|
| `badaly-backend.tar.gz` | The complete Node.js backend |
| `BADALY_HTML_PATCH.md` | 4 changes to apply to the HTML file |
| `RETELL_SETUP.md` | Retell configuration guide (done already ✅) |
| `badaly.rules` | AI assistant context file for Antigravity |

---

## Step 1 — Extract the backend

Open your terminal in the folder where you downloaded the files, then:

```bash
# Extract
tar -xzf badaly-backend.tar.gz

# You now have a folder called badaly-backend/
# Move into it
cd badaly-backend

# Install dependencies
npm install
```

---

## Step 2 — Create your .env file

Inside the `badaly-backend/` folder:

```bash
# Copy the template
cp .env.example .env
```

Open `.env` and fill it:

```env
PORT=3001

RETELL_API_KEY=key_65b4b28b4aa62c844868d348b0c8
RETELL_AGENT_ID=agent_6c4fe73b470905dcf8ea7636fe
RETELL_FROM_NUMBER=+17179372648

NUM_CIB=+2019666
NUM_NBE=+2019623
NUM_BANQUEMISR=+2019888
NUM_BANQUEDUCAIRE=+2016488
NUM_QNB=+2019700
NUM_VODAFONE=+201XXXXXXXXX
NUM_WE=+201XXXXXXXXX
NUM_ORANGE=+201XXXXXXXXX
NUM_ETISALAT=+201XXXXXXXXX
```

---

## Step 3 — Put ALL files in one folder

Your project folder should look like this:

```
badaly-project/
├── badaly-demo__2_.html       ← your original HTML file
├── badaly.rules               ← rename from badaly.rules to .rules
├── badaly-backend/
│   ├── server.js
│   ├── package.json
│   ├── .env                   ← you just created this
│   ├── .env.example
│   └── HTML_PATCH.md
```

To rename the rules file:
```bash
mv badaly.rules .rules
```

---

## Step 4 — Open in Antigravity IDE

1. Open Antigravity IDE
2. Open the `badaly-project/` folder
3. The `.rules` file will be read automatically by the AI agent
4. Paste the prompt from `ANTIGRAVITY_AGENT_PROMPT.md` into the chat

---

## Step 5 — Run the backend (keep this terminal open)

```bash
cd badaly-backend
node server.js
```

You should see:
```
Mode: 🔴 LIVE (Retell Active)
```

---

## Step 6 — Expose with ngrok (new terminal)

```bash
npx ngrok http 3001
```

Copy the `https://xxxx.ngrok-free.app` URL.
This is your `BACKEND_URL` for the HTML file.

---

## Step 7 — Load on Samsung M34

```bash
# Serve the HTML (new terminal, from badaly-project/ folder)
npx serve . -p 8080
```

On your M34:
1. Connect to same WiFi as laptop
2. Open Chrome → type `http://192.168.x.x:8080/badaly-demo__2_.html`
   (find your laptop IP with `ipconfig` on Windows or `ifconfig` on Mac)
3. Chrome menu (⋮) → **Add to Home Screen** → **Install**

Done. It's on your home screen like a real app.
