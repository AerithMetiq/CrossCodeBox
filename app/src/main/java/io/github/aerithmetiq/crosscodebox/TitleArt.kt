package io.github.aerithmetiq.crosscodebox

/**
 * CrossCode's logo for the launcher, cut at runtime from the user's own copy of the game, never
 * bundled (hard rule 1). [LOGO] is the title screen's logo atlas: the logo itself, with its glow, in a
 * band across the top, and the pieces of its animation below. The band is the first run of rows that
 * hold anything, down to the next empty row (rows 4-108 of 256 in the Steam build of 2025-09).
 *
 * The atlas has no transparency: it is RGB on black, which the game blends away. [blackToAlpha]
 * does the same for the launcher: a pixel's brightest channel becomes its opacity.
 */
object TitleArt {

    const val LOGO = "assets/media/gui/title-logo-new.png"

    /** A band taller than this share of the picture is not the logo alone; the wordmark is kept instead. */
    private const val MAX_SHARE = 0.6

    /**
     * The rows of the topmost band in a picture [height] rows tall, where [inked] says whether a row
     * holds anything; null when there is none, or when the band is most of the picture.
     */
    fun topBand(height: Int, inked: (Int) -> Boolean): IntRange? {
        var y = 0
        while (y < height && !inked(y)) y++
        if (y >= height) return null
        val start = y
        while (y < height && inked(y)) y++
        val band = start until y
        return band.takeIf { it.count() <= height * MAX_SHARE }
    }

    /**
     * The columns from the first to the last that hold anything, in a band [width] columns wide; null
     * when none does. The logo does not fill the atlas's width (columns 17-273 of 352), so the band is
     * cut to this too, or the logo sits left of centre on the launcher.
     */
    fun span(width: Int, inked: (Int) -> Boolean): IntRange? {
        val first = (0 until width).firstOrNull(inked) ?: return null
        val last = (width - 1 downTo first).first(inked)
        return first..last
    }

    /** Whether an ARGB pixel is lit (not black), the test for a row that holds anything. */
    fun lit(pixel: Int): Boolean = maxOf((pixel shr 16) and 0xFF, (pixel shr 8) and 0xFF, pixel and 0xFF) > 8

    /**
     * Black made see-through, in place: each ARGB pixel's opacity becomes its brightest channel and
     * its colour is brightened to match, so over a dark background it looks as it does drawn
     * additively, and black disappears.
     */
    fun blackToAlpha(pixels: IntArray) {
        for (i in pixels.indices) {
            val p = pixels[i]
            val r = (p shr 16) and 0xFF
            val g = (p shr 8) and 0xFF
            val b = p and 0xFF
            val a = maxOf(r, g, b)
            pixels[i] = if (a == 0) 0 else (a shl 24) or ((r * 255 / a) shl 16) or ((g * 255 / a) shl 8) or (b * 255 / a)
        }
    }
}
