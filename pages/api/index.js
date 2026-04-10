import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { user } = router.query;

  // ❌ ยังไม่ login
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>🔥 Script Shop</h1>
        <a href="/api/login">
          <button>Login with Discord</button>
        </a>
      </div>
    );
  }

  // ✅ login แล้ว → แสดงสินค้า
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🛒 ร้านค้า</h2>

      <div style={{
        border: "1px solid white",
        padding: "20px",
        display: "inline-block"
      }}>
        <h3>Aimbot Script</h3>
        <p>ราคา: 50 พอยท์</p>

        <button onClick={() => {
          router.push(`/buy?user=${user}&product=script1`);
        }}>
          ซื้อ
        </button>
      </div>

      <br /><br />
      <button onClick={() => router.push(`/history?user=${user}`)}>
        📊 ประวัติ
      </button>
    </div>
  );
}
