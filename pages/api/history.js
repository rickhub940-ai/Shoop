import { db } from "../../lib/db";

export default function handler(req, res) {
  const { userId } = req.query;

  // ถ้าไม่ส่ง userId มา
  if (!userId) {
    return res.json([]);
  }

  // กรองเฉพาะของ user นี้
  const history = db.purchases.filter(p => p.userId === userId);

  res.json(history);
}
