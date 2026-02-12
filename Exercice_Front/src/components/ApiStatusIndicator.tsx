import { useApiHealth } from "@/hooks/useApi";

export default function ApiStatusIndicator() {
  const { isSuccess, isError, isLoading } = useApiHealth();

  if (isLoading) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary"
        title="Vérification de la connexion à l’API…"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-text-secondary/40" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-text-secondary" />
        </span>
        <span className="hidden sm:inline">Connexion…</span>
      </span>
    );
  }

  if (isError) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs text-danger"
        title="L’API est injoignable. Vérifiez que le backend est démarré."
      >
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger" aria-hidden />
        <span className="hidden sm:inline">API hors ligne</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-success"
      title="Connexion à l’API OK"
    >
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" aria-hidden />
      <span className="hidden sm:inline">API connectée</span>
    </span>
  );
}
