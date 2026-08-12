package family.mili.beads;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(DurableStorePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
