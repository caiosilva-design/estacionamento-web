"use client";
import { useState } from "react";
export default function Estacionamento() {
 const [placa, setPlaca] = useState("");
 const [marca, setMarca] = useState("");
 const [modelo, setModelo] = useState("");
 const [tipo, setTipo] = useState("pequeno");
 const [ticketId, setTicketId] = useState("");
 const [resultado, setResultado] = useState<any>(null);
 const API = "https://SEU-BACKEND.railway.app";
 // 🟢 ENTRADA
 const gerarTicket = async () => {
   const res = await fetch(`${API}/entrada`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       placa,
       marca,
       modelo,
       tipo_veiculo: tipo,
     }),
   });
   const data = await res.json();
   alert(`Ticket gerado: ${data.ticket_id}`);
 };
 // 🔴 SAÍDA
 const calcularSaida = async () => {
   const res = await fetch(`${API}/saida`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       ticket_id: Number(ticketId),
     }),
   });
   const data = await res.json();
   setResultado(data);
 };
 return (
<div
     style={{
       minHeight: "100vh",
       background: "#000",
       color: "white",
       padding: "120px 20px",
     }}
>
<h1 style={{ marginBottom: "30px" }}>🅿️ Estacionamento</h1>
     {/* 🟢 ENTRADA */}
<div style={{ marginBottom: "40px" }}>
<h2>Entrada</h2>
<input
         placeholder="Placa"
         value={placa}
         onChange={(e) => setPlaca(e.target.value)}
       />
<input
         placeholder="Marca"
         value={marca}
         onChange={(e) => setMarca(e.target.value)}
       />
<input
         placeholder="Modelo"
         value={modelo}
         onChange={(e) => setModelo(e.target.value)}
       />
<select value={tipo} onChange={(e) => setTipo(e.target.value)}>
<option value="pequeno">Carro pequeno</option>
<option value="grande">Carro grande</option>
<option value="moto">Moto</option>
</select>
<button className="btnGold" onClick={gerarTicket}>
         Gerar Ticket
</button>
</div>
     {/* 🔴 SAÍDA */}
<div>
<h2>Saída</h2>
<input
         placeholder="ID do ticket"
         value={ticketId}
         onChange={(e) => setTicketId(e.target.value)}
       />
<button className="btnGold" onClick={calcularSaida}>
         Calcular Saída
</button>
       {resultado && (
<div style={{ marginTop: "20px" }}>
<p>Ticket: {resultado.ticket_id}</p>
<p>Valor: R$ {resultado.valor}</p>
</div>
       )}
</div>
</div>
 );
}