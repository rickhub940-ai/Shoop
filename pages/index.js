import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { user } = router.query;

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>Script Shop</h1>
        <a href="/api/login">
          <button>Login</button>
        </a>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>สินค้า</h2>

      <p>Aimbot Script - 50</p>

      <button onClick={() => {
        router.push(`/buy?user=${user}`);
      }}>
        ซื้อ
      </button>

      <br /><br />

      <button onClick={() => {
        router.push(`/history?user=${user}`);
      }}>
        ประวัติ
      </button>
    </div>
  );
}
