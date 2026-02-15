import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Always fetch fresh
export const dynamic = 'force-dynamic';

// Run function closer to Supabase (Mumbai)
export const preferredRegion = 'bom1';

export async function GET() {
  try {
    // Fetch the latest metrics snapshot
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('metric_type', 'full_snapshot')
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching metrics:", error);
      return NextResponse.json(
        { error: "Failed to fetch metrics" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "No metrics available" },
        { status: 404 }
      );
    }

    // Return the metrics data
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
