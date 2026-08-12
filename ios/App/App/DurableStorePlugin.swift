import Foundation
import Capacitor

@objc(DurableStorePlugin)
public class DurableStorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DurableStorePlugin"
    public let jsName = "DurableStore"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getLegacy", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearLegacy", returnType: CAPPluginReturnPromise)
    ]

    private var directoryURL: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("MiliDurableStore", isDirectory: true)
    }

    private func fileURL(for key: String) -> URL? {
        let allowed = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: "-_."))
        guard !key.isEmpty, key != ".", key != "..", key.rangeOfCharacter(from: allowed.inverted) == nil else { return nil }
        return directoryURL.appendingPathComponent(key, isDirectory: false)
    }

    private func legacyKey(_ key: String) -> String? {
        guard fileURL(for: key) != nil else { return nil }
        return "CapacitorStorage.\(key)"
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let url = fileURL(for: key) else {
            call.reject("Invalid key")
            return
        }
        do {
            let value = FileManager.default.fileExists(atPath: url.path)
                ? try String(contentsOf: url, encoding: .utf8)
                : nil
            call.resolve(["value": value as Any])
        } catch {
            call.reject("Durable read failed", nil, error)
        }
    }

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let value = call.getString("value"), let url = fileURL(for: key) else {
            call.reject("Invalid key or value")
            return
        }
        do {
            try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
            try Data(value.utf8).write(to: url, options: [.atomic])
            let handle = try FileHandle(forWritingTo: url)
            try handle.synchronize()
            try handle.close()
            call.resolve()
        } catch {
            call.reject("Durable write failed", nil, error)
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let url = fileURL(for: key) else {
            call.reject("Invalid key")
            return
        }
        do {
            if FileManager.default.fileExists(atPath: url.path) {
                try FileManager.default.removeItem(at: url)
            }
            call.resolve()
        } catch {
            call.reject("Durable remove failed", nil, error)
        }
    }

    @objc func getLegacy(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let legacyKey = legacyKey(key) else {
            call.reject("Invalid key")
            return
        }
        call.resolve(["value": UserDefaults.standard.string(forKey: legacyKey) as Any])
    }

    @objc func clearLegacy(_ call: CAPPluginCall) {
        let defaults = UserDefaults.standard
        let keys = defaults.dictionaryRepresentation().keys.filter { $0.hasPrefix("CapacitorStorage.") }
        for key in keys {
            defaults.removeObject(forKey: key)
        }
        guard defaults.synchronize() else {
            call.reject("Durable legacy clear failed")
            return
        }
        call.resolve()
    }
}
