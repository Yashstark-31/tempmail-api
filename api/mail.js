export default async function handler(req, res) {
  const { type, token, id, login, domain } = req.query;

  // safe fetch
  async function getJson(url, options = {}) {
    try {
      const r = await fetch(url, options);
      const text = await r.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  try {

    // ================= NEW =================
    if (type === "new") {

      // 🔥 TRY mail.tm (best)
      const domains = await getJson("https://api.mail.tm/domains");

      if (domains && domains["hydra:member"]?.length) {
        const domain = domains["hydra:member"][0].domain;
        const login = Math.random().toString(36).substring(2, 10);
        const password = "pass123456";
        const address = `${login}@${domain}`;

        await fetch("https://api.mail.tm/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, password })
        });

        const tok = await getJson("https://api.mail.tm/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, password })
        });

        if (tok?.token) {
          return res.json({
            status: "ok",
            email: address,
            token: tok.token,
            provider: "mailtm"
          });
        }
      }

      // 🔥 FALLBACK (always works)
      const login2 = Math.random().toString(36).substring(2, 10);
      const domains2 = ["1secmail.com","1secmail.org","1secmail.net"];
      const domain2 = domains2[Math.floor(Math.random() * domains2.length)];

      return res.json({
        status: "ok",
        email: `${login2}@${domain2}`,
        login: login2,
        domain: domain2,
        provider: "1secmail"
      });
    }

    // ================= INBOX =================
    if (type === "inbox") {

      // mail.tm
      if (token) {
        const d = await getJson("https://api.mail.tm/messages", {
          headers: { Authorization: `Bearer ${token}` }
        });

        return res.json({
          status: "ok",
          messages: d?.["hydra:member"] || []
        });
      }

      // 1secmail
      if (login && domain) {
        const d = await getJson(
          `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`
        );

        return res.json({
          status: "ok",
          messages: d || []
        });
      }
    }

    // ================= READ =================
    if (type === "read") {

      if (token) {
        const d = await getJson(`https://api.mail.tm/messages/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        return res.json({ status: "ok", data: d || {} });
      }

      if (login && domain) {
        const d = await getJson(
          `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`
        );

        return res.json({ status: "ok", data: d || {} });
      }
    }

    // ================= OTP =================
    if (type === "otp") {

      let text = "";

      if (token) {
        const d = await getJson(`https://api.mail.tm/messages/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        text = (d?.text || "") + (d?.html || "");
      }

      if (login && domain) {
        const d = await getJson(
          `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`
        );
        text = d?.body || "";
      }

      const otp = text.match(/\b\d{4,8}\b/);

      return res.json({
        status: "ok",
        otp: otp ? otp[0] : null
      });
    }

    return res.json({ status: "invalid" });

  } catch (e) {
    return res.json({
      status: "error",
      msg: e.message
    });
  }
}
