import { ImageResponse } from "next/og";

/** Default social-share image (1200x630) used by WhatsApp, Facebook, LinkedIn, X, Google Discover. */
export function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "72px",
                    background: "linear-gradient(135deg, #f2faf7 0%, #cfeadf 100%)",
                }}
            >
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#1b805c", letterSpacing: 4 }}>
                    NGO IN PATNA, BIHAR
                </div>
                <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: "#1b6180", marginTop: 24, lineHeight: 1.1 }}>
                    Shivam Jan Swasthya Evem Sarwangin Vikash Kendra
                </div>
                <div style={{ display: "flex", fontSize: 34, color: "#334155", marginTop: 28 }}>
                    Community health, sanitation, skills and education since 2004
                </div>
                <div style={{ display: "flex", width: 160, height: 10, marginTop: 40, borderRadius: 5, background: "#f29a1f" }} />
            </div>
        ),
        { width: 1200, height: 630 },
    );
}
