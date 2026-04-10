export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🔥 Script Shop</h1>
      <p>เว็บขายคีย์สคริปต์</p>

      <a href="/api/login">
        <button style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer"
        }}>
          Login with Discord
        </button>
      </a>
    </div>
  );
  }
