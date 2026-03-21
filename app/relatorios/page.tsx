"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "../../lib/auth";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 CartesianGrid,
} from "recharts";
export default function Relatorios() {
 const router = useRouter();
 const [dados, setDados] = useState<any>(null);
 const [dataInicio, setDataInicio] = useState("");
 const [dataFim, setDataFim] = useState("");
 const [tipo, setTipo] = useState("todos");
 // 🔐 PROTEÇÃO
 useEffect(() => {
   const token = getToken();
   if (!token) {
     router.push("/");
   }
 }, []);
 // =========================
 // BUSCAR DADOS
 // =========================
 const buscar = async () => {
   try {
     const token = getToken();
     if (!token) {
       alert("Sessão expirada");
       router.push("/");
       return;
     }
     const res = await fetch(
       "https://estacionamento-production-fe0e.up.railway.app/relatorios",
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`, // ✅ CORRETO
         },
         body: JSON.stringify({
           data_inicio: dataInicio,
           data_fim: dataFim,
           tipo,
         }),
       }
     );
     const data = await res.json();
     if (!res.ok) {
       throw new Error(data.erro || "Erro na API");
     }
     setDados(data);
   } catch (err) {
     console.error(err);
     alert("Erro ao buscar dados");
   }
 };
 useEffect(() => {
   buscar();
 }, []);
 // 🔥 PICO
 const pico =
   dados?.por_hora?.length > 0
     ? dados.por_hora.reduce((a: any, b: any) =>
         a.total > b.total ? a : b
       )
     : null;
 return (
<div style={styles.container}>
     {/* HEADER */}
<div style={styles.header}>
<h1>📊 Relatórios</h1>
<div style={{ display: "flex", gap: 10 }}>
<button
           style={styles.btnSecundario}
           onClick={() => router.push("/dashboard")}
>
           ← Dashboard
</button>
<button
           style={{ ...styles.btnSecundario, background: "#ef4444" }}
           onClick={logout}
>
           Sair
</button>
</div>
</div>
     {/* FILTROS */}
<div style={styles.filtros}>
<input
         type="date"
         value={dataInicio}
         onChange={(e) => setDataInicio(e.target.value)}
         style={styles.input}
       />
<input
         type="date"
         value={dataFim}
         onChange={(e) => setDataFim(e.target.value)}
         style={styles.input}
       />
<select
         value={tipo}
         onChange={(e) => setTipo(e.target.value)}
         style={styles.input}
>
<option value="todos">Todos</option>
<option value="pequeno">Pequeno</option>
<option value="grande">Grande</option>
<option value="moto">Moto</option>
</select>
<button style={styles.btn} onClick={buscar}>
         Filtrar
</button>
</div>
     {/* CARDS */}
<div style={styles.cards}>
<div style={styles.card}>
<h3>🚗 Veículos</h3>
<p>{dados?.total_veiculos || 0}</p>
</div>
<div style={styles.card}>
<h3>💰 Faturamento</h3>
<p>R$ {dados?.valor_total?.toFixed(2) || "0.00"}</p>
</div>
</div>
     {/* PICO */}
     {pico && (
<div style={styles.pico}>
         🔥 Pico do dia: {pico.hora}:00
</div>
     )}
     {/* GRÁFICO HORA */}
<div style={styles.chartCard}>
<h3>📈 Movimento por Hora</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={dados?.por_hora || []}>
<CartesianGrid strokeDasharray="3 3" stroke="#333" />
<XAxis dataKey="hora" stroke="#aaa" />
<YAxis stroke="#aaa" />
<Tooltip />
<Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
     {/* GRÁFICO DIA */}
<div style={styles.chartCard}>
<h3>📅 Movimento por Dia</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={dados?.por_dia || []}>
<CartesianGrid strokeDasharray="3 3" stroke="#333" />
<XAxis dataKey="dia" stroke="#aaa" />
<YAxis stroke="#aaa" />
<Tooltip />
<Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
     {/* TOP MARCAS */}
<div style={styles.chartCard}>
<h3>🏆 Top Marcas</h3>
       {dados?.por_marca?.length > 0 ? (
         dados.por_marca.map((m: any, i: number) => (
<div key={i} style={styles.marcaItem}>
<span>
               {i + 1}. {m.marca}
</span>
<strong>{m.total}</strong>
</div>
         ))
       ) : (
<p style={{ opacity: 0.5 }}>Sem dados</p>
       )}
</div>
</div>
 );
}
// 🎨 ESTILO
const styles: any = {
 container: {
   minHeight: "100vh",
   background: "#0b1220",
   padding: 20,
   color: "#fff",
 },
 header: {
   display: "flex",
   justifyContent: "space-between",
   marginBottom: 20,
   alignItems: "center",
 },
 filtros: {
   display: "flex",
   gap: 10,
   marginBottom: 20,
   flexWrap: "wrap",
 },
 input: {
   padding: 10,
   borderRadius: 6,
   border: "1px solid #2a2f3a",
   background: "#111827",
   color: "#fff",
 },
 btn: {
   background: "#6366f1",
   padding: 10,
   border: "none",
   borderRadius: 6,
   cursor: "pointer",
   color: "#fff",
 },
 btnSecundario: {
   background: "#1f2937",
   padding: 10,
   border: "none",
   borderRadius: 6,
   color: "#fff",
   cursor: "pointer",
 },
 cards: {
   display: "flex",
   gap: 20,
   marginBottom: 20,
 },
 card: {
   flex: 1,
   background: "#111827",
   padding: 20,
   borderRadius: 10,
 },
 chartCard: {
   background: "#111827",
   padding: 20,
   borderRadius: 10,
   marginBottom: 20,
 },
 marcaItem: {
   display: "flex",
   justifyContent: "space-between",
   padding: "8px 0",
   borderBottom: "1px solid #1f2937",
 },
 pico: {
   marginBottom: 10,
   color: "#f59e0b",
 },
};
