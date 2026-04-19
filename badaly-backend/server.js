/**
 * ╔══════════════════════════════════════════════════╗
 * ║           BADALY BACKEND · server.js            ║
 * ║   Triggers Retell AI outbound call securely     ║
 * ╚══════════════════════════════════════════════════╝
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS: allow any origin (phone + browser)
app.use(cors({ origin: '*' }));
app.use(express.json());

// ══════════════════════════════════════════════════
// COMPANY → CALLABLE NUMBER MAPPING
// Egyptian shortcodes are NOT globally callable.
// Retell needs a proper E.164 number (+20xxxxxxxxx).
// Options:
//   A) If your Retell FROM number is Egyptian → use real shortcodes
//   B) If FROM number is US → you can't call 888 directly.
//      Map to the full international support lines instead.
//      Telecoms often have int'l lines — check their websites.
//   C) For the demo: override any company via .env
// ══════════════════════════════════════════════════
const COMPANY_NUMBERS = {
  vodafone:      process.env.NUM_VODAFONE      || '+20888000000',   // ← replace with real
  we:            process.env.NUM_WE            || '+20222222222',
  orange:        process.env.NUM_ORANGE        || '+20333333333',
  etisalat:      process.env.NUM_ETISALAT      || '+20444444444',
  cib:           process.env.NUM_CIB           || '+2019666',
  nbe:           process.env.NUM_NBE           || '+2019623',
  banquemisr:    process.env.NUM_BANQUEMISR    || '+2019888',
  qnb:           process.env.NUM_QNB          || '+2016000',
  banqueducaire: process.env.NUM_BANQUEDUCAIRE || '+2016488',
};

// ══════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════
app.get('/health', (_req, res) => {
  const retellConfigured = !!(
    process.env.RETELL_API_KEY &&
    process.env.RETELL_AGENT_ID &&
    process.env.RETELL_FROM_NUMBER
  );
  res.json({
    ok:   true,
    mode: retellConfigured ? '🟢 LIVE (Retell connected)' : '🟡 DEMO (Retell not configured)',
    ts:   new Date().toISOString(),
  });
});

// ══════════════════════════════════════════════════
// POST /api/start-call
// Body: { company, userPhone, issue }
// ══════════════════════════════════════════════════
app.post('/api/start-call', async (req, res) => {
  const { company, userPhone, issue } = req.body;

  // ── Validate
  if (!company || !userPhone) {
    return res.status(400).json({ error: 'company and userPhone are required' });
  }
  const toNumber = COMPANY_NUMBERS[company];
  if (!toNumber) {
    return res.status(400).json({ error: `Unknown company: "${company}"` });
  }

  console.log(`\n📞 Call request: ${company} → user ${userPhone}`);
  console.log(`   Issue: "${issue || '(none)'}"`);

  // ── Check Retell config
  const {
    RETELL_API_KEY,
    RETELL_AGENT_ID,
    RETELL_FROM_NUMBER,
  } = process.env;

  if (!RETELL_API_KEY || !RETELL_AGENT_ID || !RETELL_FROM_NUMBER) {
    console.warn('⚠️  Retell not configured → returning DEMO callId');
    return res.json({
      success:  true,
      callId:   'demo-' + Date.now(),
      demoMode: true,
      message:  'Retell env vars missing — visual demo mode only',
    });
  }

  // ── Fire Retell call
  try {
    const retellRes = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_number: RETELL_FROM_NUMBER,  // your Retell-provisioned number
        to_number:   toNumber,             // telecom/bank hotline
        agent_id:    RETELL_AGENT_ID,
        // These become {{variable}} in your Retell agent prompt
        retell_llm_dynamic_variables: {
          user_phone:         userPhone,
          issue_description:  issue || 'استفسار عام',
          company_name:       company,
        },
      }),
    });

    const data = await retellRes.json();

    if (!retellRes.ok) {
      console.error('❌ Retell error:', data);
      return res.status(502).json({ error: 'Retell API error', detail: data });
    }

    console.log(`✅ Retell call started: ${data.call_id}`);
    return res.json({ success: true, callId: data.call_id });

  } catch (err) {
    console.error('❌ Network/fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════
// GET /api/call-status/:callId
// Poll this to know when Retell detects a human
// ══════════════════════════════════════════════════
app.get('/api/call-status/:callId', async (req, res) => {
  const { RETELL_API_KEY } = process.env;

  if (!RETELL_API_KEY) {
    return res.json({ status: 'demo', disconnectionReason: null });
  }

  try {
    const r = await fetch(`https://api.retellai.com/v2/call/${req.params.callId}`, {
      headers: { Authorization: `Bearer ${RETELL_API_KEY}` },
    });
    const data = await r.json();
    return res.json({
      status:              data.call_status,
      disconnectionReason: data.disconnection_reason,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════
app.listen(PORT, () => {
  const retellLive = !!(process.env.RETELL_API_KEY && process.env.RETELL_AGENT_ID);
  console.log(`
╔══════════════════════════════════════════╗
║        🟢  BADALY BACKEND RUNNING        ║
╠══════════════════════════════════════════╣
║  http://localhost:${PORT}                   ║
║  Mode: ${retellLive ? '🔴 LIVE (Retell Active)         ' : '🟡 DEMO (no Retell keys yet)    '}  ║
╚══════════════════════════════════════════╝

Next steps:
  1. run: npx ngrok http ${PORT}
  2. Copy the https://xxxx.ngrok-free.app URL
  3. Update BACKEND_URL in your HTML file
  4. Open that URL in Chrome on your Samsung M34
`);
});
