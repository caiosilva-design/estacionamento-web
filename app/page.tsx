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
 const melhorHora = dados?.por_hora?.reduce((a: any, b: any) =>
   a.total > b.total ? a : b
 );
 return (
<div style={styles.container}>
<h1>📊 Relatórios</h1>
     {/* FILTROS */}
<div style={styles.filtros}>
<input
         type="date"
         value={dataInicio}
         onChange={(e) => setDataInicio(e.target.value)}
       />
<input
         type="date"
         value={dataFim}
         onChange={(e) => setDataFim(e.target.value)}
       />
<select value={tipo} onChange={(e) => setTipo(e.target.value)}>
<option value="todos">Todos</option>
<option value="moto">Moto</option>
<option value="pequeno">Pequeno</option>
<option value="grande">Grande</option>
</select>
<button onClick={buscar}>Filtrar</button>
</div>
     {/* CARDS */}
<div style={styles.cards}>
<div style={styles.cardHighlight}>
<p>🚗 Veículos</p>
<h2>{dados?.total_veiculos || 0}</h2>
</div>
<div style={styles.cardHighlight}>
<p>💰 Faturamento</p>
<h2>
           R$ {dados?.valor_total?.toFixed(2) || "0.00"}
</h2>
</div>
</div>
     {/* INSIGHT */}
     {melhorHora && (
<p style={{ marginBottom: 20 }}>
         🔥 Pico do dia: {melhorHora.hora}:00
</p>
     )}
     {/* GRAFICO HORA */}
<div style={styles.chartCard}>
<h3>📈 Movimento por Hora</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={dados?.por_hora || []}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="hora" />
<YAxis />
<Tooltip />
<Bar dataKey="total" />
</BarChart>
</ResponsiveContainer>
</div>
     {/* GRAFICO DIA */}
<div style={styles.chartCard}>
<h3>📅 Movimento por Dia</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={dados?.por_dia || []}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="dia" />
<YAxis />
<Tooltip />
<Bar dataKey="total" />
</BarChart>
</ResponsiveContainer>
</div>
     {/* TOP MARCAS */}
<div style={styles.chartCard}>
<h3>🏆 Top Marcas</h3>
       {dados?.top_marcas?.map((m: any, i: number) => (
<div key={i} style={styles.marcaItem}>
<span>
             {i + 1}. {m.marca}
</span>
<strong>{m.total}</strong>
</div>
       ))}
</div>
</div>
 );
}
const styles: any = {
 container: {
   minHeight: "100vh",
   background: "#0f0f0f",
   color: "#fff",
   padding: 30,
 },
 filtros: {
   display: "flex",
   gap: 10,
   marginBottom: 20,
 },
 cards: {
   display: "flex",
   gap: 20,
   marginBottom: 20,
 },
 cardHighlight: {
   flex: 1,
   background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
   padding: 20,
   borderRadius: 12,
   boxShadow: "0 0 20px rgba(255,215,0,0.1)",
 },
 chartCard: {
   background: "#1a1a1a",
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
