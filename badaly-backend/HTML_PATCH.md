<!--
╔══════════════════════════════════════════════════════════════════╗
║              BADALY HTML PATCH INSTRUCTIONS                     ║
║                                                                  ║
║  Make 4 changes to badaly-demo__2_.html:                        ║
║                                                                  ║
║  CHANGE 1 → Find the line:   .recent-logo-inner img,            ║
║             ADD the CSS below in the <style> block              ║
║                                                                  ║
║  CHANGE 2 → Find the opening <script> tag                       ║
║             ADD the constants at the very top                   ║
║                                                                  ║
║  CHANGE 3 → Find the sheet HTML in the body.                    ║
║             Look for: <button class="launch-btn"                ║
║             ADD the phone input div BEFORE it                   ║
║                                                                  ║
║  CHANGE 4 → Find: function startCall() {                        ║
║             REPLACE the entire function with the new one below  ║
╚══════════════════════════════════════════════════════════════════╝


════════════════════════════════════════════════════════
CHANGE 1 — Add to <style> block (paste before </style>)
════════════════════════════════════════════════════════

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


════════════════════════════════════════════════════════
CHANGE 2 — Add at very top of <script> block
════════════════════════════════════════════════════════

// ════════════════════════════════════════
// CONFIG — update BACKEND_URL after ngrok
// ════════════════════════════════════════
const BACKEND_URL = 'http://localhost:3001'; // ← replace with ngrok URL for phone
let currentCallId = null;


════════════════════════════════════════════════════════
CHANGE 3 — Phone input HTML (add BEFORE the launch-btn)
         Find this in the HTML body — it's inside .sheet-inner:
         <button class="launch-btn" onclick="startCall()">
         Paste this BLOCK immediately before that button
════════════════════════════════════════════════════════

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


════════════════════════════════════════════════════════
CHANGE 4 — Replace the entire startCall() function
════════════════════════════════════════════════════════

// ════════════════════════════════════════
// CALL FLOW — wired to real backend
// ════════════════════════════════════════
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
    // strip leading zeros, then prepend Egypt country code
    const digits = rawPhone.replace(/^0+/, '');
    userPhone = '+20' + digits;
  }

  // ── Close sheet & start visual demo immediately (don't block on API)
  document.getElementById('overlay').classList.remove('open');

  const dialLogo = document.getElementById('dial-logo');
  dialLogo.innerHTML = '';
  const lc = getLogoSVG(currentCompany);
  lc.style.width = '100%'; lc.style.height = '100%';
  dialLogo.appendChild(lc);
  document.getElementById('dial-num').textContent = c.number;

  showScreen('dialing');

  // ── Fire real backend call (non-blocking — demo runs regardless)
  if (userPhone && issue) {
    triggerRealCall(currentCompany, userPhone, issue);
  } else {
    console.log('📺 Demo mode — no phone/issue provided, visual only');
  }

  // ── Existing simulation timeline (unchanged)
  setTimeout(() => {
    setupIVR();
    showScreen('ivr');
    simulateIvr();
  }, 2500);
}

async function triggerRealCall(company, userPhone, issue) {
  console.log(`🔥 Triggering real call → ${company}, user: ${userPhone}`);
  try {
    const res = await fetch(`${BACKEND_URL}/api/start-call`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ company, userPhone, issue }),
    });
    const data = await res.json();

    if (data.callId) {
      currentCallId = data.callId;
      if (data.demoMode) {
        console.log('🟡 Backend in demo mode (Retell not configured):', data.callId);
      } else {
        console.log('✅ Real Retell call started:', data.callId);
      }
    } else {
      console.error('❌ Backend error:', data);
    }
  } catch (err) {
    // Backend offline = fall back to pure visual demo. Demo still works perfectly.
    console.warn('⚠️ Backend unreachable — pure visual demo:', err.message);
  }
}

