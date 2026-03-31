export default async function handler(req, res) {
  const { type, login, domain, id } = req.query;

  const domains = [
    "1secmail.com",
    "1secmail.org",
    "1secmail.net",
    "wwjmp.com",
    "esiix.com"
  ];

  // ================= NEW =================
  if (type === "new") {
    const random = Math.random().toString(36).substring(2, 10);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${random}@${domain}`;

    return res.json({
      status: "ok",
      email,
      login: random,
      domain,
      provider: "1secmail-network"
    });
  }

  // ================= INBOX =================
  if (type === "inbox") {
    try {
      const url = `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`;
      const r = await fetch(url);
      const d = await r.json();

      return res.json({ status: "ok", messages: d });
    } catch {
      return res.json({ status: "error" });
    }
  }

  // ================= READ =================
  if (type === "read") {
    try {
      const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`;
      const r = await fetch(url);
      const d = await r.json();

      return res.json({ status: "ok", data: d });
    } catch {
      return res.json({ status: "error" });
    }
  }

  // ================= OTP =================
  if (type === "otp") {
    try {
      const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`;
      const r = await fetch(url);
      const d = await r.json();

      let body = d.body || "";
      let otp = body.match(/\b\d{4,8}\b/);

      return res.json({
        status: "ok",
        otp: otp ? otp[0] : null
      });
    } catch {
      return res.json({ status: "error" });
    }
  }

  return res.json({ status: "invalid" });
}
