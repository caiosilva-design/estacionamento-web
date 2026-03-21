"use client";
import { useEffect, useState } from "react";
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
 const [loading, setLoading] = useState(true);
 const [dataInicio, setDataInicio] = useState("");
 const [dataFim, setDataFim] = useState("");
 const [tipo, setTipo] = useState("todos");
 const buscar = async () => {
   setLoading(true);
   const res = await fetch(
     "https://estacionamento-production-fe0e.up.railway.app/relatorios",
     {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         data_inicio: dataInicio,
         data_fim: dataFim,
         tipo,
       }),
     }
   );
   const data = await res.json();
   setDados(data);
   setLoading(false);
 };
 useEffect(() => {
   buscar();
 }, []);
 const melhorHora = dados?.por_hora?.reduce((a: any, b: any) =>
   a.total > b.total ? a : b
 );
 return (
<div style={styles.container}>
     {/* HEADER */}
<div style={styles.header}>
<button
         onClick={() => (window.location.href = "/")}
         style={styles.voltar}
>
         ← Início
</button>
<h1>📊 Relatórios</h1>
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
<option value="moto">Moto</option>
<option value="pequeno">Pequeno</option>
<option value="grande">Grande</option>
</select>
<button style={styles.filtroBtn} onClick={buscar}>
         Filtrar
</button>
</div>
     {loading ? (
<p style={{ opacity: 0.6 }}>Carregando dados...</p>
     ) : (
<>
         {/* CARDS */}
<div style={styles.cards}>
<div style={styles.card}>
<p>🚗 Veículos</p>
<h2>{dados?.total_veiculos || 0}</h2>
</div>
<div style={styles.card}>
<p>💰 Faturamento</p>
<h2>R$ {dados?.valor_total?.toFixed(2) || "0.00"}</h2>
</div>
</div>
         {/* INSIGHT */}
         {melhorHora && (
<p style={styles.insight}>
             🔥 Pico do dia: {melhorHora.hora}:00
</p>
         )}
         {/* GRAFICO HORA */}
<div style={styles.chartCard}>
<h3>📈 Movimento por Hora</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={dados?.por_hora || []}>
<CartesianGrid stroke="#333" strokeDasharray="3 3" />
<XAxis dataKey="hora" stroke="#aaa" />
<YAxis stroke="#aaa" />
<Tooltip
                 contentStyle={{
                   background: "#1f1f1f",
                   border: "none",
                   color: "#fff",
                 }}
               />
<Bar
                 dataKey="total"
                 fill="#FFD700"
                 radius={[6, 6, 0, 0]}
               />
</BarChart>
</ResponsiveContainer>
</div>
         {/* GRAFICO DIA */}
<div style={styles.chartCard}>
<h3>📅 Movimento por Dia</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={dados?.por_dia || []}>
<CartesianGrid stroke="#333" strokeDasharray="3 3" />
<XAxis dataKey="dia" stroke="#aaa" />
<YAxis stroke="#aaa" />
<Tooltip
                 contentStyle={{
                   background: "#1f1f1f",
                   border: "none",
                   color: "#fff",
                 }}
               />
<Bar
                 dataKey="total"
                 fill="#00C49F"
                 radius={[6, 6, 0, 0]}
               />
</BarChart>
</ResponsiveContainer>
</div>
         {/* TOP MARCAS */}
<div style={styles.chartCard}>
<h3>🏆 Top Marcas</h3>
           {dados?.top_marcas?.length > 0 ? (
             dados.top_marcas.map((m: any, i: number) => (
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
</>
     )}
</div>
 );
}
const styles: any = {
 container: {
   minHeight: "100vh",
   background: "linear-gradient(135deg, #0f0f0f, #1a1a1a)",
   color: "#fff",
   padding: 30,
 },
 header: {
   display: "flex",
   alignItems: "center",
   gap: 20,
   marginBottom: 20,
 },
 voltar: {
   padding: "10px 15px",
   background: "#FFD700",
   border: "none",
   borderRadius: 8,
   cursor: "pointer",
   fontWeight: "bold",
 },
 filtros: {
   display: "flex",
   gap: 10,
   marginBottom: 20,
 },
 input: {
   padding: 10,
   borderRadius: 6,
   border: "1px solid #333",
   background: "#1f1f1f",
   color: "#fff",
 },
 filtroBtn: {
   background: "#FFD700",
   border: "none",
   padding: "10px 15px",
   borderRadius: 6,
   cursor: "pointer",
   fontWeight: "bold",
 },
 cards: {
   display: "flex",
   gap: 20,
   marginBottom: 20,
 },
 card: {
   flex: 1,
   background: "linear-gradient(135deg, #1f1f1f, #2a2a2a)",
   padding: 20,
   borderRadius: 12,
   boxShadow: "0 0 20px rgba(255,215,0,0.1)",
 },
 insight: {
   marginBottom: 20,
   color: "#FFD700",
 },
 chartCard: {
   background: "#1f1f1f",
   padding: 20,
   borderRadius: 12,
   marginBottom: 20,
 },
 marcaItem: {
   display: "flex",
   justifyContent: "space-between",
   padding: "10px 0",
   borderBottom: "1px solid #333",
 },
};
