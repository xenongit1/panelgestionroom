import { supabase } from "@/integrations/supabase/client";

export async function panelCrud(action: string, accessKey: string, extra: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke("panel-crud", {
    body: { action, accessKey, ...extra },
  });
  if (error) throw new Error("Error de conexión");
  if (data?.error) throw new Error(data.error);
  return data;
}
