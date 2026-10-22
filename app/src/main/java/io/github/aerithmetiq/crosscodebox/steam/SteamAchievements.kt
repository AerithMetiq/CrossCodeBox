package io.github.aerithmetiq.crosscodebox.steam

import `in`.dragonbra.javasteam.base.ClientMsgProtobuf
import `in`.dragonbra.javasteam.base.IPacketMsg
import `in`.dragonbra.javasteam.enums.EMsg
import `in`.dragonbra.javasteam.enums.EResult
import `in`.dragonbra.javasteam.protobufs.steamclient.SteammessagesClientserverUserstats.CMsgClientStoreUserStats2
import `in`.dragonbra.javasteam.protobufs.steamclient.SteammessagesClientserverUserstats.CMsgClientStoreUserStatsResponse
import `in`.dragonbra.javasteam.steam.handlers.ClientMsgHandler
import `in`.dragonbra.javasteam.steam.handlers.steamuserstats.SteamUserStats
import java.io.IOException
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit

/**
 * One game's Steam achievements on a signed-in session: [read] the user's state (read-only), and
 * [unlock] achievements by name, which **writes to Steam** and is only used while the user has
 * achievements turned on (see `AchievementService`).
 *
 * JavaSteam can read user stats but not store them, so [unlock] sends Steam's own
 * `ClientStoreUserStats2` message and waits for its `ClientStoreUserStatsResponse`. Every call blocks.
 */
class SteamAchievements(private val session: SteamSession, private val appId: Int) {

    /** The user's achievements as Steam has them, with what is needed to store a change. */
    class State(
        val crc: Int,
        val values: Map<Int, Int>,
        val bits: Map<String, AchievementBit>,
        /** Display names from the schema, by API name, for reports. */
        val titles: Map<String, String>,
    ) {
        fun unlocked(name: String) = Achievements.unlocked(name, bits, values)
    }

    private val stats = session.client.getHandler(SteamUserStats::class.java)
        ?: error("JavaSteam has no SteamUserStats handler")

    private val replies = StoreReplies().also { session.client.addHandler(it) }

    fun read(): State {
        val me = session.client.steamID ?: throw IOException("not logged on")
        val got = stats.getUserStats(appId, me).toFuture().get(TIMEOUT_SEC, TimeUnit.SECONDS)
        if (got.result != EResult.OK) throw IOException("Steam would not send the achievements (${got.result})")
        val schema = got.schemaKeyValues
        val titles = LinkedHashMap<String, String>()
        for (stat in schema["stats"].children) for (entry in stat["bits"].children) {
            val name = entry["name"].value ?: continue
            titles[name] = entry["display"]["name"]["english"].value ?: name
        }
        return State(got.crcStats, got.stats.associate { it.statId to it.statValue }, Achievements.bits(schema), titles)
    }

    /**
     * **Writes to Steam**: unlocks [names] that are not unlocked yet. Returns the names it unlocked; names
     * already unlocked, and names this game does not have, are left alone. Throws [IOException] when
     * Steam refuses the change.
     */
    fun unlock(names: Collection<String>): List<String> {
        val state = read()
        val fresh = names.filter { it in state.bits && !state.unlocked(it) }.distinct()
        val change = Achievements.toStore(fresh, state.bits, state.values)
        if (change.isEmpty()) return emptyList()
        val me = session.client.steamID ?: throw IOException("not logged on")
        val msg = ClientMsgProtobuf<CMsgClientStoreUserStats2.Builder>(
            CMsgClientStoreUserStats2::class.java, EMsg.ClientStoreUserStats2,
        )
        msg.sourceJobID = session.client.getNextJobID()
        msg.body.setGameId(appId.toLong())
            .setSettorSteamId(me.convertToUInt64())
            .setSetteeSteamId(me.convertToUInt64())
            .setCrcStats(state.crc)
            .setExplicitReset(false)
        for ((statId, value) in change) {
            msg.body.addStats(CMsgClientStoreUserStats2.Stats.newBuilder().setStatId(statId).setStatValue(value))
        }
        val reply = replies.expect()
        session.client.send(msg)
        val answer = try {
            reply.get(TIMEOUT_SEC, TimeUnit.SECONDS)
        } catch (e: Exception) {
            throw IOException("Steam did not answer the achievement change", e)
        }
        val result = EResult.from(answer.eresult)
        if (result != EResult.OK) throw IOException("Steam refused the achievement change ($result)")
        if (answer.statsFailedValidationCount > 0) {
            throw IOException("Steam refused ${answer.statsFailedValidationCount} of the stats sent")
        }
        val after = read()
        val missing = fresh.filter { !after.unlocked(it) }
        if (missing.isNotEmpty()) throw IOException("Steam does not show ${missing.joinToString()} as unlocked")
        return fresh
    }

    /** Catches Steam's answer to a stats change, which JavaSteam's own handlers ignore. */
    private class StoreReplies : ClientMsgHandler() {
        @Volatile private var waiting: CompletableFuture<CMsgClientStoreUserStatsResponse>? = null

        fun expect(): CompletableFuture<CMsgClientStoreUserStatsResponse> =
            CompletableFuture<CMsgClientStoreUserStatsResponse>().also { waiting = it }

        override fun handleMsg(packetMsg: IPacketMsg) {
            if (packetMsg.msgType != EMsg.ClientStoreUserStatsResponse) return
            val body = ClientMsgProtobuf<CMsgClientStoreUserStatsResponse.Builder>(
                CMsgClientStoreUserStatsResponse::class.java, packetMsg,
            ).body.build()
            waiting?.complete(body)
        }
    }

    private companion object {
        const val TIMEOUT_SEC = 30L
    }
}
