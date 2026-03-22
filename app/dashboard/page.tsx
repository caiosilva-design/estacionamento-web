"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "../../lib/auth";
export default function Dashboard() {
 const router = useRouter();
 // 🔐 proteção
 useEffect(() => {
   const token = getToken();
   if (!token) router.push("/");
 }, []);
 // =========================
 // STATE
 // =========================
 const [aba, setAba] = useState<"entrada" | "saida">("entrada");
 const [placa, setPlaca] = useState("");
 const [tipo, setTipo] = useState("carro_pequeno");
 const [marcaCodigo, setMarcaCodigo] = useState("");
 const [marcaNome, setMarcaNome] = useState("");
 const [modelo, setModelo] = useState("");
 const [marcas, setMarcas] = useState<any[]>([]);
 const [modelos, setModelos] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);
 const [ticketId, setTicketId] = useState("");
 const [placaSaida, setPlacaSaida] = useState("");
 const [previewSaida, setPreviewSaida] = useState<any>(null);
 const [ultimoTicket, setUltimoTicket] = useState<any>(null);
 const getApiTipo = () => (tipo === "moto" ? "motos" : "carros");
 // =========================
 // MARCAS
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
   setMarcaCodigo("");
   setMarcaNome("");
   setModelo("");
   setModelos([]);
 }, [tipo]);
 // =========================
 // MODELOS
 // =========================
 useEffect(() => {
   if (!marcaCodigo) return;
   async function buscarModelos() {
     try {
       const res = await fetch(
         `https://parallelum.com.br/fipe/api/v1/${getApiTipo()}/marcas/${marcaCodigo}/modelos`
       );
       const data = await res.json();
       setModelos(data?.modelos || []);
     } catch {
       setModelos([]);
     }
   }
   buscarModelos();
 }, [marcaCodigo]);
 // =========================
 // 🧾 IMPRESSÃO
 // =========================
 function imprimirTicket(dados: any) {
   const { tipo, placa, marca, modelo, entrada, saida, valor } = dados;
   const dataEntrada = new Date(entrada);
   const dia = dataEntrada.getDay();
   let fechamento = "18:00";
   if (dia === 6) fechamento = "16:00";
   const win = window.open("", "_blank");
   win.document.write(`
<html>
<body style="font-family: monospace; text-align:center; padding:20px">
<h2>🚗 ESTACIONAMENTO</h2>
<hr/>
<div>Placa: <b>${placa}</b></div>
<div>Marca: ${marca}</div>
<div>Modelo: ${modelo}</div>
<hr/>
         ${
           tipo === "entrada"
             ? `<div>Entrada: ${entrada}</div><div>Fechamento: ${fechamento}</div>`
             : `<div>Entrada: ${entrada}</div><div>Saída: ${saida}</div><hr/><h2>R$ ${valor}</h2>`
         }
<hr/>
<p>Obrigado 🙏</p>
</body>
</html>
   `);
   win.document.close();
   win.print();
   setUltimoTicket(dados);
 }
 // =========================
 // ENTRADA
 // =========================
 const gerarEntrada = async () => {
   const token = getToken();
   if (!token) return router.push("/");
   const res = await fetch(
     "https://estacionamento-production-fe0e.up.railway.app/entrada",
     {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({
         placa,
         marca: marcaNome,
         modelo,
         tipo_veiculo: tipo.includes("grande") ? "grande" : tipo.includes("moto") ? "moto" : "pequeno",
       }),
     }
   );
   const data = await res.json();
   imprimirTicket({
     tipo: "entrada",
     placa,
     marca: marcaNome,
     modelo,
     entrada: new Date().toLocaleString(),
   });
 };
 // =========================
 // SAÍDA (PREVIEW)
 // =========================
 const buscarSaida = async () => {
   const token = getToken();
   const res = await fetch(
     "https://estacionamento-production-fe0e.up.railway.app/saida",
     {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({
         ticket_id: ticketId || null,
         placa: placaSaida || null,
       }),
     }
   );
   const data = await res.json();
   setPreviewSaida(data);
 };
 // =========================
 // CONFIRMAR SAÍDA
 // =========================
 const confirmarSaida = () => {
   imprimirTicket({
     tipo: "saida",
     placa: previewSaida.placa,
     marca: previewSaida.marca,
     modelo: previewSaida.modelo,
     entrada: new Date(previewSaida.entrada).toLocaleString(),
     saida: new Date(previewSaida.saida).toLocaleString(),
     valor: previewSaida.valor,
   });
   setPreviewSaida(null);
 };
 // =========================
 // UI
 // =========================
 return (
<div style={styles.container}>
<h2>🚗 Estacionamento</h2>
<div style={styles.tabs}>
<button onClick={() => setAba("entrada")}>Entrada</button>
<button onClick={() => setAba("saida")}>Saída</button>
</div>
     {aba === "entrada" && (
<div style={styles.card}>
<input placeholder="Placa" onChange={(e) => setPlaca(e.target.value)} />
<select
           onChange={(e) => {
             const codigo = e.target.value;
             const nome = marcas.find((m) => m.codigo === codigo)?.nome || "";
             setMarcaCodigo(codigo);
             setMarcaNome(nome);
           }}
>
<option>Marca</option>
           {marcas.map((m) => (
<option key={m.codigo} value={m.codigo}>
               {m.nome}
</option>
           ))}
</select>
<select onChange={(e) => setModelo(e.target.value)}>
<option>Modelo</option>
           {modelos.map((m) => (
<option key={m.codigo}>{m.nome}</option>
           ))}
</select>
<button onClick={gerarEntrada}>Registrar</button>
</div>
     )}
     {aba === "saida" && (
<div style={styles.card}>
<input placeholder="Ticket ou placa" onChange={(e) => setPlacaSaida(e.target.value)} />
<button onClick={buscarSaida}>Buscar</button>
</div>
     )}
     {/* MODAL */}
     {previewSaida && (
<div style={styles.modal}>
<div style={styles.modalBox}>
<h3>Confirmar Saída</h3>
<p>{previewSaida.placa}</p>
<p>{previewSaida.marca}</p>
<p>{previewSaida.modelo}</p>
<h2>R$ {previewSaida.valor}</h2>
<button onClick={confirmarSaida}>Confirmar</button>
</div>
</div>
     )}
     {ultimoTicket && (
<button style={styles.reprint} onClick={() => imprimirTicket(ultimoTicket)}>
         🖨 Reimprimir
</button>
     )}
</div>
 );
}
const styles: any = {
 container: {
   height: "100vh",
   backgroundImage: "url('/bg.jpg')",
   backgroundSize: "cover",
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
 },
 input: {
   padding: 12,
   borderRadius: 8,
   border: "none",
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
   borderRadius: 8,
 },
 activeTab: {
   padding: 10,
   background: "#FFD700",
   border: "none",
   color: "#000",
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
   borderRadius: 8,
 },
 tipoAtivo: {
   flex: 1,
   padding: 10,
   background: "#FFD700",
   border: "none",
   color: "#000",
   borderRadius: 8,
 },
};
