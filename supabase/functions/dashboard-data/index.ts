import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key } = await req.json();

    if (!key) {
      return new Response(
        JSON.stringify({ error: "Missing access key" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get profile by key
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("access_key", key)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Invalid key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profileId = profile.id;

    // Fetch all data in parallel
    const [salasRes, gmsRes, reservasRes, todayReservasRes] = await Promise.all([
      supabase.from("salas").select("*").eq("profile_id", profileId),
      supabase.from("game_masters").select("*").eq("profile_id", profileId),
      supabase
        .from("reservas")
        .select("*, salas(name), game_masters(name)")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("reservas")
        .select("*, salas(name), game_masters(name)")
        .eq("profile_id", profileId)
        .eq("date", new Date().toISOString().split("T")[0])
        .order("time", { ascending: true }),
    ]);

    const salas = salasRes.data || [];
    const gameMasters = gmsRes.data || [];
    const reservations = reservasRes.data || [];
    const todayReservations = todayReservasRes.data || [];

    const kpis = {
      totalReservations: reservasRes.data?.length || 0,
      activeRooms: salas.filter((s: any) => s.active).length,
      totalRooms: salas.length,
      availableGameMasters: gameMasters.filter((gm: any) => gm.available).length,
      totalGameMasters: gameMasters.length,
    };

    return new Response(
      JSON.stringify({
        kpis,
        reservations,
        todayReservations,
        salas,
        gameMasters,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("dashboard-data error:", err);
    return new Response(
      JSON.stringify({ error: "Ha ocurrido un error en el servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
