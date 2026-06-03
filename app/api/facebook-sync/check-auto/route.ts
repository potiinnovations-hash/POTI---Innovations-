import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../firebase-lite";
import { doc, getDoc } from "firebase/firestore/lite";
import { runFacebookSync } from "../syncService";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
    if (!settingsDoc.exists()) {
      return NextResponse.json({ autoTriggered: false, reason: "Settings not found" });
    }

    const settings = settingsDoc.data() || {};
    const syncEnabled = settings.facebookSyncEnabled ?? false;
    
    if (!syncEnabled) {
      return NextResponse.json({ autoTriggered: false, reason: "Facebook sync is globally disabled" });
    }

    const lastSyncStr = settings.lastFacebookSyncTimestamp;
    let shouldSync = false;

    if (!lastSyncStr) {
      shouldSync = true;
    } else {
      const lastSyncDate = new Date(lastSyncStr);
      const diffMs = Date.now() - lastSyncDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours >= 3) {
        shouldSync = true;
      }
    }

    if (shouldSync) {
      // Trigger the sync process directly in the background (fire-and-forget)
      runFacebookSync(false).catch(err => console.error("Error triggering auto background sync:", err));

      return NextResponse.json({ autoTriggered: true, message: "Sync triggered in the background" });
    }

    return NextResponse.json({ autoTriggered: false, message: "Last sync was recent" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
