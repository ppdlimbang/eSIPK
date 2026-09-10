import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ppdlimbang.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const response = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response(405, { message: "Kaedah tidak disokong." });

  const authorization = request.headers.get("Authorization");
  if (!authorization) return response(401, { message: "Sila log masuk semula." });

  const projectUrl = Deno.env.get("SUPABASE_URL")!;
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(projectUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return response(401, { message: "Sila log masuk semula." });

  const adminClient = createClient(projectUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: administrator } = await adminClient
    .from("esipk_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (administrator?.role !== "admin" || user.email?.toLowerCase() !== "admin@moe.gov.my") return response(403, { message: "Akses pentadbir diperlukan." });

  let payload: { schoolName?: string; schoolCode?: string; email?: string; password?: string };
  try { payload = await request.json(); }
  catch (_) { return response(400, { message: "Data pendaftaran tidak sah." }); }

  const schoolName = String(payload.schoolName || "").trim();
  const schoolCode = String(payload.schoolCode || "").trim().toUpperCase();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const isPpdManaged = schoolCode === "Y050" && schoolName.toLowerCase() === "flat pendidikan";
  if (!schoolName || !/^[A-Z0-9-]{3,20}$/.test(schoolCode) ||
      (!isPpdManaged && (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8))) {
    return response(400, { message: "Lengkapkan nama, kod sah, e-mel sah dan kata laluan sekurang-kurangnya 8 aksara." });
  }

  const displayName = `${schoolCode} ${schoolName}`;
  const { data: school, error: schoolError } = await adminClient
    .from("esipk_schools")
    .insert({ display_name: displayName, school_code: schoolCode, account_email: isPpdManaged ? null : email })
    .select("id, display_name")
    .single();
  if (schoolError) return response(409, { message: "Kod, e-mel atau nama sekolah telah digunakan." });
  if (isPpdManaged) return response(201, { school });

  const { data: createdUser, error: accountError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (accountError || !createdUser.user) {
    await adminClient.from("esipk_schools").delete().eq("id", school.id);
    return response(409, { message: "Akaun e-mel tidak dapat dicipta. Pastikan e-mel belum digunakan." });
  }

  const { error: profileError } = await adminClient
    .from("esipk_profiles")
    .insert({ id: createdUser.user.id, role: "school", school_id: school.id });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    await adminClient.from("esipk_schools").delete().eq("id", school.id);
    return response(500, { message: "Akaun tidak dapat dilengkapkan. Sila cuba lagi." });
  }

  return response(201, { school });
});
