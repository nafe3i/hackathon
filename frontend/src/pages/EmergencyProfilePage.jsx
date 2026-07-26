import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Navbar from "../components/shared/Navbar";
import { useAuth } from "../context/AuthContext";

export default function EmergencyProfilePage() {
  const { user } = useAuth(); const qrRef = useRef(null); const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/public/${user.public_id}`;
  const copy = async () => { await navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(()=>setCopied(false),1800); };
  const download = () => { const canvas=qrRef.current?.querySelector("canvas"); if(!canvas)return; const link=document.createElement("a");link.download=`bridge-${user.username}-qr.png`;link.href=canvas.toDataURL("image/png");link.click(); };
  return <main className="cards-page"><Navbar/><section className="cards-hero"><p className="eyebrow">Profil d’urgence</p><h1>Mon code QR</h1><p>Une personne peut le scanner pour comprendre comment vous aider.</p></section><section className="profile-qr-layout"><article className="qr-card"><div ref={qrRef} className="qr-frame"><QRCodeCanvas value={publicUrl} size={260} level="H" marginSize={2}/></div><h2>{user.username}</h2><p>Scannez pour ouvrir ma fiche d’aide</p><div className="qr-actions"><button onClick={download}>Télécharger le QR</button><button className="ghost" onClick={copy}>{copied?"Lien copié ✓":"Copier le lien"}</button></div></article><article className="panel privacy-panel"><h2>Informations affichées</h2><ul><li>Votre prénom ou pseudo</li><li>Uniquement les cartes marquées « publiques »</li><li>Les numéros des membres acceptés de votre réseau</li><li>Un chat Gemma 4 limité à ces informations</li></ul><p className="privacy-note">Vérifiez vos cartes publiques avant de partager ce QR. Une personne possédant le lien peut consulter cette fiche sans compte.</p><label>Lien public<input readOnly value={publicUrl}/></label></article></section></main>;
}
