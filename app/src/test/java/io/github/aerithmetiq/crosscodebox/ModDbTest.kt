package io.github.aerithmetiq.crosscodebox

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ModDbTest {

    /** The shape of CCModDB's npDatabase.min.json (2026-10-22), cut down. */
    private val json = """
        {
          "Boki Colors": {
            "metadataCCMod": {
              "id": "Boki Colors", "version": "1.0.1", "title": "Boki Colors",
              "description": { "en_US": "Change Lea's palette \\c[3]to\\c[0] Boki's." },
              "tags": ["cosmetic"], "authors": "Azure Lazuline",
              "dependencies": { "element-hair": ">=1.0.0", "crosscode": "^1.4.0" }
            },
            "installation": [ { "type": "zip", "url": "https://example.org/boki.ccmod", "source": "", "hash": { "sha256": "ab12" } } ]
          },
          "element-hair": {
            "metadataCCMod": { "id": "element-hair", "version": "2.0.0", "title": { "en_US": "Element Hair" },
              "authors": ["A", "B"], "dependencies": { "missing-lib": "*" } },
            "installation": [ { "type": "zip", "url": "https://example.org/eh.zip", "source": "element-hair-main/" } ]
          },
          "ccloader": {
            "metadataCCMod": { "id": "ccloader", "version": "2.26.1", "tags": ["base"] },
            "installation": [ { "type": "zip", "url": "https://example.org/ccl2.zip" } ]
          },
          "plain-http": {
            "metadataCCMod": { "id": "plain-http", "version": "1" },
            "installation": [ { "type": "zip", "url": "http://example.org/x.zip" } ]
          }
        }
    """.trimIndent()

    @Test
    fun `entries are read with their texts, archive and dependencies`() {
        val mods = ModDb.parse(json)
        assertEquals(listOf("Boki Colors", "Element Hair"), mods.map { it.title })
        val boki = mods[0]
        assertEquals("Change Lea's palette to Boki's.", boki.description)
        assertEquals("ab12", boki.sha256)
        assertEquals("", boki.source)
        assertEquals("A, B", mods[1].authors)
        assertEquals("element-hair-main", mods[1].source)
        assertEquals(null, mods[1].sha256)
    }

    @Test
    fun `a mod's dependencies come first, provided ones and installed ones are skipped`() {
        val mods = ModDb.parse(json)
        val boki = mods.first { it.id == "Boki Colors" }
        val (plan, unknown) = ModDb.plan(boki, mods, installed = emptySet())
        assertEquals(listOf("element-hair", "Boki Colors"), plan.map { it.id })
        assertEquals(listOf("missing-lib"), unknown)
        assertEquals(listOf("Boki Colors"), ModDb.plan(boki, mods, installed = setOf("element-hair")).first.map { it.id })
    }

    @Test
    fun `search looks at title, author and tags`() {
        val boki = ModDb.parse(json).first()
        assertTrue(ModDb.matches(boki, "azure"))
        assertTrue(ModDb.matches(boki, "COSMETIC"))
        assertTrue(ModDb.matches(boki, " "))
        assertFalse(ModDb.matches(boki, "speedrun"))
    }
}
