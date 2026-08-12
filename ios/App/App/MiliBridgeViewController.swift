import Capacitor

@objc(MiliBridgeViewController)
class MiliBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(DurableStorePlugin())
    }
}
