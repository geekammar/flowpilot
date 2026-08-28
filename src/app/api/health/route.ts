import pkg from "../../../../package.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    version: pkg.version,
    environment: process.env.NODE_ENV ?? "development",
  });
}
