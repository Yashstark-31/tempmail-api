export default async function handler(req, res) {
  const { type, token, id } = req.query;

  // 🔥 safe fetch
  async function safeJson(url, options = {}) {
    const r = await fetch(url, options);
    const text = await r.text();

    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  try {

    // ================= NEW =================
    if (type === "new") {
      const dData = await safeJson("https://api.mail.tm/domains");

      if (!dData || !dData["hydra:member"]) {
        return res.json({ status: "error", msg: "domain fail" });
      }

      const domain = dData["hydra:member"][0].domain;
      const login = Math.random().toString(36).substring(2, 10);
      const password = "pass123456";

      const address = `${login}@${domain}`;

      // create account
      await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });

      // get token
      const tData = await safeJson("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });

      if (!tData || !tData.token) {
        return res.json({ status: "error", msg: "token fail" });
      }

      return res.json({
        status: "ok",
        email: address,
        token: tData.token
      });
    }

    // ================= INBOX =================
    if (type === "inbox") {
      const d = await safeJson("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });

      return res.json({
        status: "ok",
        messages: d?.["hydra:member"] || []
      });
    }

    // ================= READ =================
    if (type === "read") {
      const d = await safeJson(`https://api.mail.tm/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return res.json({
        status: "ok",
        data: d || {}
      });
    }

    // ================= OTP =================
    if (type === "otp") {
      const d = await safeJson(`https://api.mail.tm/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const text = (d?.text || "") + (d?.html || "");
      const otp = text.match(/\b\d{4,8}\b/);

      return res.json({
        status: "ok",
        otp: otp ? otp[0] : null
      });
    }

    return res.json({ status: "invalid_type" });

  } catch (e) {
    return res.json({
      status: "error",
      msg: e.message
    });
  }
}
