"use client";
import { useState, useEffect } from "react";
export default function Home() {
 const [aba, setAba] = useState("entrada");
 // ENTRADA
 const [placa, setPlaca] = useState("");
 const [tipo, setTipo] = useState("carro_pequeno");
 const [marca, setMarca] = useState("");
 const [modelo, setModelo] = useState("");
 const [marcas, setMarcas] = useState([]);
 const [modelos, setModelos] = useState([]);
 const [loading, setLoading] = useState(false);
 // SAÍDA
 const [ticketId, setTicketId] = useState("");
 const [placaSaida, setPlacaSaida] = useState("");
 const [modo, setModo] = useState("auto");
 const [valorManual, setValorManual] = useState("");
 const getApiTipo = () => {
   if (tipo === "moto") return "motos";
   return "carros";
 };
 // MARCAS
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
 // MODELOS
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
 // ENTRADA
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
     alert(`✅ Ticket gerado! ID: ${data.ticket_id}`);
     setPlaca("");
     setMarca("");
     setModelo("");
   } catch {
     alert("Erro ao gerar ticket");
   } finally {
     setLoading(false);
   }
 };
 // SAÍDA
 const gerarSaida = async () => {
   if (!ticketId && !placaSaida) {
     alert("Digite ID ou placa");
     return;
   }
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
     alert(`💰 Valor: R$ ${data.valor}`);
   } catch {
     alert("Erro na saída");
   }
 };
 return (
<div style={styles.container}>
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
     {aba === "entrada" && (
<div style={styles.card}>
<h3>Entrada de Veículo</h3>
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
                 ? "Carro Pequeno"
                 : t === "carro_grande"
                 ? "Carro Grande"
                 : "Moto"}
</button>
           ))}
</div>
<select
           value={marca}
           onChange={(e) => setMarca(e.target.value)}
           style={styles.input}
>
<option value="">Selecione a marca</option>
           {marcas.map((m) => (
<option key={m.codigo} value={m.codigo}>
               {m.nome}
</option>
           ))}
</select>
<select
           value={modelo}
           onChange={(e) => setModelo(e.target.value)}
           style={styles.input}
>
<option value="">Selecione o modelo</option>
           {modelos.map((m) => (
<option key={m.codigo} value={m.nome}>
               {m.nome}
</option>
           ))}
</select>
<button style={styles.btn} onClick={gerarTicket}>
           {loading ? "Gerando..." : "Gerar Ticket"}
</button>
</div>
     )}
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
const styles = {
 container: {
   height: "100vh",
   background: "#0f0f0f",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   justifyContent: "center",
   color: "#fff",
 },
 card: {
   background: "#1a1a1a",
   padding: 20,
   borderRadius: 10,
   width: 300,
   display: "flex",
   flexDirection: "column",
   gap: 10,
 },
 input: {
   padding: 10,
   borderRadius: 6,
   border: "1px solid #444",
   background: "#fff",
   color: "#000",
 },
 btn: {
   background: "#FFD700",
   padding: 12,
   border: "none",
   borderRadius: 6,
   cursor: "pointer",
   fontWeight: "bold",
 },
 tabs: {
   display: "flex",
   marginBottom: 20,
 },
 tab: {
   padding: 10,
   background: "#555",
   border: "none",
   cursor: "pointer",
 },
 activeTab: {
   padding: 10,
   background: "#FFD700",
   border: "none",
   cursor: "pointer",
 },
 tipoContainer: {
   display: "flex",
   gap: 5,
 },
 tipoBtn: {
   flex: 1,
   padding: 10,
   background: "#555",
   border: "none",
   color: "#fff",
   cursor: "pointer",
 },
 tipoAtivo: {
   flex: 1,
   padding: 10,
   background: "#FFD700",
   border: "none",
   color: "#000",
   cursor: "pointer",
 },
};
