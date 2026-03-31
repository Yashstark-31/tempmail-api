export default async function handler(req, res) {
  const { type, token, id } = req.query;

  // ================= NEW EMAIL =================
  if (type === "new") {
    try {
      // get domain
      const dRes = await fetch("https://api.mail.tm/domains");
      const dData = await dRes.json();

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
      const tRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });

      const tData = await tRes.json();

      return res.json({
        status: "ok",
        email: address,
        token: tData.token
      });

    } catch (e) {
      return res.json({ status: "error" });
    }
  }

  // ================= INBOX =================
  if (type === "inbox") {
    try {
      const r = await fetch("https://api.mail.tm/messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const d = await r.json();

      return res.json({
        status: "ok",
        messages: d["hydra:member"]
      });

    } catch {
      return res.json({ status: "error" });
    }
  }

  // ================= READ =================
  if (type === "read") {
    try {
      const r = await fetch(`https://api.mail.tm/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const d = await r.json();

      return res.json({
        status: "ok",
        data: d
      });

    } catch {
      return res.json({ status: "error" });
    }
  }

  // ================= OTP =================
  if (type === "otp") {
    try {
      const r = await fetch(`https://api.mail.tm/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const d = await r.json();

      const text = (d.text || "") + (d.html || "");
      const otp = text.match(/\b\d{4,8}\b/);

      return res.json({
        status: "ok",
        otp: otp ? otp[0] : null
      });

    } catch {
      return res.json({ status: "error" });
    }
  }

  return res.json({ status: "invalid_type" });
}
