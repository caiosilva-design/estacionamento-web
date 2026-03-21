"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
 const [dados, setDados] = useState<any>(null);
 const [dataInicio, setDataInicio] = useState("");
 const [dataFim, setDataFim] = useState("");
 const [tipo, setTipo] = useState("todos");
 const buscar = async () => {
   const res = await fetch(
     "https://estacionamento-production-fe0e.up.railway.app/relatorios",
     {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         data_inicio: dataInicio,
         data_fim: dataFim,
         tipo,
       }),
     }
   );
   const data = await res.json();
   setDados(data);
 };
 useEffect(() => {
   buscar();
 }, []);
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
<Link href="/">
<button style={styles.btnSecundario}>← Início</button>
</Link>
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
<CartesianGrid strokeDasharray="3 3" stroke="#444" />
<XAxis dataKey="hora" stroke="#ccc" />
<YAxis stroke="#ccc" />
<Tooltip />
<Bar dataKey="total" fill="#FFD700" radius={[6, 6, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
     {/* GRÁFICO DIA */}
<div style={styles.chartCard}>
<h3>📅 Movimento por Dia</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={dados?.por_dia || []}>
<CartesianGrid strokeDasharray="3 3" stroke="#444" />
<XAxis dataKey="dia" stroke="#ccc" />
<YAxis stroke="#ccc" />
<Tooltip />
<Bar dataKey="total" fill="#00E5A8" radius={[6, 6, 0, 0]} />
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
const styles: any = {
 container: {
   minHeight: "100vh",
   background: "#0f0f0f",
   padding: 20,
   color: "#fff",
 },
 header: {
   display: "flex",
   justifyContent: "space-between",
   marginBottom: 20,
 },
 filtros: {
   display: "flex",
   gap: 10,
   marginBottom: 20,
 },
 input: {
   padding: 10,
   borderRadius: 6,
   border: "1px solid #444",
   background: "#1a1a1a",
   color: "#fff",
 },
 btn: {
   background: "#FFD700",
   padding: 10,
   border: "none",
   borderRadius: 6,
   cursor: "pointer",
   fontWeight: "bold",
 },
 btnSecundario: {
   background: "#333",
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
   background: "#1a1a1a",
   padding: 20,
   borderRadius: 10,
 },
 chartCard: {
   background: "#1a1a1a",
   padding: 20,
   borderRadius: 10,
   marginBottom: 20,
 },
 marcaItem: {
   display: "flex",
   justifyContent: "space-between",
   padding: "8px 0",
   borderBottom: "1px solid #333",
 },
 pico: {
   marginBottom: 10,
   color: "#FFD700",
 },
};
