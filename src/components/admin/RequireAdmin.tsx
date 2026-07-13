import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, isStaff, loading, user } = useAuth();
  const [bootstrapTried, setBootstrapTried] = useState(false);

  // If signed in but no role yet, try to claim super-admin / first-admin without reload loops
  useEffect(() => {
    if (!loading && session && !isStaff && !bootstrapTried) {
      setBootstrapTried(true);
      (async () => {
        try { await supabase.rpc("claim_super_admin"); } catch {}
        try { await supabase.rpc("claim_first_admin"); } catch {}
        // Trigger a fresh role check by refreshing the session (no full page reload)
        await supabase.auth.refreshSession().catch(() => null);
      })();
    }
  }, [loading, session, isStaff, bootstrapTried]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="text-sm text-muted-foreground">
            Tu cuenta ({user?.email}) no tiene permisos de administrador.
            Pídele a un administrador que te otorgue acceso.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
