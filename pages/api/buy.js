import { db } from "../../lib/db";

export default function handler(req, res) {
  const { userId, productId } = req.body;

  const user = db.users.find(u => u.discordId === userId);
  const product = db.products.find(p => p.id === productId);
  const key = db.keys.find(k => k.productId === productId && !k.used);

  if (!user || !product || !key) {
    return res.json({ success: false });
  }

  if (user.points < product.price) {
    return res.json({ success: false, msg: "no_point" });
  }

  user.points -= product.price;
  key.used = true;

  db.purchases.push({
    userId,
    key: key.key
  });

  res.json({ success: true, key: key.key });
}
