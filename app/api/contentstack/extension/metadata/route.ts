import { NextResponse } from "next/server";

export async function GET() {
  const extensionUid =
    process.env.CONTENTSTACK_ENTRY_LOCK_METADATA_EXTENSION_UID || "";
  const contentstackAppDomain =
    process.env.CONTENTSTACK_DOMAIN || "";

  if (!extensionUid) {
    return NextResponse.json(
      { error: "Extension UID is not set" },
      { status: 500 }
    );
  }

  try {
    // Return the extension UID
    return NextResponse.json({
      extensionUid: extensionUid,
      contentstackAppDomain: contentstackAppDomain,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to decode token" },
      { status: 400 }
    );
  }
}
