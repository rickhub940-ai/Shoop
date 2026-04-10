import { db } from "../../lib/db";

export default function handler(req, res) {
  const { userId } = req.body;

  const user = db.users.find(u => u.discordId === userId);

  if (!user) return res.json({ success: false });

  user.points += 50; // จำลองเติมเงิน

  res.json({ success: true, points: user.points });
}
