import { createFileRoute } from "@tanstack/react-router";
import { CCProvider, useCC } from "@/lib/cc-state";
import { Gateway, LanguageSheet, Identity, Login, Signup } from "@/components/cc-flows";
import { AppShell } from "@/components/cc-shell";

export const Route = createFileRoute("/")({
  component: Index,
});

function Router() {
  const { flow } = useCC();
  switch (flow) {
    case "gateway": return <Gateway />;
    case "language": return <LanguageSheet />;
    case "identity": return <Identity />;
    case "login": return <Login />;
    case "signup": return <Signup />;
    case "app": return <AppShell />;
  }
}

function Index() {
  return (
    <CCProvider>
      <Router />
    </CCProvider>
  );
}
