import axios from "axios";
import { db } from "../../lib/db";

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) return res.send("No code");

  const token = await axios.post("https://discord.com/api/oauth2/token",
    new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const userRes = await axios.get("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.data.access_token}` }
  });

  let user = db.users.find(u => u.discordId === userRes.data.id);

  if (!user) {
    user = {
      discordId: userRes.data.id,
      points: 0
    };
    db.users.push(user);
  }

  res.redirect(`/?user=${user.discordId}`);
}
