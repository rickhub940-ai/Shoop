import { useRouter } from "next/router";

export default function Topup() {
  const router = useRouter();
  const { user } = router.query;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>เติมเงิน</h2>

      <button onClick={async () => {
        await fetch("/api/topup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId: user })
        });

        router.push(`/?user=${user}`);
      }}>
        เติม 50 พอยท์
      </button>
    </div>
  );
}
