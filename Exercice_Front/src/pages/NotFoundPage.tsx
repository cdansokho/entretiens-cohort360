import { Link } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card shadow-lg p-8 text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-hover text-text-secondary mb-4"
          aria-hidden
        >
          <FileQuestion size={28} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Page non trouvée</h1>
        <p className="text-sm text-text-secondary mb-6">
          L’adresse demandée n’existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition"
        >
          <Home size={18} />
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
