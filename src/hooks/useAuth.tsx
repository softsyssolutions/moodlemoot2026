import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isStaff: boolean;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  isStaff: false,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRole = async (uid: string | undefined) => {
    if (!uid) {
      setIsStaff(false);
      setIsAdmin(false);
      return;
    }
    const [{ data: rolesData }, { data: adminRpc }, { data: staffRpc }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.rpc("is_admin", { _user_id: uid }),
      supabase.rpc("is_staff_or_above", { _user_id: uid }),
    ]);
    const roles = (rolesData ?? []).map((r: any) => r.role);
    const admin = Boolean(adminRpc) || roles.includes("admin") || roles.includes("super_admin");
    const staff = Boolean(staffRpc) || admin || roles.length > 0;
    setIsAdmin(admin);
    setIsStaff(staff);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => checkRole(s?.user?.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      checkRole(data.session?.user?.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        isStaff,
        isAdmin,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
