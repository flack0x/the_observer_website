import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIdentifier, subscribeConfig } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting - 5 requests per minute per IP
    const clientId = getClientIdentifier(request);
    const { success, remaining } = rateLimit(`subscribe:${clientId}`, subscribeConfig);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": remaining.toString() },
        }
      );
    }

    const body = await request.json();
    const { email, locale = "en" } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: locale === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address" },
        { status: 400 }
      );
    }

    // Insert subscriber (upsert to handle re-subscriptions)
    const { error } = await supabase
      .from("subscribers")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          locale,
          is_active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        {
          onConflict: "email",
        }
      );

    if (error) {
      console.error("Subscription error:", error);
      return NextResponse.json(
        { error: locale === "ar" ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: locale === "ar"
        ? "تم الاشتراك بنجاح!"
        : "Successfully subscribed!",
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
