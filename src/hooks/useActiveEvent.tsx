import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminEvent = {
  id: string;
  slug: string;
  name: string;
  edition: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  location: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  about_text: string | null;
  brand_logo_url: string | null;
  brand_color: string | null;
};

export function useActiveEvent() {
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setEvent(data as AdminEvent | null);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { event, loading, refetch };
}
