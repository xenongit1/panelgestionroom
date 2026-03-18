import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_STATUSES = ["active", "pro", "anual"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessKey, email, password } = await req.json();

    if (!accessKey || !email || !password) {
      return new Response(
        JSON.stringify({ error: "missing_fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify access key exists and has valid plan
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, plan_status, email")
      .eq("access_key", accessKey)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "invalid_key" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.plan_status || !VALID_STATUSES.includes(profile.plan_status)) {
      return new Response(
        JSON.stringify({ error: "no_active_plan" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If profile already has an email, the owner already exists — they should log in
    if (profile.email) {
      return new Response(
        JSON.stringify({ error: "already_claimed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Profile has no email — truly first time. Create auth user.
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { access_key: accessKey },
    });

    if (createError) {
      if (createError.message?.includes("already been registered")) {
        return new Response(
          JSON.stringify({ error: "email_taken" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = newUser.user.id;

    // Delete the auto-created profile from the handle_new_user trigger
    await supabase.from("profiles").delete().eq("id", newUserId);

    // Update the original profile to link to the new auth user
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ id: newUserId, email })
      .eq("access_key", accessKey);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "link_failed", details: updateError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
