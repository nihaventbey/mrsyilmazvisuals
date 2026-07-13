export async function GET() {
  return Response.json(
    { ok: true, service: "mrs-yilmaz-visuals", ts: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
