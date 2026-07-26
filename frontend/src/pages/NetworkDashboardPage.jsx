import { useEffect, useState } from "react";
import { getAlerts, markAlertRead } from "../api/contactsApi";
import Navbar from "../components/shared/Navbar";

export default function NetworkDashboardPage() {
  const [alerts, setAlerts] = useState([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = () => getAlerts().then(setAlerts).catch((err) => setError(err.response?.data?.detail || "Impossible de charger les alertes.")).finally(() => setLoading(false));
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);
  const read = async (id) => { const updated = await markAlertRead(id); setAlerts((current) => current.map((item) => item.id === id ? updated : item)); };
  return <main className="cards-page"><Navbar/><section className="cards-hero"><p className="eyebrow">Réseau de confiance</p><h1>Alertes reçues</h1><p>Cette page se met à jour automatiquement.</p></section><section className="alerts-container">{error&&<p className="error">{error}</p>}{loading?<div className="empty">Chargement…</div>:alerts.length===0?<div className="empty">Aucune alerte reçue.</div>:alerts.map((alert)=><article className={`received-alert ${alert.is_read?"read":"unread"}`} key={alert.id}><div><span className="alert-icon">!</span><div><strong>{alert.autiste_name} a besoin d’aide</strong><p>{alert.message}</p><small>{new Date(alert.created_at).toLocaleString("fr-FR")}</small></div></div>{!alert.is_read&&<button className="ghost" onClick={()=>read(alert.id)}>Marquer comme lue</button>}</article>)}</section></main>;
}
