# ANTIGRAVITY AGENT — BADALY PROJECT INSTRUCTIONS

You are working on a project called **Badaly (بدالي)** — an AI phone assistant demo.
This is a capstone project with a presentation deadline TODAY.

---

## YOUR FIRST JOB — Read these files in this exact order:

1. Read `.rules` file — this is your full project context
2. Read `badaly-backend/server.js` — this is the backend
3. Read `badaly-backend/HTML_PATCH.md` — this has 4 changes to apply
4. Read `badaly-demo__2_.html` — this is the frontend

Do NOT skip any file. Read all 4 before doing anything.

---

## YOUR MAIN TASK — Apply the HTML Patch

Open `badaly-demo__2_.html` and apply exactly 4 changes from `HTML_PATCH.md`.

### CHANGE 1 — Add CSS (inside the `<style>` tag, paste before `</style>`)

Find the line `</style>` near the top of the HTML file.
Paste this CSS block IMMEDIATELY BEFORE that `</style>` closing tag:

```css
.phone-input-wrap {
  margin: 8px 0 4px;
}
.phone-input-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sec);
  margin-bottom: 5px;
  display: block;
}
.phone-input-row {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface);
  transition: border-color .2s;
}
.phone-input-row:focus-within {
  border-color: var(--green);
  background: var(--white);
}
.phone-input-prefix {
  padding: 10px 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  background: #F0FDF4;
  border-left: 1.5px solid var(--border);
  direction: ltr;
  flex-shrink: 0;
}
.phone-input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 12px;
  font-family: 'Cairo', sans-serif;
  font-size: 14px;
  color: var(--navy);
  direction: ltr;
}
.phone-input-field::placeholder {
  color: var(--text-muted);
}
.live-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 8px;
  padding: 5px 10px;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--green-dark);
}
.live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse 1.2s ease infinite;
}
```

---

### CHANGE 2 — Add JS config (at the very top of the `<script>` tag)

Find the opening `<script>` tag near the bottom of the HTML file.
It looks like: `<script>` followed by some code.

Add these 3 lines IMMEDIATELY AFTER the `<script>` tag, before any other code:

```javascript
// ════════════════════════════════════════
// CONFIG — update BACKEND_URL after ngrok
// ════════════════════════════════════════
const BACKEND_URL = 'http://localhost:3001'; // ← replace with ngrok URL for phone
let currentCallId = null;
```

---

### CHANGE 3 — Add phone input HTML

Find this exact line in the HTML body:
```html
<button class="launch-btn" onclick="startCall()">
```

Paste this HTML block IMMEDIATELY BEFORE that button line:

```html
<div class="phone-input-wrap">
  <label class="phone-input-label">📱 رقمك — بدالي هيكلمك لما يلاقي موظف بشري</label>
  <div class="phone-input-row">
    <span class="phone-input-prefix">🇪🇬 +20</span>
    <input
      id="user-phone-input"
      class="phone-input-field"
      type="tel"
      inputmode="numeric"
      placeholder="01xxxxxxxxx"
      maxlength="11"
    />
  </div>
  <div class="live-badge-row">
    <div class="live-dot"></div>
    الاتصال الحقيقي هيتحول لرقمك لما يلاقي موظف
  </div>
</div>
```

---

### CHANGE 4 — Replace the startCall() function

Find this exact function in the script:
```javascript
function startCall() {
```

Find the ENTIRE function from `function startCall() {` to its closing `}`.
DELETE the entire function and REPLACE it with this:

```javascript
async function startCall() {
  const c = companies[currentCompany];

  // ── Grab inputs
  const phoneInputEl = document.getElementById('user-phone-input');
  const issueEl      = document.getElementById('issue-text');
  const rawPhone     = phoneInputEl ? phoneInputEl.value.trim() : '';
  const issue        = issueEl      ? issueEl.value.trim()      : '';

  // ── Normalize to E.164: 01xxxxxxxx → +2001xxxxxxxx
  let userPhone = null;
  if (rawPhone) {
    const digits = rawPhone.replace(/^0+/, '');
    userPhone = '+20' + digits;
  }

  // ── Close sheet and start visual demo immediately
  document.getElementById('overlay').classList.remove('open');

  const dialLogo = document.getElementById('dial-logo');
  dialLogo.innerHTML = '';
  const lc = getLogoSVG(currentCompany);
  lc.style.width = '100%'; lc.style.height = '100%';
  dialLogo.appendChild(lc);
  document.getElementById('dial-num').textContent = c.number;

  showScreen('dialing');

  // ── Fire real backend call (non-blocking)
  if (userPhone && issue) {
    triggerRealCall(currentCompany, userPhone, issue);
  } else {
    console.log('📺 Demo mode — no phone/issue provided, visual only');
  }

  // ── Visual simulation timeline (unchanged)
  setTimeout(() => {
    setupIVR();
    showScreen('ivr');
    simulateIvr();
  }, 2500);
}

async function triggerRealCall(company, userPhone, issue) {
  console.log('🔥 Triggering real call → company:', company, 'user:', userPhone);
  try {
    const res = await fetch(`${BACKEND_URL}/api/start-call`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ company, userPhone, issue }),
    });
    const data = await res.json();
    if (data.callId) {
      currentCallId = data.callId;
      console.log(data.demoMode ? '🟡 Demo mode:' : '✅ Live call:', data.callId);
    } else {
      console.error('❌ Backend error:', data);
    }
  } catch (err) {
    console.warn('⚠️ Backend unreachable — visual demo only:', err.message);
  }
}
```

---

## VERIFICATION — After applying all 4 changes

Confirm:
1. The CSS block is inside the `<style>` tag before `</style>` ✅
2. `BACKEND_URL` and `currentCallId` are declared at the top of `<script>` ✅
3. The phone input div exists just before the launch button ✅
4. `startCall()` is now `async function startCall()` ✅
5. A new function `triggerRealCall()` exists after `startCall()` ✅

---

## AFTER APPLYING THE PATCH

Tell me when done. Then I will ask you to:
1. Update `BACKEND_URL` in the HTML to the ngrok URL
2. Verify the backend `server.js` is correct
3. Help me run and test everything

---

## PROJECT CONTEXT SUMMARY

- Frontend: `badaly-demo__2_.html` — Arabic PWA, single file
- Backend: `badaly-backend/server.js` — Node.js Express on port 3001
- AI: Retell AI agent (`agent_6c4fe73b470905dcf8ea7636fe`) handles the real call
- Phone number: `+17179372648` (Twilio, connected to Retell)
- Companies that work with US number: CIB (+2019666), NBE (+2019623), Banque Misr (+2019888)
- Telecoms (Vodafone 888 etc.) are SIM-locked — use own phone number in .env for demo

## CRITICAL RULES FOR YOU

- Do NOT modify anything in the HTML except the 4 changes above
- Do NOT change the Arabic text, logos, colors, or animations
- Do NOT touch the `companies` object or any existing functions except `startCall()`
- If you are unsure about a line — ASK before changing it
- The file is 1500+ lines — be careful with your edits
