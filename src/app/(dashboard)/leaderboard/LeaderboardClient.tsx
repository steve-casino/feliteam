'use client'

import React, { useState, useMemo } from 'react'
import { Trophy, Zap } from 'lucide-react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import type { LeaderboardEntry, UserBadge } from '@/types'
import { BADGE_DEFINITIONS as BADGE_DEFS, LEVEL_THRESHOLDS as LEVEL_THRESH } from '@/lib/constants'

type TimePeriod = 'week' | 'month' | 'all'

const LEVEL_NAMES = {
  1: 'Junior Associate',
  2: 'Associate',
  3: 'Senior Associate',
  4: 'Partner Track'
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  userBadges: UserBadge[]
  currentUserId: string
}

const LeaderboardPage: React.FC<LeaderboardProps> = ({
  entries: mockLeaderboardEntries,
  userBadges: mockUserBadges,
  currentUserId,
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week')

  // Sort leaderboard by XP
  const sortedLeaderboard = useMemo(() => {
    return [...mockLeaderboardEntries].sort((a, b) => b.xp - a.xp)
  }, [mockLeaderboardEntries])

  // Get top 3
  const topThree = sortedLeaderboard.slice(0, 3)

  // Get all earned badge IDs
  const allEarnedBadgeIds = new Set(mockUserBadges.map((ub) => ub.badge_id))

  // Medals for podium
  const getMedal = (rank: number): string => {
    const medals = ['🥇', '🥈', '🥉']
    return medals[rank] || ''
  }

  // Calculate XP to next level
  const getXpToNextLevel = (currentXp: number, currentLevel: number): number => {
    const currentLevelThreshold = LEVEL_THRESH.find((l) => l.level === currentLevel)?.xp_required || 0
    const nextLevelThreshold =
      LEVEL_THRESH.find((l) => l.level === currentLevel + 1)?.xp_required ||
      LEVEL_THRESH[LEVEL_THRESH.length - 1].xp_required

    const xpInLevel = currentXp - currentLevelThreshold
    const xpForLevel = nextLevelThreshold - currentLevelThreshold

    return Math.max(0, xpForLevel - xpInLevel)
  }

  const getProgressPercent = (currentXp: number, currentLevel: number): number => {
    const currentLevelThreshold = LEVEL_THRESH.find((l) => l.level === currentLevel)?.xp_required || 0
    const nextLevelThreshold =
      LEVEL_THRESH.find((l) => l.level === currentLevel + 1)?.xp_required ||
      LEVEL_THRESH[LEVEL_THRESH.length - 1].xp_required

    const xpInLevel = currentXp - currentLevelThreshold
    const xpForLevel = nextLevelThreshold - currentLevelThreshold

    return (xpInLevel / xpForLevel) * 100
  }

  return (
    <div className="space-y-8">
      {/* Header with Trophy */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-white/60">Compete, celebrate, and grow together</p>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              timePeriod === period
                ? 'bg-blue-400 text-navy'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <Card variant="highlighted">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Top Performers</h2>

          <div className="grid grid-cols-3 gap-4 md:gap-8 items-end">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="space-y-3">
                <div className="bg-gradient-to-b from-white/5 to-white/0 rounded-t-2xl p-6 border border-white/10 h-40 flex flex-col items-center justify-end">
                  <Avatar name={topThree[1].user_name} src={topThree[1].avatar} size="lg" />
                  <p className="text-2xl mt-3">{getMedal(1)}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{topThree[1].user_name}</p>
                  <p className="text-sm text-white/60">{topThree[1].cases_closed} cases</p>
                  <p className="text-lg font-bold text-teal-400">{topThree[1].xp.toLocaleString()} XP</p>
                </div>
              </div>
            )}

            {/* 1st Place - Taller with Glow */}
            {topThree[0] && (
              <div className="space-y-3">
                <div className="bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-white/0 rounded-t-2xl p-6 border-2 border-blue-400 h-56 flex flex-col items-center justify-end shadow-2xl shadow-blue-500/30">
                  <Avatar name={topThree[0].user_name} src={topThree[0].avatar} size="lg" />
                  <p className="text-3xl mt-3">{getMedal(0)}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-lg">{topThree[0].user_name}</p>
                  <p className="text-sm text-white/60">{topThree[0].cases_closed} cases</p>
                  <p className="text-xl font-bold text-blue-400">{topThree[0].xp.toLocaleString()} XP</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="space-y-3">
                <div className="bg-gradient-to-b from-white/5 to-white/0 rounded-t-2xl p-6 border border-white/10 h-36 flex flex-col items-center justify-end">
                  <Avatar name={topThree[2].user_name} src={topThree[2].avatar} size="lg" />
                  <p className="text-2xl mt-3">{getMedal(2)}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{topThree[2].user_name}</p>
                  <p className="text-sm text-white/60">{topThree[2].cases_closed} cases</p>
                  <p className="text-lg font-bold text-blue-400">{topThree[2].xp.toLocaleString()} XP</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Full Rankings Table */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Full Rankings</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-bold text-white/70 uppercase">Rank</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-white/70 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-white/70 uppercase">Level</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-white/70 uppercase">XP</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-white/70 uppercase">Cases</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-white/70 uppercase">Checklist</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((entry, index) => {
                  const isCurrentUser = entry.user_id === currentUserId
                  return (
                    <tr
                      key={entry.user_id}
                      className={`border-b border-white/5 transition-colors ${
                        isCurrentUser
                          ? 'bg-blue-400/20 hover:bg-blue-400/30'
                          : index % 2 === 0
                            ? 'bg-navy-50/30 hover:bg-navy-50/50'
                            : 'hover:bg-navy-50/30'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span className="text-lg font-bold text-blue-400">#{index + 1}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={entry.user_name} src={entry.avatar} size="sm" />
                          <span className="font-semibold text-white">{entry.user_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-white/70">{LEVEL_NAMES[entry.level as keyof typeof LEVEL_NAMES]}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{entry.xp.toLocaleString()}</span>
                          <ProgressBar
                            value={getProgressPercent(entry.xp, entry.level)}
                            color="blue"
                            size="sm"
                            className="w-16"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-teal-400">{entry.cases_closed}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-coral-400 font-semibold">{Math.round(entry.checklist_rate * 100)}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Badge Showcase */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Badge Showcase</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BADGE_DEFS.map((badge) => {
              const isEarned = allEarnedBadgeIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  className="group cursor-pointer"
                  title={`${badge.name} - ${badge.description}`}
                >
                  <Badge
                    name={badge.name}
                    icon={badge.icon}
                    earned={isEarned}
                    className="h-full"
                  />
                  {!isEarned && (
                    <div className="text-center mt-2">
                      <p className="text-xs text-white/50">Locked</p>
                      <p className="text-xs text-white/40">+{badge.xp_reward} XP</p>
                    </div>
                  )}
                  {isEarned && (
                    <div className="text-center mt-2">
                      <p className="text-xs text-teal-400 font-semibold">+{badge.xp_reward} XP</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Level Progress Section */}
      <Card variant="highlighted">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Career Path</h2>

          {/* Current Level Display */}
          <div className="text-center space-y-2">
            <p className="text-white/70 text-sm">Current Level</p>
            <p className="text-5xl font-bold text-blue-400">4</p>
            <p className="text-lg text-white font-semibold">Partner Track</p>
          </div>

          {/* Level Progression Path */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEVEL_THRESH.map((level) => {
              const isCurrentOrPast = level.level <= 4
              return (
                <div
                  key={level.level}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrentOrPast
                      ? 'border-blue-400 bg-blue-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <p className={`text-sm font-semibold ${isCurrentOrPast ? 'text-blue-400' : 'text-white/70'}`}>
                    Level {level.level}
                  </p>
                  <p className={`text-xs mt-1 ${isCurrentOrPast ? 'text-white' : 'text-white/50'}`}>
                    {level.name}
                  </p>
                  <p className={`text-xs mt-2 ${isCurrentOrPast ? 'text-blue-300' : 'text-white/40'}`}>
                    {level.xp_required.toLocaleString()} XP
                  </p>
                </div>
              )
            })}
          </div>

          {/* XP to Next Level */}
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-white/70 text-sm mb-2">Progress to Next Level</p>
            <p className="text-2xl font-bold text-teal-400">{getXpToNextLevel(8500, 4).toLocaleString()} XP</p>
            <ProgressBar value={getProgressPercent(8500, 4)} color="blue" size="md" className="mt-3" />
          </div>
        </div>
      </Card>

      {/* Weekly Team Challenge */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Weekly Team Challenge
          </h2>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-white font-semibold mb-1">Goal: Close 15 cases this week</p>
              <p className="text-white/60 text-sm">Team progress: 11 / 15 cases closed</p>
            </div>

            <ProgressBar value={(11 / 15) * 100} color="coral" size="lg" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {mockLeaderboardEntries.map((entry) => (
                <div key={entry.user_id} className="space-y-2">
                  <Avatar name={entry.user_name} src={entry.avatar} size="md" />
                  <p className="text-xs font-semibold text-white text-center">{entry.user_name}</p>
                  <p className="text-sm font-bold text-blue-400 text-center">{entry.cases_closed}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-amber-400 font-bold">5 days remaining</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LeaderboardPage
