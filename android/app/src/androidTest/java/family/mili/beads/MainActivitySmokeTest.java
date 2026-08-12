package family.mili.beads;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isAssignableFrom;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class MainActivitySmokeTest {

    @Test
    public void appContextUsesReleaseApplicationId() {
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("family.mili.beads", appContext.getPackageName());
    }

    @Test
    public void mainActivityLaunchesWithVisibleCapacitorWebView() {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            scenario.onActivity(activity -> {
                assertFalse(activity.isFinishing());
                assertNotNull(activity.getBridge());
                assertNotNull(activity.getBridge().getWebView());
            });

            onView(isAssignableFrom(WebView.class)).check(matches(isDisplayed()));
        }
    }

    @Test
    public void durableStoreCommitsAndClearsLegacyPreferencesSynchronously() {
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        SharedPreferences durable = context.getSharedPreferences("MiliDurableStore", Context.MODE_PRIVATE);
        SharedPreferences legacy = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);

        durable.edit().clear().commit();
        legacy.edit().clear().commit();
        assertTrue(durable.edit().putString("mili-game-v3", "one-bead").commit());
        assertEquals("one-bead", durable.getString("mili-game-v3", null));
        assertTrue(legacy.edit().putString("mili-game-v2", "legacy").commit());
        assertTrue(legacy.edit().clear().commit());
        assertNull(legacy.getString("mili-game-v2", null));
        assertTrue(durable.edit().remove("mili-game-v3").commit());
    }
}
