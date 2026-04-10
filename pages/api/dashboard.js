import { useRouter } from "next/router";
import { useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { user } = router.query;

  const [msg, setMsg] = useState("");

  // เติมเงิน
  const topup = async () => {
    const voucher = prompt("ใส่ลิงก์ซอง");

    const res = await fetch("/api/topup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user,
        voucherUrl: voucher
      })
    });

    const data = await res.json();
    setMsg(JSON.stringify(data));
  };

  // ซื้อคีย์
  const buy = async () => {
    const res = await fetch("/api/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user,
        productId: "script1"
      })
    });

    const data = await res.json();
    setMsg(JSON.stringify(data));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Dashboard</h2>

      <p>User: {user}</p>

      <button onClick={topup}>💰 เติมเงิน</button>
      <br /><br />

      <button onClick={buy}>🛒 ซื้อคีย์</button>

      <h3>ผลลัพธ์:</h3>
      <pre>{msg}</pre>
    </div>
  );
    }
