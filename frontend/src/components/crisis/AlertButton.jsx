import { useState } from "react";
import { broadcastAlert } from "../../api/contactsApi";

export default function AlertButton() {
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const send = async () => {
    if (!window.confirm("Envoyer une alerte à tous les membres de votre réseau ?")) return;
    setState("sending"); setMessage("");
    try { const result = await broadcastAlert(); setState("sent"); setMessage(`${result.message} (${result.recipients} personne${result.recipients > 1 ? "s" : ""})`); }
    catch (error) { setState("error"); setMessage(error.response?.data?.detail || "Impossible d’envoyer l’alerte."); }
  };
  return <div className="alert-widget"><button className={`alert-button ${state}`} onClick={send} disabled={state === "sending"}>{state === "sending" ? "Envoi…" : state === "sent" ? "Alerte envoyée ✓" : "J’ai un problème"}</button>{message && <div className={`alert-toast ${state}`}>{message}<button aria-label="Fermer" onClick={() => { setMessage(""); setState("idle"); }}>×</button></div>}</div>;
}
