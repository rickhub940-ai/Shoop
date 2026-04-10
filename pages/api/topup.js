import redeemvouchers from "@prakrit_m/tmn-voucher";
import { db } from "../../lib/db";

export default async function handler(req, res) {
  const { userId, voucherUrl } = req.body;

  if (!userId || !voucherUrl) {
    return res.json({ success: false, msg: "ข้อมูลไม่ครบ" });
  }

  // กันใช้ซ้ำ
  if (db.usedVouchers.includes(voucherUrl)) {
    return res.json({ success: false, msg: "ซองนี้ถูกใช้ไปแล้ว" });
  }

  try {
    const result = await redeemvouchers("0984839629", voucherUrl);

    if (result.success) {
      const amount = result.amount; // หน่วยสตางค์
      const baht = amount / 100;

      // ✅ เช็คขั้นต่ำ 10 บาท
      if (baht < 10) {
        return res.json({ success: false, msg: "ขั้นต่ำ 10 บาท" });
      }

      const user = db.users.find(u => u.discordId === userId);

      if (!user) {
        return res.json({ success: false, msg: "ไม่พบผู้ใช้" });
      }

      // เพิ่มพอยท์
      user.points += baht;

      // บันทึก
      db.usedVouchers.push(voucherUrl);

      db.topups.push({
        userId,
        amount: baht,
        time: Date.now()
      });

      return res.json({
        success: true,
        amount: baht,
        points: user.points
      });
    } else {
      return res.json({
        success: false,
        msg: result.message || "เติมไม่สำเร็จ"
      });
    }

  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "error" });
  }
    }
