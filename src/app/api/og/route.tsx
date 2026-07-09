import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Sassy's Bakery";
  const subtitle = searchParams.get("subtitle") ?? "Thorndale, Ontario";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#3d1f0a",
          fontFamily: "Georgia, serif",
          justifyContent: "flex-end",
          padding: "60px",
        }}
      >
        {/* Decorative pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(180,120,60,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(220,160,80,0.2) 0%, transparent 40%)",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              fontFamily: "Georgia, serif",
              color: "#d4a055",
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: title.length > 30 ? "52px" : "68px",
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              color: "#fdf8f0",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "8px",
            }}
          >
            <div style={{ width: "48px", height: "2px", backgroundColor: "#d4a055" }} />
            <div
              style={{
                fontSize: "18px",
                color: "#c8a87a",
                fontFamily: "Georgia, serif",
              }}
            >
              mysassys.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
