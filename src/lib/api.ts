import { supabase } from "@/integrations/supabase/client";
import { getProfileId } from "@/lib/session";

export async function panelCrud(action: string, extra: Record<string, any> = {}) {
  const profileId = getProfileId();
  if (!profileId) throw new Error("Sin sesión activa");

  const { data, error } = await supabase.functions.invoke("panel-crud", {
    body: { action, profileId, ...extra },
  });
  if (error) throw new Error("Error de conexión");
  if (data?.error) throw new Error(data.error);
  return data;
}
