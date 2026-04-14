'use client'

import React, { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send } from 'lucide-react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import { mockTeamPosts } from '@/lib/mock-data'
import type { User } from '@/types'

type TabType = 'feed' | 'shoutouts' | 'huddles'
type PostType = 'announcement' | 'celebration' | 'shoutout' | 'poll'

interface UIPost {
  id: string
  user_id: string
  content: string
  type: PostType
  reactions: Record<string, string[]>
  created_at: string
}

interface UIShoutout {
  id: string
  from_user_id: string
  to_user_id: string
  message: string
  created_at: string
}

interface HuddleEvent {
  id: string
  title: string
  time: string
  participants: string[]
}

interface Poll {
  id: string
  question: string
  options: Array<{
    id: string
    text: string
    votes: number
  }>
}

interface TeamPageProps {
  users: User[]
}

const TeamPage: React.FC<TeamPageProps> = ({ users }) => {
  const mockUsers = users
  const [activeTab, setActiveTab] = useState<TabType>('feed')
  const [posts, setPosts] = useState<UIPost[]>(mockTeamPosts)
  const [shoutouts, setShoutouts] = useState<UIShoutout[]>([
    {
      id: 'shoutout-1',
      from_user_id: 'user-1',
      to_user_id: 'user-2',
      message: 'Carlos crushed that Martinez settlement! Incredible work on the negotiation.',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'shoutout-2',
      from_user_id: 'user-3',
      to_user_id: 'user-4',
      message: 'Ahmed, your intake processing is flawless. 5 cases in a day, zero errors!',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ])
  const [huddles] = useState<HuddleEvent[]>([
    {
      id: 'huddle-1',
      title: 'Daily Standup',
      time: '9:00 AM CT',
      participants: ['user-1', 'user-2', 'user-3', 'user-4']
    },
    {
      id: 'huddle-2',
      title: 'Settlement Strategy',
      time: '2:00 PM CT',
      participants: ['user-1', 'user-2']
    }
  ])

  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState<PostType>('announcement')
  const [shoutoutModal, setShoutoutModal] = useState(false)
  const [shoutoutToUser, setShoutoutToUser] = useState('')
  const [shoutoutMessage, setShoutoutMessage] = useState('')
  const [pollModal, setPollModal] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', '', ''])
  const [activePolls, setActivePolls] = useState<Poll[]>([
    {
      id: 'poll-1',
      question: 'Should we add weekly case review meetings?',
      options: [
        { id: 'opt-1', text: 'Yes, definitely!', votes: 3 },
        { id: 'opt-2', text: 'Maybe, let\'s discuss', votes: 1 },
        { id: 'opt-3', text: 'No, we\'re too busy', votes: 0 }
      ]
    }
  ])

  const reactionEmojis = ['🔥', '👏', '💪', '🎉', '❤️']

  const handlePostSubmit = () => {
    if (!postContent.trim()) return

    const newPost: UIPost = {
      id: `post-${Date.now()}`,
      user_id: 'user-1',
      content: postContent,
      type: postType,
      reactions: {},
      created_at: new Date().toISOString()
    }

    setPosts([newPost, ...posts])
    setPostContent('')
    setPostType('announcement')
  }

  const handleReaction = (postId: string, emoji: string, userId: string = 'user-1') => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const reactions = { ...post.reactions }
          if (!reactions[emoji]) {
            reactions[emoji] = []
          }
          if (!reactions[emoji].includes(userId)) {
            reactions[emoji] = [...reactions[emoji], userId]
          } else {
            reactions[emoji] = reactions[emoji].filter((id) => id !== userId)
          }
          return { ...post, reactions }
        }
        return post
      })
    )
  }

  const handleShoutout = () => {
    if (!shoutoutToUser || !shoutoutMessage.trim()) return

    const newShoutout: UIShoutout = {
      id: `shoutout-${Date.now()}`,
      from_user_id: 'user-1',
      to_user_id: shoutoutToUser,
      message: shoutoutMessage,
      created_at: new Date().toISOString()
    }

    setShoutouts([newShoutout, ...shoutouts])
    setShoutoutToUser('')
    setShoutoutMessage('')
    setShoutoutModal(false)
  }

  const handlePollSubmit = () => {
    if (!pollQuestion.trim() || pollOptions.some((opt) => !opt.trim())) return

    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      question: pollQuestion,
      options: pollOptions
        .filter((opt) => opt.trim())
        .map((text, idx) => ({
          id: `opt-${idx}`,
          text,
          votes: 0
        }))
    }

    setActivePolls([newPoll, ...activePolls])
    setPollQuestion('')
    setPollOptions(['', '', ''])
    setPollModal(false)
  }

  const handlePollVote = (pollId: string, optionId: string) => {
    setActivePolls(
      activePolls.map((poll) => {
        if (poll.id === pollId) {
          return {
            ...poll,
            options: poll.options.map((opt) => {
              if (opt.id === optionId) {
                return { ...opt, votes: opt.votes + 1 }
              }
              return opt
            })
          }
        }
        return poll
      })
    )
  }

  const celebrationPosts = useMemo(() => {
    return posts.filter((post) => post.type === 'celebration')
  }, [posts])

  const getPostTypeColor = (type: PostType) => {
    const colors = {
      announcement: 'bg-purple-500/20 text-purple-400',
      celebration: 'bg-teal-500/20 text-teal-400',
      shoutout: 'bg-amber-500/20 text-amber-400',
      poll: 'bg-blue-500/20 text-blue-400'
    }
    return colors[type]
  }

  const getPostTypeEmoji = (type: PostType) => {
    const emojis = {
      announcement: '📢',
      celebration: '🎉',
      shoutout: '🙌',
      poll: '🗳️'
    }
    return emojis[type]
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white">Team Hub</h1>
        <p className="text-white/60">Celebrate wins, share updates, and keep everyone in sync</p>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {(['feed', 'shoutouts', 'huddles'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-white/50 hover:text-white/70'
            }`}
          >
            {tab === 'feed' && 'Feed'}
            {tab === 'shoutouts' && 'Shoutouts'}
            {tab === 'huddles' && 'Huddles'}
          </button>
        ))}
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-6">
          <Card variant="highlighted" className="space-y-4">
            <div className="space-y-3">
              <p className="text-white/70 text-sm">What's happening?</p>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share an update, celebrate a win, or give a shoutout..."
                className="w-full px-4 py-3 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-purple-400/50 focus:outline-none resize-none"
                rows={4}
              />

              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {(['announcement', 'celebration', 'shoutout', 'poll'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                        postType === type
                          ? `${getPostTypeColor(type)} border border-white/20`
                          : 'bg-white/5 text-white/50 hover:text-white/70'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handlePostSubmit}
                  disabled={!postContent.trim()}
                  className="ml-auto px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </div>
            </div>
          </Card>

          {celebrationPosts.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-teal-500/10 border-white/10">
              <div className="space-y-2">
                <p className="text-white/70 text-sm font-medium">Recent Celebrations</p>
                <div className="flex flex-wrap gap-2">
                  {celebrationPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="px-3 py-2 bg-white/5 rounded-lg text-white text-sm flex items-center gap-2"
                    >
                      <span className="text-lg">🎉</span>
                      <span className="line-clamp-1">{post.content.substring(0, 40)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {posts.map((post) => {
              const author = mockUsers.find((u) => u.id === post.user_id)
              if (!author) return null

              return (
                <Card key={post.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={author.full_name}
                      src={author.avatar_url}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{author.full_name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                          {getPostTypeEmoji(post.type)} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <p className="text-white/80 leading-relaxed">{post.content}</p>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {reactionEmojis.map((emoji) => {
                      const hasReacted = post.reactions[emoji]?.includes('user-1')
                      const count = post.reactions[emoji]?.length || 0

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(post.id, emoji)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            hasReacted
                              ? 'bg-purple-500/30 border border-purple-400 text-white'
                              : 'bg-white/5 border border-white/10 text-white/60 hover:text-white/80'
                          }`}
                        >
                          {emoji} {count > 0 && count}
                        </button>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'shoutouts' && (
        <div className="space-y-6">
          <Card variant="highlighted" className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Give a Shoutout</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">To:</label>
                <select
                  value={shoutoutToUser}
                  onChange={(e) => setShoutoutToUser(e.target.value)}
                  className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white focus:border-purple-400/50 focus:outline-none"
                >
                  <option value="">Select a team member...</option>
                  {mockUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Message:</label>
                <textarea
                  value={shoutoutMessage}
                  onChange={(e) => setShoutoutMessage(e.target.value)}
                  placeholder="Tell them what they did great..."
                  className="w-full px-4 py-3 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-purple-400/50 focus:outline-none resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleShoutout}
                disabled={!shoutoutToUser || !shoutoutMessage.trim()}
                className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <span className="text-lg">🙌</span>
                Send Props
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shoutouts.map((shoutout) => {
              const fromUser = mockUsers.find((u) => u.id === shoutout.from_user_id)
              const toUser = mockUsers.find((u) => u.id === shoutout.to_user_id)

              return (
                <Card
                  key={shoutout.id}
                  className="border-l-4 border-purple-400 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={fromUser?.full_name || ''} src={fromUser?.avatar_url} size="sm" />
                    <div className="flex-1 text-sm">
                      <p className="text-white/70">
                        <span className="font-semibold text-white">{fromUser?.full_name}</span>
                        {' '}gave props to
                      </p>
                      <p className="font-semibold text-teal-400">{toUser?.full_name}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm">{shoutout.message}</p>
                  <p className="text-white/40 text-xs">
                    {formatDistanceToNow(new Date(shoutout.created_at), { addSuffix: true })}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'huddles' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
              Schedule Daily Huddle
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Upcoming Huddles</h2>
            {huddles.map((huddle) => (
              <Card key={huddle.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{huddle.title}</h3>
                    <p className="text-teal-400 text-sm font-medium">{huddle.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {huddle.participants.map((userId) => {
                      const user = mockUsers.find((u) => u.id === userId)
                      return (
                        <Avatar
                          key={userId}
                          name={user?.full_name || ''}
                          src={user?.avatar_url}
                          size="sm"
                        />
                      )
                    })}
                  </div>
                  <p className="text-white/60 text-sm">{huddle.participants.length} attending</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Active Polls</h2>
              <button
                onClick={() => setPollModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                New Poll
              </button>
            </div>

            {activePolls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0)

              return (
                <Card key={poll.id} className="space-y-4">
                  <h3 className="font-semibold text-white">{poll.question}</h3>
                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0

                      return (
                        <button
                          key={option.id}
                          onClick={() => handlePollVote(poll.id, option.id)}
                          className="w-full text-left group"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-white/80 group-hover:text-white transition-colors">
                              {option.text}
                            </span>
                            <span className="text-white/60 text-sm">{option.votes}</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-lg h-2 overflow-hidden group-hover:bg-white/10 transition-colors">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-teal-500 transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Modal isOpen={pollModal} onClose={() => setPollModal(false)} title="Create a Poll">
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Question:</label>
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="What do you want to ask?"
              className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-purple-400/50 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white/70 text-sm font-medium">Options:</label>
            {pollOptions.map((option, idx) => (
              <input
                key={idx}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...pollOptions]
                  newOptions[idx] = e.target.value
                  setPollOptions(newOptions)
                }}
                placeholder={`Option ${idx + 1}`}
                className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-purple-400/50 focus:outline-none"
              />
            ))}
          </div>

          <button
            onClick={handlePollSubmit}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Create Poll
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default TeamPage
