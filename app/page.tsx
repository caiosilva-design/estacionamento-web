"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken } from "../lib/auth";
export default function LoginPage() {
 const router = useRouter();
 const [email, setEmail] = useState("");
 const [senha, setSenha] = useState("");
 const [loading, setLoading] = useState(false);
 // 🔐 AUTO LOGIN
 useEffect(() => {
   const token = getToken();
   if (token) {
     router.push("/dashboard");
   }
 }, []);
 const login = async () => {
   if (!email || !senha) return alert("Preencha tudo");
   setLoading(true);
   try {
     const res = await fetch(
       "https://estacionamento-production-fe0e.up.railway.app/login",
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ email, senha }),
       }
     );
     const data = await res.json();
     if (data.token) {
       setToken(data.token);
       router.push("/dashboard");
     } else {
       alert(data.erro || "Erro no login");
     }
   } catch {
     alert("Erro ao conectar API");
   } finally {
     setLoading(false);
   }
 };
 return (
<div style={styles.container}>
<div style={styles.card}>
<h1 style={{ textAlign: "center" }}>🚗 Estacionamento</h1>
<p style={{ textAlign: "center", opacity: 0.7 }}>
         Sistema inteligente de controle
</p>
<input
         placeholder="Email"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         style={styles.input}
       />
<input
         placeholder="Senha"
         type="password"
         value={senha}
         onChange={(e) => setSenha(e.target.value)}
         style={styles.input}
       />
<button onClick={login} style={styles.btn}>
         {loading ? "Entrando..." : "Entrar"}
</button>
<p style={{ fontSize: 12, opacity: 0.5, textAlign: "center" }}>
         Powered by SaaS 🚀
</p>
</div>
</div>
 );
}
// 🎨 ESTILO PROFISSIONAL
const styles: any = {
 container: {
   height: "100vh",
   display: "flex",
   justifyContent: "center",
   alignItems: "center",
   background:
     "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)",
 },
 card: {
   background: "rgba(15,23,42,0.9)",
   padding: 30,
   borderRadius: 16,
   width: 320,
   display: "flex",
   flexDirection: "column",
   gap: 12,
   color: "#fff",
   boxShadow: "0 0 40px rgba(0,0,0,0.6)",
   backdropFilter: "blur(10px)",
 },
 input: {
   padding: 12,
   borderRadius: 8,
   border: "1px solid #334155",
   background: "#020617",
   color: "#fff",
 },
 btn: {
   background: "#6366f1",
   padding: 14,
   border: "none",
   borderRadius: 8,
   cursor: "pointer",
   color: "#fff",
   fontWeight: "bold",
 },
};
