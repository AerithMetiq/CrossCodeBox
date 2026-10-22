package io.github.aerithmetiq.crosscodebox

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class ModsTest {

    @get:Rule
    val tmp = TemporaryFolder()

    @Test
    fun `a mod sits at the top of its zip or in one folder`() {
        assertEquals(Mods.Layout("", null), Mods.layout(listOf("ccmod.json", "poststart.js")))
        assertEquals(Mods.Layout("my-mod/", "my-mod"), Mods.layout(listOf("my-mod/ccmod.json", "my-mod/assets/x.png")))
        assertEquals(Mods.Layout("old/", "old"), Mods.layout(listOf("old/package.json", "old/main.js")))
        assertNull("no manifest", Mods.layout(listOf("readme.txt", "x/y.js")))
        assertNull("two folders", Mods.layout(listOf("a/ccmod.json", "b/ccmod.json")))
    }

    @Test
    fun `zip entries outside the mod or with odd paths are skipped`() {
        assertEquals("assets/x.png", Mods.target("my-mod/assets/x.png", "my-mod/"))
        assertEquals("ccmod.json", Mods.target("ccmod.json", ""))
        assertNull(Mods.target("other/x.png", "my-mod/"))
        assertNull(Mods.target("my-mod/../../evil.js", "my-mod/"))
        assertNull(Mods.target("my-mod/./x.js", "my-mod/"))
        assertEquals("a/b.js", Mods.target("\\a\\b.js", ""))
    }

    @Test
    fun `names are made safe for a folder`() {
        assertEquals("Cool Mod v1.2", Mods.safeName("Cool Mod v1.2"))
        assertEquals("_.._evil", Mods.safeName("/../evil"))
        assertEquals("mod", Mods.safeName("..."))
    }

    @Test
    fun `installed mods are folders with a manifest and ccmod files`() {
        val dir = tmp.newFolder("mods")
        File(dir, "a-mod").mkdirs(); File(dir, "a-mod/ccmod.json").writeText("{}")
        File(dir, "not-a-mod").mkdirs()
        File(dir, "b.ccmod").writeText("zip")
        File(dir, "notes.txt").writeText("x")
        assertEquals(listOf("a-mod", "b.ccmod"), Mods.list(dir))
    }
}
