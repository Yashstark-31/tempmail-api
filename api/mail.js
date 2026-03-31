export default async function handler(req, res) {
  const { type, login, domain, id } = req.query;

  // 🔥 CREATE MAIL
  if (type === "new") {
    try {
      let r = await fetch("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1", {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      let d = await r.json();

      if (d && d[0]) {
        const email = d[0];
        const [login, domain] = email.split("@");

        return res.status(200).json({
          status: "ok",
          email,
          login,
          domain,
          token: login
        });
      }
    } catch (e) {
      console.log("1secmail failed");
    }

    // 🔥 FALLBACK (manual generate)
    const random = Math.random().toString(36).substring(2, 10);
    const domain = "1secmail.com";
    const email = `${random}@${domain}`;

    return res.status(200).json({
      status: "ok",
      email,
      login: random,
      domain,
      token: random
    });
  }

  // 📥 INBOX
  if (type === "inbox") {
    try {
      const url = `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`;
      let r = await fetch(url);
      let d = await r.json();

      return res.json({ status: "ok", messages: d });
    } catch (e) {
      return res.json({ status: "error" });
    }
  }

  // 📖 READ
  if (type === "read") {
    try {
      const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`;
      let r = await fetch(url);
      let d = await r.json();

      return res.json({ status: "ok", data: d });
    } catch (e) {
      return res.json({ status: "error" });
    }
  }

  // 🔐 OTP
  if (type === "otp") {
    try {
      const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`;
      let r = await fetch(url);
      let d = await r.json();

      let body = d.body || "";
      let otp = body.match(/\b\d{4,8}\b/);

      return res.json({
        status: "ok",
        otp: otp ? otp[0] : null
      });
    } catch (e) {
      return res.json({ status: "error" });
    }
  }

  return res.json({ status: "invalid_type" });
}
