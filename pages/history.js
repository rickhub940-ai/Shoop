import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function History() {
  const router = useRouter();
  const { user } = router.query;

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/history?userId=${user}`)
      .then(res => res.json())
      .then(setData);
  }, [user]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>ประวัติ</h2>

      {data.map((item, i) => (
        <div key={i}>
          <p>🔑 {item.key}</p>
        </div>
      ))}
    </div>
  );
                }
