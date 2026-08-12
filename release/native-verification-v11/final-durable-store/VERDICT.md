# Final Android native verification — ACCEPTABLE

- Frozen APK: `release/artifacts/mili-beads-android-test.apk`
- SHA-256: `f8071bc688dea51e0c08d86d42fed25ae20157c9211b7298d4bbd2004e702d90`
- Device: Android 15 / API 35 emulator, 1080×2400 @ 420 dpi
- Result: **ACCEPTABLE for this Debug APK**
- Verification was read-only with respect to product source and the frozen release artifact: no source edit, Capacitor sync, or product rebuild was performed. The requested `connectedDebugAndroidTest` invocation ran with product packaging tasks `UP-TO-DATE`; the frozen release artifact's hash was identical before and after.

## Results

1. **Clean install, brand, offline launch, privacy — PASS**
   - Clean uninstall/install and `pm clear` were performed.
   - Launcher label/icon show “米粒拼豆社” and the branded cat avatar.
   - Launch recording captures the branded native splash and in-app branded header.
   - With airplane mode enabled, Wi-Fi disabled, and mobile data disabled, the app launched with `LaunchState: COLD`; the complete home UI and bundled assets loaded without fatal or missing-asset evidence.
   - The in-app parent/privacy page is reachable and contains the expected local-storage, no-collection, parent-share, deletion, and adult ironing/cutting disclosures.
   - Evidence: `01-*`, `02-*`, `03-*`, `04-*`.

2. **One-bead durable save, native write return then immediate force-stop ×3 — PASS**
   - Each run began with an independent clean app-data reset.
   - The harness wrapped `Capacitor.nativePromise` and marked completion only when native `DurableStore.set({key: "mili-game-v3"})` resolved.
   - The app was force-stopped about 29–42 ms after the marker, then genuinely COLD-started.
   - All three runs restored `1/170`, `1/2`, and `墨黑 1/37`; the durable XML contained the exact one-bead board.
   - Evidence: `05-one-bead-return-1/`, `05-one-bead-return-2/`, `05-one-bead-return-3/`.

3. **Legacy CapacitorStorage migration and cleanup — PASS**
   - Valid legacy v3 migrated into `MiliDurableStore`, restored the one-bead board, set `mili-game-legacy-clean-v1=1`, and cleared the entire `CapacitorStorage` group including an unrelated sentinel key.
   - With malformed legacy v3 and intact legacy v2, migration correctly fell back to v2, restored the bead, wrote the new canonical store, set the cleanup marker, and cleared the complete old group.
   - Evidence: `06-migrate-v3/`, `06-migrate-v2-fallback/`.

4. **Legacy tombstone plus old save — PASS**
   - Seeded old `CapacitorStorage` with the legacy delete tombstone, a one-bead v3 save, and an unrelated sentinel; also seeded stale one-bead WebView localStorage.
   - COLD startup did not expose the old work: it converged to `0/170`, `0/2`, `墨黑 0/37`, wrote a durable empty canonical snapshot, retired the tombstone, set legacy-clean, and cleared the whole legacy group.
   - Evidence: `07-legacy-tombstone/`.

5. **New durable tombstone return then immediate force-stop — PASS**
   - Began from a proven durable one-bead save.
   - Used the real in-app privacy delete action and real confirmation dialog.
   - The harness emitted a CDP binding only after native `DurableStore.set` for `mili-game-delete-pending-v1` resolved, then deliberately blocked further JavaScript so the old one-bead save and new tombstone coexisted.
   - Force-stop occurred about 38 ms later. The killed-state XML proves both records were present.
   - COLD restart honored the tombstone and converged to a durable empty save with `0/170`, `0/2`, `墨黑 0/37`; no record resurrected.
   - Evidence: `08-delete-tombstone-return/`.

6. **UI-cleared acknowledgement then immediate force-stop — PASS**
   - The accepted redo first proves the one bead was durably stored, then deletes it through the real privacy flow.
   - A rendering observer acknowledged the fully ready empty home UI; force-stop followed about 46 ms later.
   - COLD restart remained empty in both UI and `MiliDurableStore`.
   - Evidence: `09-delete-ui-ack-redo/`.
   - `09-delete-ui-ack/` is a superseded automation attempt: its delete/restart result was empty, but its precondition log had a Node `document`-scope error. It is intentionally not the acceptance basis.

7. **Parent gate, system share, FileProvider, generated PNG — PASS**
   - Generated print poster reports and decodes to 1200×1500.
   - A 1500 ms hold opened the parent gate. The sampled challenge was `251 × 31`; both operands are within the required ranges `237–792 × 24–88`, and the correct answer was submitted.
   - The real Android system Sharesheet opened (`com.android.intentresolver`), displayed the image preview and targets including Quick Share, Print, and Drive.
   - System activity state grants read permission to `content://family.mili.beads.fileprovider/...`.
   - The actual shared cache file was extracted and independently identified as a 1200×1500 RGBA PNG.
   - Evidence: `10-parent-share/`.

8. **Android instrumentation — PASS, 3/3**
   - `:app:connectedDebugAndroidTest --offline` completed successfully.
   - Result XML: `tests="3" failures="0" errors="0" skipped="0"`.
   - Tests cover release application ID, synchronous DurableStore commit/legacy-group clearing, and visible Capacitor WebView launch.
   - Evidence: `11-instrumentation/connectedDebugAndroidTest.txt`, `11-instrumentation/results.xml`.

## Boundaries and environment notes

- This verdict applies only to the exact Debug APK hash above on the tested Android 15 emulator; it is not a Play signing, release-variant, physical-device, performance, accessibility, or iOS certification.
- An externally started instrumentation run briefly uninstalled the app before one planned run 2 had begun. That environment collision is recorded in `05-run2-environment-recovery.txt`; it was isolated, the same frozen APK was reinstalled, and runs 2 and 3 were restarted from clean data. No interrupted result was counted.
- An early one-bead harness tried wrapping the plugin Proxy method instead of Capacitor's native Promise boundary and timed out even though the native XML had saved correctly. It was superseded by the three accepted native-return-boundary runs and is not used as evidence.
- An initial share-state shell regex contained an unescaped brace and failed only the evidence grep. The already-open system Sharesheet, UI XML, activity URI permission, cached PNG, and corrected fixed-string audit establish the accepted result.
- Airplane mode was disabled and Wi-Fi restored after verification.

## Final lock

The frozen APK was hashed repeatedly throughout the run. Final SHA-256 remains:

`f8071bc688dea51e0c08d86d42fed25ae20157c9211b7298d4bbd2004e702d90`
