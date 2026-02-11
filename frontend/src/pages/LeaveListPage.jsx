import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function LeaveListPage() {
const [leaves, setLeaves] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
(async () => {
try {
const res = await API.get("/personalleaves/${id}"); // เรียก API ดึงรายการใบลา
setLeaves(res.data);
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
})();
}, []);

if (loading) return <div style={{ paddingTop: 80 }}>กำลังโหลด...</div>;

return (
<div style={{ padding: 20 }}> <h2>รายการใบลาของพนักงาน</h2>
{leaves.length === 0 && <div>ยังไม่มีรายการใบลา</div>}
<ul style={{ listStyle: "none", padding: 0 }}>
{leaves.map((leave) => (
<li
key={leave.id}
style={{
marginBottom: 10,
padding: 15,
background: "#fff",
borderRadius: 10,
boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
}}
>
<Link
to={`/personalleaves/${leave.id}`}
style={{ textDecoration: "none", color: "#0f172a" }}
> <strong>ประเภท:</strong> {leave.type} | <strong>วันที่:</strong> {new Date(leave.startDate).toLocaleDateString("th-TH")} - {new Date(leave.endDate).toLocaleDateString("th-TH")} </Link> </li>
))} </ul> </div>
);
}
