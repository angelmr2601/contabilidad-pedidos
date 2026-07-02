import { NextResponse } from "next/server";
import { createServerSupabaseClient, getBearerToken } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    const supabase = createServerSupabaseClient(token);
    const { data: auth } = await supabase.auth.getUser(token ?? undefined);
    if (!auth.user) return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
    const body = await request.json();
    const expoPushToken = String(body.expoPushToken ?? "").trim();
    if (!/^ExponentPushToken\[.+\]$|^ExpoPushToken\[.+\]$/.test(expoPushToken)) return NextResponse.json({ ok: false, error: "Expo Push Token inválido." }, { status: 400 });
    const { error } = await supabase.from("push_tokens").upsert({ user_id: auth.user.id, expo_push_token: expoPushToken, platform: body.platform ?? "android", device_name: body.deviceName ?? null, updated_at: new Date().toISOString() }, { onConflict: "user_id,expo_push_token" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Error registrando token push." }, { status: 500 });
  }
}
