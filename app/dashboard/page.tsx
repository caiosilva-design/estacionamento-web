"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "../../lib/auth";
export default function Dashboard() {
 const router = useRouter();
 useEffect(() => {
   const token = getToken();
   if (!token) router.push("/");
 }, []);
 // =========================
 // 🧾 IMPRESSÃO
 // =========================
 function imprimirTicket({ tipo, placa, marca, modelo, entrada, saida, valor }: any) {
   const dataEntrada = entrada ? new Date(entrada) : new Date();
   const dia = dataEntrada.getDay();
   let fechamento = "18:00";
   if (dia === 6) fechamento = "16:00";
   const win = window.open("", "_blank");
   if (!win) return;
   win.document.write(`
<html>
<body style="font-family: monospace; text-align:center; padding:20px">
<h2>🚗 ESTACIONAMENTO</h2>
<hr/>
<div>Placa: <b>${placa || "-"}</b></div>
<div>Marca: ${marca || "-"}</div>
<div>Modelo: ${modelo || "-"}</div>
<hr/>
         ${
           tipo === "entrada"
             ? `<div>Entrada: ${entrada || "-"}</div><div>Fechamento: ${fechamento}</div>`
             : `<div>Entrada: ${entrada || "-"}</div><div>Saída: ${saida || "-"}</div><hr/><h2>💰 R$ ${valor ?? "-"}</h2>`
         }
<hr/>
<p>Obrigado 🙏</p>
</body>
</html>
   `);
   win.document.close();
   win.print();
   setUltimoTicket({ tipo, placa, marca, modelo, entrada, saida, valor });
 }
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
 const [carrosPatio, setCarrosPatio] = useState<any[]>([]);
 const getApiTipo = () => (tipo === "moto" ? "motos" : "carros");
 // =========================
 // 🚗 PÁTIO
 // =========================
 useEffect(() => {
   if (aba !== "saida") return;
   async function buscarPatio() {
     try {
       const token = getToken();
       const res = await fetch(
         "https://estacionamento-production-fe0e.up.railway.app/abertos",
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );
       const data = await res.json();
       setCarrosPatio(Array.isArray(data) ? data : []);
     } catch {
       setCarrosPatio([]);
     }
   }
   buscarPatio();
 }, [aba]);
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
   if (!token) return router.push("/");
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
           marca: marcaNome,
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
     if (!res.ok || data?.erro) throw new Error();
     imprimirTicket({
       tipo: "entrada",
       placa,
       marca: marcaNome,
       modelo,
       entrada: new Date().toLocaleString(),
     });
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
   const token = getToken();
   if (!token) return router.push("/");
   if (!ticketId && !placaSaida) {
     alert("Digite o ID ou a placa");
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
     if (!res.ok || data?.erro) {
       alert(data?.erro || "Erro ao finalizar saída");
       return;
     }
     setPreviewSaida(data);
   } catch {
     alert("Erro na comunicação com o servidor");
   }
 };
 // =========================
 // CONFIRMAR SAÍDA
 // =========================
 const confirmarSaida = () => {
   if (!previewSaida) return;
   imprimirTicket({
     tipo: "saida",
     placa: previewSaida.placa || placaSaida,
     marca: previewSaida.marca,
     modelo: previewSaida.modelo,
     entrada: previewSaida.entrada,
     saida: previewSaida.saida,
     valor: previewSaida.valor,
   });
   setPreviewSaida(null);
   setTicketId("");
   setPlacaSaida("");
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
<button style={aba === "entrada" ? styles.activeTab : styles.tab} onClick={() => setAba("entrada")}>
         Entrada
</button>
<button style={aba === "saida" ? styles.activeTab : styles.tab} onClick={() => setAba("saida")}>
         Saída
</button>
</div>
     {/* ENTRADA */}
     {aba === "entrada" && (
<div style={styles.card}>
<h3>Entrada</h3>
<input placeholder="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} style={styles.input} />
<div style={styles.tipoContainer}>
           {["carro_pequeno", "carro_grande", "moto"].map((t) => (
<button key={t} onClick={() => setTipo(t)} style={tipo === t ? styles.tipoAtivo : styles.tipoBtn}>
               {t === "carro_pequeno" ? "Pequeno" : t === "carro_grande" ? "Grande" : "Moto"}
</button>
           ))}
</div>
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
<option key={m.codigo} value={m.codigo}>{m.nome}</option>
           ))}
</select>
<select value={modelo} onChange={(e) => setModelo(e.target.value)} style={styles.input}>
<option value="">Modelo</option>
           {modelos.map((m) => (
<option key={m.codigo} value={m.nome}>{m.nome}</option>
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
<input placeholder="ID do Ticket" value={ticketId} onChange={(e) => setTicketId(e.target.value)} style={styles.input} />
<input placeholder="OU Placa" value={placaSaida} onChange={(e) => setPlacaSaida(e.target.value)} style={styles.input} />
<button style={styles.btn} onClick={gerarSaida}>Finalizar</button>
         {/* PÁTIO FUNCIONANDO */}
<div style={{ marginTop: 10 }}>
<h4 style={{ fontSize: 14 }}>🚗 No pátio</h4>
           {carrosPatio.map((c, i) => (
<div
               key={i}
               style={{
                 padding: 8,
                 marginTop: 5,
                 background: "rgba(255,255,255,0.1)",
                 borderRadius: 6,
                 display: "flex",
                 justifyContent: "space-between",
                 alignItems: "center"
               }}
>
<span>{c.placa} - {c.marca}</span>
<button
                 style={{
                   background: "#FFD700",
                   border: "none",
                   padding: "4px 8px",
                   borderRadius: 6,
                   cursor: "pointer",
                   fontSize: 12
                 }}
                 onClick={() => {
                   setPlacaSaida(c.placa);
                   setTicketId("");
                 }}
>
                 Selecionar
</button>
</div>
           ))}
</div>
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
<button style={styles.btn} onClick={confirmarSaida}>Confirmar</button>
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
 container: { height: "100vh", backgroundImage: "url('/bg.jpg')", backgroundSize: "cover", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" },
 header: { position: "absolute", top: 20, width: "90%", display: "flex", justifyContent: "space-between" },
 relatorioBtn: { background: "#FFD700", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
 card: { backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.6)", padding: 25, borderRadius: 12, width: 320, display: "flex", flexDirection: "column", gap: 12 },
 input: { padding: 12, borderRadius: 8, border: "none" },
 btn: { background: "#FFD700", padding: 14, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
 tabs: { display: "flex", marginBottom: 20, gap: 10 },
 tab: { padding: 10, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8 },
 activeTab: { padding: 10, background: "#FFD700", border: "none", color: "#000", borderRadius: 8 },
 tipoContainer: { display: "flex", gap: 6 },
 tipoBtn: { flex: 1, padding: 10, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8 },
 tipoAtivo: { flex: 1, padding: 10, background: "#FFD700", border: "none", color: "#000", borderRadius: 8 },
 modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center" },
 modalBox: { background: "#111", padding: 20, borderRadius: 10, width: 300, textAlign: "center" },
 reprint: { position: "fixed", bottom: 20, right: 20, background: "#FFD700", border: "none", padding: 12, borderRadius: 8 },
};
