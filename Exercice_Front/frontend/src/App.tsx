import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrescriptionsPage from "./pages/PrescriptionsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrescriptionsPage />
    </QueryClientProvider>
  );
}
