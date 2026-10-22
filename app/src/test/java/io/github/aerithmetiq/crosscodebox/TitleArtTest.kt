package io.github.aerithmetiq.crosscodebox

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class TitleArtTest {

    private fun rows(vararg inked: Boolean) = { y: Int -> inked[y] }

    @Test
    fun `the logo is the first band of rows that hold anything`() {
        /* Empty, logo (2 rows), gap, animation pieces (3 rows), empty. */
        val picture = rows(false, true, true, false, true, true, true, false, false, false)
        assertEquals(1..2, TitleArt.topBand(10, picture))
    }

    @Test
    fun `black becomes see-through and colour keeps its hue`() {
        val pixels = intArrayOf(0xFF000000.toInt(), 0xFF404080.toInt(), 0xFFFFFFFF.toInt())
        TitleArt.blackToAlpha(pixels)
        assertEquals(0, pixels[0])
        assertEquals(0x80, pixels[1] ushr 24)
        assertEquals(0x7F, (pixels[1] shr 16) and 0xFF)
        assertEquals(0xFF, pixels[1] and 0xFF)
        assertEquals(0xFFFFFFFF.toInt(), pixels[2])
        assertEquals(false, TitleArt.lit(0xFF000000.toInt()))
        assertEquals(true, TitleArt.lit(0xFF000020.toInt()))
    }

    @Test
    fun `an empty picture, or one that is all one band, gives no logo`() {
        assertNull(TitleArt.topBand(4, rows(false, false, false, false)))
        assertNull(TitleArt.topBand(4, rows(true, true, true, true)))
    }

    @Test
    fun `the logo is cut to the columns that hold anything`() {
        val inked = booleanArrayOf(false, false, true, false, true, false)
        assertEquals(2..4, TitleArt.span(inked.size) { inked[it] })
        assertEquals(null, TitleArt.span(3) { false })
    }
}
