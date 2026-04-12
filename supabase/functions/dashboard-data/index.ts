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
    const { profileId } = await req.json();

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: "Missing profileId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify profile has valid plan
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profileId)
      .in("plan_status", ["pro", "anual", "active"])
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Invalid profile" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Current date info
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Build 14-day date range for weekly occupation
    const next14Days: string[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      next14Days.push(d.toISOString().split("T")[0]);
    }

    const [
      salasRes,
      gmsRes,
      reservasRes,
      todayReservasRes,
      totalReservasRes,
      // Monthly stats
      monthlyReservasRes,
      monthlyPlayersRes,
      // Next session
      nextSessionRes,
      // 14-day occupation
      occupationRes,
    ] = await Promise.all([
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
        .eq("date", today)
        .order("time", { ascending: true }),
      supabase
        .from("reservas")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId),
      // Monthly: count of real reservas this month (exclude cancelada & bloqueado)
      supabase
        .from("reservas")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .gte("date", monthStart)
        .lte("date", today)
        .not("status", "in", "(cancelada,bloqueado)"),
      // Monthly: sum players for revenue estimate
      supabase
        .from("reservas")
        .select("players")
        .eq("profile_id", profileId)
        .gte("date", monthStart)
        .lte("date", today)
        .not("status", "in", "(cancelada,bloqueado)"),
      // Next session today: first reserva with time >= now, not cancelled/blocked
      supabase
        .from("reservas")
        .select("*, salas(name), game_masters(name)")
        .eq("profile_id", profileId)
        .eq("date", today)
        .gte("time", currentTime)
        .not("status", "in", "(cancelada,bloqueado)")
        .order("time", { ascending: true })
        .limit(1)
        .maybeSingle(),
      // 14-day occupation: all reservas in range (exclude cancelada)
      supabase
        .from("reservas")
        .select("date, status")
        .eq("profile_id", profileId)
        .gte("date", next14Days[0])
        .lte("date", next14Days[next14Days.length - 1])
        .not("status", "eq", "cancelada"),
    ]);

    const salas = salasRes.data || [];
    const gameMasters = gmsRes.data || [];
    const reservations = reservasRes.data || [];
    const todayReservations = todayReservasRes.data || [];
    const activeRoomsCount = salas.filter((s: any) => s.active).length;

    const kpis = {
      totalReservations: totalReservasRes.count || 0,
      activeRooms: activeRoomsCount,
      totalRooms: salas.length,
      availableGameMasters: gameMasters.filter((gm: any) => gm.available).length,
      totalGameMasters: gameMasters.length,
    };

    // ── Monthly Stats ──
    const totalGroups = monthlyReservasRes.count || 0;
    const totalPlayers = (monthlyPlayersRes.data || []).reduce(
      (sum: number, r: any) => sum + (r.players || 0),
      0
    );
    // PROVISIONAL: hardcoded €20 per player. Replace with real pricing when available.
    const estimatedRevenue = totalPlayers * 20;
    // PROVISIONAL: simplified occupation estimate = groups / (active rooms * days in month)
    // Labeled as "estimada" so the UI can clearly mark it as approximate.
    const occupationEstimate =
      activeRoomsCount > 0
        ? Math.round((totalGroups / (activeRoomsCount * daysInMonth)) * 100)
        : 0;

    const monthlyStats = {
      totalGroups,
      estimatedRevenue,
      occupationEstimate, // percentage, clearly provisional
      isEstimated: true, // flag for UI to show "Estimada" label
    };

    // ── Next Session ──
    const nextSession = nextSessionRes.data || null;

    // ── Weekly Occupation (14 days) ──
    const occupationByDate: Record<string, number> = {};
    for (const r of occupationRes.data || []) {
      occupationByDate[r.date] = (occupationByDate[r.date] || 0) + 1;
    }
    const weeklyOccupation = next14Days.map((date) => ({
      date,
      count: occupationByDate[date] || 0,
      capacity: activeRoomsCount, // slots per day (provisional: 1 slot per room)
    }));

    return new Response(
      JSON.stringify({
        kpis,
        reservations,
        todayReservations,
        salas,
        gameMasters,
        monthlyStats,
        nextSession,
        weeklyOccupation,
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
