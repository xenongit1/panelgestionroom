import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyProfile(supabase: any, profileId: string): Promise<string | null> {
  if (!profileId) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .in("plan_status", ["pro", "anual", "active"])
    .maybeSingle();
  return data?.id || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, profileId } = body;

    if (!action || !profileId) {
      return json({ error: "missing_fields" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const verified = await verifyProfile(supabase, profileId);
    if (!verified) {
      return json({ error: "unauthorized" }, 403);
    }

    // ── SALAS ──
    if (action === "list-salas") {
      const { data, error } = await supabase
        .from("salas")
        .select("*")
        .eq("profile_id", verified)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ data });
    }

    if (action === "create-sala") {
      const { name, theme, difficulty, capacity, active } = body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return json({ error: "name_required" }, 400);
      }
      const { data, error } = await supabase
        .from("salas")
        .insert({
          profile_id: verified,
          name: name.trim().slice(0, 100),
          theme: theme?.trim()?.slice(0, 100) || null,
          difficulty: Math.min(Math.max(Number(difficulty) || 3, 1), 5),
          capacity: Math.min(Math.max(Number(capacity) || 6, 1), 50),
          active: active !== false,
        })
        .select()
        .single();
      if (error) throw error;
      return json({ data });
    }

    if (action === "update-sala") {
      const { id, ...fields } = body;
      if (!id) return json({ error: "id_required" }, 400);
      const update: any = {};
      if (fields.name !== undefined) update.name = String(fields.name).trim().slice(0, 100);
      if (fields.theme !== undefined) update.theme = fields.theme?.trim()?.slice(0, 100) || null;
      if (fields.difficulty !== undefined) update.difficulty = Math.min(Math.max(Number(fields.difficulty) || 3, 1), 5);
      if (fields.capacity !== undefined) update.capacity = Math.min(Math.max(Number(fields.capacity) || 6, 1), 50);
      if (fields.active !== undefined) update.active = !!fields.active;

      const { data, error } = await supabase
        .from("salas")
        .update(update)
        .eq("id", id)
        .eq("profile_id", verified)
        .select()
        .single();
      if (error) throw error;
      return json({ data });
    }

    if (action === "delete-sala") {
      const { id } = body;
      if (!id) return json({ error: "id_required" }, 400);
      const { error } = await supabase
        .from("salas")
        .delete()
        .eq("id", id)
        .eq("profile_id", verified);
      if (error) throw error;
      return json({ success: true });
    }

    // ── RESERVAS ──
    if (action === "list-reservas") {
      const { data, error } = await supabase
        .from("reservas")
        .select("*, salas(name), game_masters(name)")
        .eq("profile_id", verified)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ data });
    }

    if (action === "create-reserva") {
      const { client_name, sala_id, date, time, game_master_id, players, status } = body;
      if (!client_name || !sala_id || !date || !time) {
        return json({ error: "missing_fields" }, 400);
      }
      const { data, error } = await supabase
        .from("reservas")
        .insert({
          profile_id: verified,
          client_name: String(client_name).trim().slice(0, 100),
          sala_id,
          date,
          time,
          game_master_id: game_master_id || null,
          players: Math.min(Math.max(Number(players) || 1, 1), 50),
          status: ["pendiente", "confirmada", "cancelada"].includes(status) ? status : "pendiente",
        })
        .select("*, salas(name), game_masters(name)")
        .single();
      if (error) throw error;
      return json({ data });
    }

    if (action === "update-reserva") {
      const { id, ...fields } = body;
      if (!id) return json({ error: "id_required" }, 400);
      const update: any = {};
      if (fields.client_name !== undefined) update.client_name = String(fields.client_name).trim().slice(0, 100);
      if (fields.sala_id !== undefined) update.sala_id = fields.sala_id;
      if (fields.date !== undefined) update.date = fields.date;
      if (fields.time !== undefined) update.time = fields.time;
      if (fields.game_master_id !== undefined) update.game_master_id = fields.game_master_id || null;
      if (fields.players !== undefined) update.players = Math.min(Math.max(Number(fields.players) || 1, 1), 50);
      if (fields.status !== undefined && ["pendiente", "confirmada", "cancelada"].includes(fields.status)) {
        update.status = fields.status;
      }

      const { data, error } = await supabase
        .from("reservas")
        .update(update)
        .eq("id", id)
        .eq("profile_id", verified)
        .select("*, salas(name), game_masters(name)")
        .single();
      if (error) throw error;
      return json({ data });
    }

    if (action === "delete-reserva") {
      const { id } = body;
      if (!id) return json({ error: "id_required" }, 400);
      const { error } = await supabase
        .from("reservas")
        .delete()
        .eq("id", id)
        .eq("profile_id", verified);
      if (error) throw error;
      return json({ success: true });
    }

    // ── GAME MASTERS ──
    if (action === "list-game-masters") {
      const { data, error } = await supabase
        .from("game_masters")
        .select("*")
        .eq("profile_id", verified)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ data });
    }

    if (action === "create-game-master") {
      const { name, available } = body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return json({ error: "name_required" }, 400);
      }
      const { data, error } = await supabase
        .from("game_masters")
        .insert({
          profile_id: verified,
          name: name.trim().slice(0, 100),
          available: available !== false,
        })
        .select()
        .single();
      if (error) throw error;
      return json({ data });
    }

    if (action === "update-game-master") {
      const { id, ...fields } = body;
      if (!id) return json({ error: "id_required" }, 400);
      const update: any = {};
      if (fields.name !== undefined) update.name = String(fields.name).trim().slice(0, 100);
      if (fields.available !== undefined) update.available = !!fields.available;

      const { data, error } = await supabase
        .from("game_masters")
        .update(update)
        .eq("id", id)
        .eq("profile_id", verified)
        .select()
        .single();
      if (error) throw error;
      return json({ data });
    }

    if (action === "delete-game-master") {
      const { id } = body;
      if (!id) return json({ error: "id_required" }, 400);
      const { error } = await supabase
        .from("game_masters")
        .delete()
        .eq("id", id)
        .eq("profile_id", verified);
      if (error) throw error;
      return json({ success: true });
    }

    // ── PROFILE UPDATE ──
    if (action === "update-profile") {
      const { company_name } = body;
      if (!company_name || typeof company_name !== "string" || company_name.trim().length === 0) {
        return json({ error: "company_name_required" }, 400);
      }
      const { data, error } = await supabase
        .from("profiles")
        .update({ company_name: company_name.trim().slice(0, 100) })
        .eq("id", verified)
        .select("id, company_name")
        .single();
      if (error) throw error;
      return json({ data });
    }

    return json({ error: "invalid_action" }, 400);
  } catch (err) {
    console.error("panel-crud error:", err);
    return json({ error: "Ha ocurrido un error en el servidor" }, 500);
  }
});
