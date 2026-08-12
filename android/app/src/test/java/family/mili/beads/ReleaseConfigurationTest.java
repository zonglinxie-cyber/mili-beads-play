package family.mili.beads;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class ReleaseConfigurationTest {

    @Test
    public void packageIdentityMatchesStoreListing() {
        assertEquals("family.mili.beads", BuildConfig.APPLICATION_ID);
    }

    @Test
    public void releaseVersionStartsAtOne() {
        assertEquals("1.0", BuildConfig.VERSION_NAME);
        assertEquals(1, BuildConfig.VERSION_CODE);
    }
}
