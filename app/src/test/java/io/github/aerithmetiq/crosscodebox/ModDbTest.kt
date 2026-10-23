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
            "installation": [ { "type": "zip", "url": "https://example.org/boki.ccmod", "source": "", "hash": { "sha256": "ab12" } } ],
            "stars": 6, "lastUpdateTimestamp": 1778431847000
          },
          "element-hair": {
            "metadataCCMod": { "id": "element-hair", "version": "2.0.0", "title": { "en_US": "Element Hair" },
              "authors": ["A", "B"], "dependencies": { "missing-lib": "*" } },
            "installation": [ { "type": "zip", "url": "https://example.org/eh.zip", "source": "element-hair-main/" } ],
            "stars": 2, "lastUpdateTimestamp": 1779000000000
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
        assertEquals(listOf("A", "B"), mods[1].authors)
        assertEquals("A, B", mods[1].byline)
        assertEquals(6, mods[0].stars)
        assertEquals(1778431847000, mods[0].updated)
        assertEquals("element-hair-main", mods[1].source)
        assertEquals(null, mods[1].sha256)
    }

    @Test
    fun `text codes are dropped from titles`() {
        assertEquals("Xenon's Playable Classes", ModDb.text("Xenon's Playable Classes \\i[class-tri] \\i[class-hexa]"))
        assertEquals("Lea in red", ModDb.text("Lea \\c[1]in red\\c[0]"))
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

    private fun mod(id: String, stars: Int = 0, updated: Long = 0, authors: List<String> = emptyList(), tags: List<String> = emptyList()) =
        ModEntry(id, id, "1", "", authors, tags, "https://example.org/$id.zip", null, "", emptyMap(), null, stars, updated)

    private val many = listOf(
        mod("beta", stars = 5, updated = 300, authors = listOf("krypek"), tags = listOf("fun", "QoL")),
        mod("alpha", stars = 9, updated = 100, authors = listOf("Hsifnus"), tags = listOf("fun")),
        mod("gamma", stars = 5, updated = 200, authors = listOf("hsifnus", "krypek"), tags = listOf("library")),
        mod("delta", stars = 1, updated = 400),
    )

    @Test
    fun `each order has its natural direction, and reversed flips it`() {
        fun ids(sort: ModSort, reversed: Boolean = false) = ModDb.select(many, ModView(sort = sort, reversed = reversed)).map { it.id }
        assertEquals("most stars first, ties by title", listOf("alpha", "beta", "gamma", "delta"), ids(ModSort.POPULAR))
        assertEquals("fewest stars first, ties still by title", listOf("delta", "beta", "gamma", "alpha"), ids(ModSort.POPULAR, true))
        assertEquals(listOf("alpha", "beta", "delta", "gamma"), ids(ModSort.NAME))
        assertEquals(listOf("gamma", "delta", "beta", "alpha"), ids(ModSort.NAME, true))
        assertEquals(listOf("delta", "beta", "gamma", "alpha"), ids(ModSort.UPDATED))
        assertEquals("by first author, no author last", listOf("alpha", "gamma", "beta", "delta"), ids(ModSort.AUTHOR))
    }

    @Test
    fun `a category and an author narrow the list, the author without case`() {
        fun ids(view: ModView) = ModDb.select(many, view).map { it.id }.toSet()
        assertEquals(setOf("alpha", "beta"), ids(ModView(tag = "fun")))
        assertEquals(setOf("alpha", "gamma"), ids(ModView(author = "Hsifnus")))
        assertEquals(setOf("gamma"), ids(ModView(tag = "library", author = "krypek")))
        assertEquals(setOf("beta"), ids(ModView(text = "beta", author = "KRYPEK")))
    }

    @Test
    fun `categories and authors are listed A to Z with their counts`() {
        assertEquals(listOf("fun" to 2, "library" to 1, "QoL" to 1), ModDb.categories(many))
        assertEquals("one Hsifnus, as most of the mods spell it", listOf("Hsifnus" to 2, "krypek" to 2), ModDb.authorList(many).let { list ->
            list.map { (name, n) -> (if (name.equals("hsifnus", true)) "Hsifnus" else name) to n }
        })
        assertEquals(2, ModDb.authorList(many).size)
    }
}
