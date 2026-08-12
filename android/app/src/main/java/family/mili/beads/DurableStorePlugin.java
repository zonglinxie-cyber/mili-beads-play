package family.mili.beads;

import android.app.Activity;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DurableStore")
public class DurableStorePlugin extends Plugin {

    private static final String LEGACY_GROUP = "CapacitorStorage";

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences("MiliDurableStore", Activity.MODE_PRIVATE);
    }

    private SharedPreferences legacyPreferences() {
        return getContext().getSharedPreferences(LEGACY_GROUP, Activity.MODE_PRIVATE);
    }

    @PluginMethod
    public void get(PluginCall call) {
        String key = call.getString("key");
        if (key == null) {
            call.reject("Must provide key");
            return;
        }
        JSObject result = new JSObject();
        String value = preferences().getString(key, null);
        result.put("value", value == null ? JSObject.NULL : value);
        call.resolve(result);
    }

    @PluginMethod
    public void set(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        if (key == null || value == null) {
            call.reject("Must provide key and value");
            return;
        }
        if (!preferences().edit().putString(key, value).commit()) {
            call.reject("Durable write failed");
            return;
        }
        call.resolve();
    }

    @PluginMethod
    public void remove(PluginCall call) {
        String key = call.getString("key");
        if (key == null) {
            call.reject("Must provide key");
            return;
        }
        if (!preferences().edit().remove(key).commit()) {
            call.reject("Durable remove failed");
            return;
        }
        call.resolve();
    }

    @PluginMethod
    public void getLegacy(PluginCall call) {
        String key = call.getString("key");
        if (key == null) {
            call.reject("Must provide key");
            return;
        }
        JSObject result = new JSObject();
        String value = legacyPreferences().getString(key, null);
        result.put("value", value == null ? JSObject.NULL : value);
        call.resolve(result);
    }

    @PluginMethod
    public void clearLegacy(PluginCall call) {
        if (!legacyPreferences().edit().clear().commit()) {
            call.reject("Durable legacy clear failed");
            return;
        }
        call.resolve();
    }
}
