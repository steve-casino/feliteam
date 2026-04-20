'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  PhoneOff,
  X,
  Send,
  Users,
  Clock,
  Plus,
  MonitorOff,
} from 'lucide-react';

interface VideoRoomProps {
  roomName: string;
  roomId: string;
  currentUser: { id: string; full_name: string; avatar_url?: string };
  onLeave: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

const SIMULATED_PARTICIPANTS = [
  { id: 'sim-1', name: 'Carlos Rivera', initials: 'CR' },
  { id: 'sim-2', name: 'Jessica Chen', initials: 'JC' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VideoRoom({
  roomName,
  roomId,
  currentUser,
  onLeave,
}: VideoRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Carlos Rivera',
      text: "Hey, let's go over the Martinez case",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: '2',
      sender: 'Jessica Chen',
      text: 'Sure, pulling up the file now',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Duration timer
  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Camera/mic init
  useEffect(() => {
    let cancelled = false;
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) {
          setCameraError(
            'Camera access denied — please allow camera in browser settings'
          );
        }
      }
    }
    initMedia();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleMic = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setMicOn((prev) => !prev);
    }
  }, []);

  const toggleCam = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setCamOn((prev) => !prev);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenSharing(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      stream.getVideoTracks()[0].onended = () => {
        screenStreamRef.current = null;
        setScreenSharing(false);
      };
      setScreenSharing(true);
    } catch {
      // user cancelled
    }
  }, [screenSharing]);

  const handleLeave = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    screenStreamRef.current = null;
    onLeave();
  }, [onLeave]);

  const sendMessage = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: currentUser.full_name,
        text,
        timestamp: new Date(),
      },
    ]);
    setChatInput('');
  }, [chatInput, currentUser.full_name]);

  const participantCount = SIMULATED_PARTICIPANTS.length + 1;
  const userInitials = getInitials(currentUser.full_name);

  // Grid layout classes
  const totalTiles = screenSharing
    ? participantCount + 1
    : participantCount + 1; // +1 for invite slot
  const gridClass =
    totalTiles <= 1
      ? 'grid-cols-1'
      : totalTiles <= 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-navy-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-semibold text-lg truncate max-w-[200px] sm:max-w-none">
            {roomName}
          </h2>
          <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 bg-navy-200 px-2.5 py-1 rounded-full">
            <Users size={14} />
            {participantCount}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <Clock size={14} />
            {formatDuration(duration)}
          </span>
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-coral-400 hover:bg-coral-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PhoneOff size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Video grid */}
        <div
          className={`flex-1 p-3 sm:p-4 transition-all duration-300 ${chatOpen ? 'mr-0 md:mr-[360px]' : ''}`}
        >
          {cameraError ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-navy-50 rounded-2xl p-8 max-w-md">
                <VideoOff size={48} className="mx-auto mb-4 text-coral-400" />
                <p className="text-gray-300 text-lg">{cameraError}</p>
              </div>
            </div>
          ) : (
            <div
              className={`grid ${gridClass} gap-3 h-full auto-rows-fr`}
            >
              {/* Screen share tile (if sharing) */}
              {screenSharing && (
                <div className="relative rounded-xl overflow-hidden bg-navy-200 border-2 border-teal-400 col-span-full row-span-1 sm:row-span-2 min-h-[200px]">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                    <Monitor size={14} className="text-teal-400" />
                    <span className="text-white text-sm font-medium">
                      Screen Share
                    </span>
                  </div>
                </div>
              )}

              {/* User's video tile */}
              <div className="relative rounded-xl overflow-hidden bg-navy-200 border-2 border-blue-400 min-h-[160px]">
                {camOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover mirror"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-navy-200">
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {userInitials}
                    </div>
                  </div>
                )}
                {/* Name label */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                  <span className="text-white text-sm font-medium">
                    {currentUser.full_name}
                  </span>
                  <span className="text-[10px] text-blue-400 bg-blue-400/20 px-1.5 py-0.5 rounded font-medium">
                    You
                  </span>
                </div>
                {/* Mute indicator */}
                {!micOn && (
                  <div className="absolute top-3 right-3 bg-coral-400 rounded-full p-1.5">
                    <MicOff size={12} className="text-white" />
                  </div>
                )}
                {!camOn && (
                  <div className="absolute top-3 left-3 bg-coral-400 rounded-full p-1.5">
                    <VideoOff size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* Simulated participants */}
              {SIMULATED_PARTICIPANTS.map((participant) => (
                <div
                  key={participant.id}
                  className="relative rounded-xl overflow-hidden bg-navy-200 border-2 min-h-[160px]"
                  style={{
                    borderColor: '#1D9E75',
                    animation: 'pulseGreen 2s infinite',
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{
                        background:
                          participant.id === 'sim-1' ? '#2563EB' : '#1D9E75',
                      }}
                    >
                      {participant.initials}
                    </div>
                  </div>
                  {/* Simulated audio wave */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                    <span className="text-white text-sm font-medium">
                      {participant.name}
                    </span>
                  </div>
                  {/* Simulated speaking indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <div className="w-1.5 h-3 bg-teal-400 rounded-full animate-pulse" />
                    <div
                      className="w-1.5 h-4 bg-teal-400 rounded-full animate-pulse"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-1.5 h-2 bg-teal-400 rounded-full animate-pulse"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              ))}

              {/* Invite slot */}
              <div className="relative rounded-xl overflow-hidden bg-navy-200/50 border-2 border-dashed border-white/10 min-h-[160px] flex items-center justify-center cursor-pointer hover:border-white/20 hover:bg-navy-200/70 transition-all group">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-2 group-hover:border-blue-400 transition-colors">
                    <Plus
                      size={24}
                      className="text-gray-500 group-hover:text-blue-400 transition-colors"
                    />
                  </div>
                  <span className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">
                    Invite
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div
          className={`fixed md:absolute right-0 top-0 md:top-[57px] bottom-0 w-full md:w-[360px] bg-navy-50 border-l border-white/5 flex flex-col z-50 transition-transform duration-300 ${
            chatOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }`}
        >
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-400" />
              Room Chat
            </h3>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 hover:bg-navy-200 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender === currentUser.full_name;
              const initials = getInitials(msg.sender);
              const timeAgo = formatTimeAgo(msg.timestamp);
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                      isMe ? 'bg-blue-500' : 'bg-navy-200'
                    }`}
                  >
                    {initials}
                  </div>
                  <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-medium">
                        {isMe ? 'You' : msg.sender}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {timeAgo}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-xl text-sm max-w-[240px] ${
                        isMe
                          ? 'bg-blue-500 text-white rounded-tr-sm'
                          : 'bg-navy-200 text-gray-200 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-navy-200 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="flex justify-center pb-4 sm:pb-6 pt-2">
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-navy-200/80 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl">
          {/* Mic toggle */}
          <ControlButton
            active={micOn}
            onClick={toggleMic}
            icon={micOn ? <Mic size={20} /> : <MicOff size={20} />}
            label={micOn ? 'Mute' : 'Unmute'}
          />

          {/* Camera toggle */}
          <ControlButton
            active={camOn}
            onClick={toggleCam}
            icon={camOn ? <Video size={20} /> : <VideoOff size={20} />}
            label={camOn ? 'Stop Video' : 'Start Video'}
          />

          {/* Screen share */}
          <ControlButton
            active={!screenSharing}
            onClick={toggleScreenShare}
            icon={
              screenSharing ? (
                <MonitorOff size={20} />
              ) : (
                <Monitor size={20} />
              )
            }
            label={screenSharing ? 'Stop Share' : 'Share Screen'}
            accent={screenSharing ? 'teal' : undefined}
          />

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Chat toggle */}
          <ControlButton
            active={true}
            onClick={() => setChatOpen((o) => !o)}
            icon={<MessageSquare size={20} />}
            label="Chat"
            highlight={chatOpen}
          />

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Leave */}
          <button
            onClick={handleLeave}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-coral-400 hover:bg-coral-500 text-white rounded-full transition-all hover:scale-105 active:scale-95 font-medium text-sm"
            title="Leave Room"
          >
            <PhoneOff size={18} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Pulsing green border animation */}
      <style>{`
        @keyframes pulseGreen {
          0%, 100% { border-color: rgba(29, 158, 117, 0.4); box-shadow: 0 0 0 0 rgba(29, 158, 117, 0); }
          50% { border-color: rgba(29, 158, 117, 1); box-shadow: 0 0 12px 0 rgba(29, 158, 117, 0.3); }
        }
      `}</style>
    </div>
  );
}

/* ---- Sub-components ---- */

function ControlButton({
  active,
  onClick,
  icon,
  label,
  accent,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent?: 'teal';
  highlight?: boolean;
}) {
  const bg = !active
    ? accent === 'teal'
      ? 'bg-teal-400'
      : 'bg-coral-400'
    : highlight
      ? 'bg-blue-500'
      : 'bg-white/10 hover:bg-white/20';

  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-full text-white transition-all hover:scale-105 active:scale-95 ${bg}`}
      title={label}
    >
      {icon}
    </button>
  );
}

/* ---- Helpers ---- */

function formatTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}
