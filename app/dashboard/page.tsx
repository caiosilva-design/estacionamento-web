"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "../../lib/auth";
export default function Dashboard() {
 const router = useRouter();
 // =========================
 // 🔐 PROTEÇÃO
 // =========================
 useEffect(() => {
   const token = getToken();
   if (!token) router.push("/");
 }, []);
 // =========================
 // 🧾 IMPRESSÃO
 // =========================
 function imprimirTicket({ tipo, placa, marca, modelo, entrada, saida, valor }: any) {
   const win = window.open("", "_blank");
   win.document.write(`
<html>
<head>
<title>Ticket</title>
<style>
           body { font-family: monospace; text-align: center; padding: 20px; }
           .linha { margin: 6px 0; }
           .destaque { font-size: 18px; font-weight: bold; }
</style>
</head>
<body>
<h2>🚗 ESTACIONAMENTO</h2>
<hr/>
<div class="linha">Placa: <b>${placa}</b></div>
<div class="linha">Marca: ${marca || "-"}</div>
<div class="linha">Modelo: ${modelo || "-"}</div>
<hr/>
         ${
           tipo === "entrada"
             ? `<div>Entrada: <b>${entrada}</b></div><div>Fechamento: 18:00</div>`
             : `<div>Entrada: ${entrada}</div><div>Saída: ${saida}</div><hr/><div class="destaque">💰 R$ ${valor}</div>`
         }
<hr/>
<p>Obrigado 🙏</p>
</body>
</html>
   `);
   win.document.close();
   win.print();
 }
 // =========================
 // STATE
 // =========================
 const [aba, setAba] = useState<"entrada" | "saida">("entrada");
 const [placa, setPlaca] = useState("");
 const [tipo, setTipo] = useState("carro_pequeno");
 // 🔥 CORREÇÃO AQUI
 const [marcaCodigo, setMarcaCodigo] = useState("");
 const [marcaNome, setMarcaNome] = useState("");
 const [modelo, setModelo] = useState("");
 const [marcas, setMarcas] = useState<any[]>([]);
 const [modelos, setModelos] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);
 const [ticketId, setTicketId] = useState("");
 const [placaSaida, setPlacaSaida] = useState("");
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
 // ENTRADA
 // =========================
 const gerarTicket = async () => {
   if (!placa) return alert("Digite a placa");
   const token = getToken();
   if (!token) {
     alert("Sessão expirada");
     router.push("/");
     return;
   }
   setLoading(true);
   try {
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
           marca: marcaNome, // 👈 NOME
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
     imprimirTicket({
       tipo: "entrada",
       placa,
       marca: marcaNome,
       modelo,
       entrada: new Date().toLocaleString(),
     });
     alert(`✅ Ticket: ${data.ticket_id}`);
     setPlaca("");
     setMarcaCodigo("");
     setMarcaNome("");
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
   if (!ticketId && !placaSaida) return alert("Digite ID ou placa");
   const token = getToken();
   if (!token) {
     alert("Sessão expirada");
     router.push("/");
     return;
   }
   try {
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
     if (data?.valor !== null) {
       imprimirTicket({
         tipo: "saida",
         placa: placaSaida,
         marca: data.marca,
         modelo: data.modelo,
         entrada: new Date(data.entrada).toLocaleString(),
         saida: new Date(data.saida).toLocaleString(),
         valor: data.valor,
       });
       alert(`💰 R$ ${data.valor}`);
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
<div style={styles.header}>
<h2>🚗 Estacionamento</h2>
<div style={{ display: "flex", gap: 10 }}>
<button style={styles.relatorioBtn} onClick={() => router.push("/relatorios")}>
           📊 Relatórios
</button>
<button
           style={{ ...styles.relatorioBtn, background: "#ef4444", color: "#fff" }}
           onClick={logout}
>
           🚪 Sair
</button>
</div>
</div>
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
         {/* 🔥 SELECT CORRETO */}
<select
           value={marcaCodigo}
           onChange={(e) => {
             const codigo = e.target.value;
             const nome = marcas.find((m) => m.codigo === codigo)?.nome || "";
             setMarcaCodigo(codigo);
             setMarcaNome(nome);
           }}
           style={styles.input}
>
<option value="">Marca</option>
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
<button style={styles.btn} onClick={gerarSaida}>
           Finalizar
</button>
</div>
     )}
</div>
 );
}
// =========================
// 🎨 ESTILO
// =========================
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
