import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DELETE_PENDING_KEY,
  DELETE_TOMBSTONE,
  emptySaveSnapshot,
  LEGACY_CLEAN_KEY,
  LEGACY_CLEAN_VALUE,
  LEGACY_SAVE_KEYS,
  SAVE_KEY,
  serializeSave,
} from "../app/save-store.ts";

const LEGACY_KEY = LEGACY_SAVE_KEYS[0];
const OLD_SAVE = JSON.stringify({
  completed: ["rocket-cat"],
  boards: { "rocket-cat": ["old-progress"] },
  activityDates: ["2026-08-12"],
});
const EMPTY_SAVE = serializeSave(emptySaveSnapshot());

class SimulatedPowerLoss extends Error {}

const newDevice = () => ({
  native: new Map([[SAVE_KEY, OLD_SAVE]]),
  legacyNative: new Map([[SAVE_KEY, OLD_SAVE], [LEGACY_KEY, OLD_SAVE]]),
  local: new Map([[SAVE_KEY, OLD_SAVE], [LEGACY_KEY, OLD_SAVE]]),
  events: [],
});

const mutate = (device, label, operation, fault) => {
  if (fault?.before === label) throw new SimulatedPowerLoss(`before:${label}`);
  operation();
  device.events.push(label);
  if (fault?.after === label) throw new SimulatedPowerLoss(`after:${label}`);
};

// Executable model of completeDeleteTransaction. The source-order assertions below
// bind this fault-window model to the production protocol without importing React.
const completeDelete = (device, { writeTombstone, fault } = {}) => {
  if (writeTombstone) {
    mutate(device, "write-tombstone", () => device.native.set(DELETE_PENDING_KEY, DELETE_TOMBSTONE), fault);
  }
  mutate(device, "remove-native-save", () => device.native.delete(SAVE_KEY), fault);
  mutate(device, "write-empty-native-save", () => device.native.set(SAVE_KEY, EMPTY_SAVE), fault);
  mutate(device, "clear-legacy-native", () => device.legacyNative.clear(), fault);
  mutate(device, "write-legacy-clean", () => device.native.set(LEGACY_CLEAN_KEY, LEGACY_CLEAN_VALUE), fault);
  mutate(device, "remove-local-save", () => device.local.delete(SAVE_KEY), fault);
  mutate(device, "remove-local-legacy", () => device.local.delete(LEGACY_KEY), fault);
  mutate(device, "retire-tombstone", () => device.native.delete(DELETE_PENDING_KEY), fault);
};

const recoverAtColdStart = (device) => {
  if (device.native.get(DELETE_PENDING_KEY)) completeDelete(device, { writeTombstone: false });
  const canonical = device.native.get(SAVE_KEY);
  if (canonical) return canonical;
  const fallback = device.local.get(SAVE_KEY) ?? device.local.get(LEGACY_KEY) ?? EMPTY_SAVE;
  device.native.set(SAVE_KEY, fallback);
  return fallback;
};

const assertDeletionConverged = device => {
  assert.equal(recoverAtColdStart(device), EMPTY_SAVE);
  assert.equal(device.native.get(SAVE_KEY), EMPTY_SAVE);
  assert.equal(device.native.has(DELETE_PENDING_KEY), false);
  assert.equal(device.native.get(LEGACY_CLEAN_KEY), LEGACY_CLEAN_VALUE);
  assert.equal(device.legacyNative.size, 0);
  assert.equal(device.local.has(SAVE_KEY), false);
  assert.equal(device.local.has(LEGACY_KEY), false);
};

test("native deletion converges after every post-tombstone crash/failure window", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const start = page.indexOf("const completeDeleteTransaction = async");
  const end = page.indexOf("\n  useEffect(() =>", start);
  assert.ok(start >= 0 && end > start, "completeDeleteTransaction must remain inspectable");
  const transaction = page.slice(start, end);

  const orderedSourceSteps = [
    "DurableStore.set({ key: DELETE_PENDING_KEY, value: DELETE_TOMBSTONE })",
    "DurableStore.remove({ key: SAVE_KEY })",
    "DurableStore.set({ key: SAVE_KEY, value: serializeSave(empty) })",
    "DurableStore.clearLegacy()",
    "DurableStore.set({ key: LEGACY_CLEAN_KEY, value: LEGACY_CLEAN_VALUE })",
    "clearDeletedSnapshot()",
    "DurableStore.remove({ key: DELETE_PENDING_KEY })",
  ];
  let previousIndex = -1;
  for (const step of orderedSourceSteps) {
    const index = transaction.indexOf(step);
    assert.ok(index > previousIndex, `${step} must follow the preceding durable step`);
    previousIndex = index;
  }

  const postTombstoneSteps = [
    "write-tombstone",
    "remove-native-save",
    "write-empty-native-save",
    "clear-legacy-native",
    "write-legacy-clean",
    "remove-local-save",
    "remove-local-legacy",
    "retire-tombstone",
  ];
  for (const step of postTombstoneSteps) {
    const device = newDevice();
    assert.throws(
      () => completeDelete(device, { writeTombstone: true, fault: { after: step } }),
      SimulatedPowerLoss,
      `power loss after ${step}`,
    );
    assertDeletionConverged(device);
  }

  for (const step of postTombstoneSteps.slice(1)) {
    const device = newDevice();
    assert.throws(
      () => completeDelete(device, { writeTombstone: true, fault: { before: step } }),
      SimulatedPowerLoss,
      `operation failure before ${step}`,
    );
    assert.equal(device.native.get(DELETE_PENDING_KEY), DELETE_TOMBSTONE, "a durable delete intent must survive");
    assertDeletionConverged(device);
  }

  // This is the protocol's unavoidable acknowledgement boundary: if the very
  // first durable write never lands, a later process cannot infer delete intent.
  const beforeAcknowledgement = newDevice();
  assert.throws(
    () => completeDelete(beforeAcknowledgement, { writeTombstone: true, fault: { before: "write-tombstone" } }),
    SimulatedPowerLoss,
  );
  assert.equal(beforeAcknowledgement.native.has(DELETE_PENDING_KEY), false);
  assert.equal(recoverAtColdStart(beforeAcknowledgement), OLD_SAVE);
});
