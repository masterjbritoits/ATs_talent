import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-900/40 text-sky-400 text-4xl mx-auto">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Candidatura enviada!</h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          Obrigado pelo interesse na ITSector. A nossa equipa irá analisar o teu perfil e entrar em
          contacto em breve — normalmente dentro de 5 dias úteis.
        </p>
        <Link
          href="/careers"
          className="text-sm text-sky-400 hover:underline"
        >
          ← Ver outras vagas
        </Link>
      </div>
    </div>
  );
}
