"use client";
import { useEffect, useState } from "react";
export default function Relatorios() {
 const [dados, setDados] = useState<any>(null);
 const [dataInicio, setDataInicio] = useState("");
 const [dataFim, setDataFim] = useState("");
 const [tipo, setTipo] = useState("");
 async function buscarDados() {
   try {
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
     const json = await res.json();
     setDados(json);
   } catch {
     alert("Erro ao buscar relatórios");
   }
 }
 useEffect(() => {
   buscarDados();
 }, []);
 return (
<div style={styles.container}>
<h2>📊 Relatórios</h2>
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
<option value="">Todos</option>
<option value="pequeno">Pequeno</option>
<option value="grande">Grande</option>
<option value="moto">Moto</option>
</select>
<button onClick={buscarDados}>Filtrar</button>
</div>
     {/* KPIs */}
<div style={styles.kpis}>
<div style={styles.card}>
<h3>🚗 Veículos</h3>
<p>{dados?.total_veiculos || 0}</p>
</div>
<div style={styles.card}>
<h3>💰 Faturamento</h3>
<p>R$ {dados?.valor_total || 0}</p>
</div>
</div>
     {/* POR HORA */}
<div style={styles.card}>
<h3>📈 Movimento por Hora</h3>
       {dados?.por_hora?.map((h: any) => (
<div key={h.hora}>
           {h.hora}:00 → {h.total}
</div>
       ))}
</div>
     {/* POR DIA */}
<div style={styles.card}>
<h3>📅 Movimento por Dia</h3>
       {dados?.por_dia?.map((d: any) => (
<div key={d.data}>
           {d.data} → {d.total}
</div>
       ))}
</div>
     {/* MARCAS */}
<div style={styles.card}>
<h3>🏆 Top Marcas</h3>
       {dados?.por_marca?.map((m: any) => (
<div key={m.marca}>
           {m.marca} → {m.total}
</div>
       ))}
</div>
</div>
 );
}
const styles: any = {
 container: {
   minHeight: "100vh",
   padding: 20,
   background: "#0f0f0f",
   color: "#fff",
 },
 filtros: {
   display: "flex",
   gap: 10,
   marginBottom: 20,
 },
 kpis: {
   display: "flex",
   gap: 20,
   marginBottom: 20,
 },
 card: {
   background: "#1a1a1a",
   padding: 20,
   borderRadius: 10,
   marginBottom: 20,
 },
};