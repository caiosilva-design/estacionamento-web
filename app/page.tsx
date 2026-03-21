"use client";
import { useState, useEffect } from "react";
export default function Home() {
 const [aba, setAba] = useState<"entrada" | "saida">("entrada");
 // =========================
 // ENTRADA
 // =========================
 const [placa, setPlaca] = useState("");
 const [tipo, setTipo] = useState("carro_pequeno");
 const [marca, setMarca] = useState("");
 const [modelo, setModelo] = useState("");
 const [marcas, setMarcas] = useState<any[]>([]);
 const [modelos, setModelos] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);
 // =========================
 // SAÍDA
 // =========================
 const [ticketId, setTicketId] = useState("");
 const [placaSaida, setPlacaSaida] = useState("");
 const [modo, setModo] = useState<"auto" | "manual">("auto");
 const [valorManual, setValorManual] = useState("");
 const getApiTipo = () => {
   if (tipo === "moto") return "motos";
   return "carros";
 };
 // =========================
 // BUSCAR MARCAS
 // =========================
 useEffect(() => {
   async function buscarMarcas() {
     try {
       const res = await fetch(
         `https://parallelum.com.br/fipe/api/v1/${getApiTipo()}/marcas`
       );
       const data = await res.json();
       setMarcas(data || []);
     } catch {
       setMarcas([]);
     }
   }
   buscarMarcas();
   setMarca("");
   setModelo("");
   setModelos([]);
 }, [tipo]);
 // =========================
 // BUSCAR MODELOS
 // =========================
 useEffect(() => {
   if (!marca) return;
   async function buscarModelos() {
     try {
       const res = await fetch(
         `https://parallelum.com.br/fipe/api/v1/${getApiTipo()}/marcas/${marca}/modelos`
       );
       const data = await res.json();
       setModelos(data?.modelos || []);
     } catch {
       setModelos([]);
     }
   }
   buscarModelos();
 }, [marca]);
 // =========================
 // ENTRADA
 // =========================
 const gerarTicket = async () => {
   if (!placa) return alert("Digite a placa");
   setLoading(true);
   try {
     const res = await fetch(
       "https://estacionamento-production-fe0e.up.railway.app/entrada",
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           placa,
           marca,
           modelo,
           tipo_veiculo:
             tipo === "carro_pequeno"
               ? "pequeno"
               : tipo === "carro_grande"
               ? "grande"
               : "moto",
         }),
       }
     );
     const data = await res.json();
     if (!res.ok) throw new Error();
     alert(`✅ Ticket: ${data.ticket_id}`);
     setPlaca("");
     setMarca("");
     setModelo("");
   } catch {
     alert("Erro ao gerar ticket");
   } finally {
     setLoading(false);
   }
 };
 // =========================
 // SAÍDA
 // =========================
 const gerarSaida = async () => {
   if (!ticketId && !placaSaida)
     return alert("Digite ID ou placa");
   try {
     const res = await fetch(
       "https://estacionamento-production-fe0e.up.railway.app/saida",
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           ticket_id: ticketId || null,
           placa: placaSaida || null,
           modo,
           valor_manual: valorManual || null,
         }),
       }
     );
     const data = await res.json();
     const valor =
       data?.valor ||
       data?.price ||
       data?.valor_total ||
       data?.data?.valor ||
       null;
     if (valor !== null) {
       alert(`💰 R$ ${valor}`);
     } else {
       alert("Erro ao calcular valor");
     }
   } catch {
     alert("Erro na saída");
   }
 };
 // =========================
 // UI
 // =========================
 return (
<div style={styles.container}>
     {/* HEADER */}
<div style={styles.header}>
<h2>🚗 Estacionamento</h2>
<button
 style={styles.relatorioBtn}
 onClick={() => window.location.href = "/relatorios"}
>
 📊 Relatórios
</button>
</div>
     {/* TABS */}
<div style={styles.tabs}>
<button
         style={aba === "entrada" ? styles.activeTab : styles.tab}
         onClick={() => setAba("entrada")}
>
         Entrada
</button>
<button
         style={aba === "saida" ? styles.activeTab : styles.tab}
         onClick={() => setAba("saida")}
>
         Saída
</button>
</div>
     {/* ENTRADA */}
     {aba === "entrada" && (
<div style={styles.card}>
<h3>Entrada</h3>
<input
           placeholder="Placa"
           value={placa}
           onChange={(e) => setPlaca(e.target.value)}
           style={styles.input}
         />
<div style={styles.tipoContainer}>
           {["carro_pequeno", "carro_grande", "moto"].map((t) => (
<button
               key={t}
               onClick={() => setTipo(t)}
               style={tipo === t ? styles.tipoAtivo : styles.tipoBtn}
>
               {t === "carro_pequeno"
                 ? "Pequeno"
                 : t === "carro_grande"
                 ? "Grande"
                 : "Moto"}
</button>
           ))}
</div>
<select
           value={marca}
           onChange={(e) => setMarca(e.target.value)}
           style={styles.input}
>
<option value="">Marca</option>
           {marcas.map((m) => (
<option key={m.codigo} value={m.nome}>
               {m.nome}
</option>
           ))}
</select>
<select
           value={modelo}
           onChange={(e) => setModelo(e.target.value)}
           style={styles.input}
>
<option value="">Modelo</option>
           {modelos.map((m) => (
<option key={m.codigo} value={m.nome}>
               {m.nome}
</option>
           ))}
</select>
<button style={styles.btn} onClick={gerarTicket}>
           {loading ? "Gerando..." : "Registrar Entrada"}
</button>
</div>
     )}
     {/* SAÍDA */}
     {aba === "saida" && (
<div style={styles.card}>
<h3>Saída</h3>
<input
           placeholder="ID do Ticket"
           value={ticketId}
           onChange={(e) => setTicketId(e.target.value)}
           style={styles.input}
         />
<input
           placeholder="OU Placa"
           value={placaSaida}
           onChange={(e) => setPlacaSaida(e.target.value)}
           style={styles.input}
         />
<div style={styles.tipoContainer}>
<button
             style={modo === "auto" ? styles.tipoAtivo : styles.tipoBtn}
             onClick={() => setModo("auto")}
>
             Auto
</button>
<button
             style={modo === "manual" ? styles.tipoAtivo : styles.tipoBtn}
             onClick={() => setModo("manual")}
>
             Manual
</button>
</div>
         {modo === "manual" && (
<input
             placeholder="Valor manual"
             value={valorManual}
             onChange={(e) => setValorManual(e.target.value)}
             style={styles.input}
           />
         )}
<button style={styles.btn} onClick={gerarSaida}>
           Finalizar
</button>
</div>
     )}
</div>
 );
}
// =========================
// ESTILO TOP 🔥
// =========================
const styles: any = {
 container: {
   height: "100vh",
   backgroundImage: "url('/bg.jpg')",
   backgroundSize: "cover",
   backgroundPosition: "center",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   justifyContent: "center",
   color: "#fff",
 },
 header: {
   position: "absolute",
   top: 20,
   width: "90%",
   display: "flex",
   justifyContent: "space-between",
   alignItems: "center",
 },
 relatorioBtn: {
   background: "#FFD700",
   border: "none",
   padding: "10px 16px",
   borderRadius: 8,
   cursor: "pointer",
   fontWeight: "bold",
 },
 card: {
   backdropFilter: "blur(12px)",
   background: "rgba(0,0,0,0.6)",
   padding: 25,
   borderRadius: 12,
   width: 320,
   display: "flex",
   flexDirection: "column",
   gap: 12,
   boxShadow: "0 0 20px rgba(0,0,0,0.5)",
 },
 input: {
   padding: 12,
   borderRadius: 8,
   border: "none",
   background: "#fff",
   color: "#000",
 },
 btn: {
   background: "#FFD700",
   padding: 14,
   border: "none",
   borderRadius: 8,
   cursor: "pointer",
   fontWeight: "bold",
 },
 tabs: {
   display: "flex",
   marginBottom: 20,
   gap: 10,
 },
 tab: {
   padding: 10,
   background: "rgba(255,255,255,0.2)",
   border: "none",
   color: "#fff",
   cursor: "pointer",
   borderRadius: 8,
 },
 activeTab: {
   padding: 10,
   background: "#FFD700",
   border: "none",
   color: "#000",
   cursor: "pointer",
   borderRadius: 8,
 },
 tipoContainer: {
   display: "flex",
   gap: 6,
 },
 tipoBtn: {
   flex: 1,
   padding: 10,
   background: "rgba(255,255,255,0.2)",
   border: "none",
   color: "#fff",
   cursor: "pointer",
   borderRadius: 8,
 },
 tipoAtivo: {
   flex: 1,
   padding: 10,
   background: "#FFD700",
   border: "none",
   color: "#000",
   cursor: "pointer",
   borderRadius: 8,
 },
};
