import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Mic, Sparkles, Send, Tag, Volume2, Play, Square, Check, Radio } from 'lucide-react';
import { UserProfile, VoiceRoom } from '../../types';
import { useI18n } from '../../lib/i18n';

export interface MomentItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  vipLevel?: number;
  userLevel?: number;
  timeAgo: string;
  text: string;
  image?: string;
  audioUrl?: string;
  audioDuration?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  activeRoomId?: string;
  activeRoomTitle?: string;
  tags?: string[];
}

interface CreateMomentModalProps {
  user: UserProfile;
  activeRoom?: VoiceRoom | null;
  onClose: () => void;
  onPublish: (moment: MomentItem) => void;
}

export const CreateMomentModal: React.FC<CreateMomentModalProps> = ({
  user,
  activeRoom,
  onClose,
  onPublish,
}) => {
  const { t, dir } = useI18n();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasVoice, setHasVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [attachRoom, setAttachRoom] = useState(Boolean(activeRoom));
  const [selectedTags, setSelectedTags] = useState<string[]>(['#يوميات']);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const AVAILABLE_TAGS = ['#يوميات', '#طرب_وصوت', '#تحديات_PK', '#ألعاب_SALEEM', '#شعر_وقصيد', '#سوالف_روم'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setRecordedAudioUrl(reader.result);
            setHasVoice(true);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setVoiceDuration(0);
      setHasVoice(false);
      setRecordedAudioUrl(null);

      recordTimerRef.current = setInterval(() => {
        setVoiceDuration((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      alert('⚠️ يرجى السماح بالوصول للميكروفون لتسجيل مقطع صوتي حقيقي');
    }
  };

  const handleStopRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleTogglePreviewAudio = () => {
    if (!recordedAudioUrl) return;
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(recordedAudioUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage && !hasVoice) {
      alert('يرجى كتابة نص أو إرفاق صورة أو تسجيل مقطع صوتي!');
      return;
    }

    const newMoment: MomentItem = {
      id: `moment-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      vipLevel: user.vipLevel || 5,
      userLevel: user.level || 20,
      timeAgo: 'الآن',
      text: content.trim(),
      image: selectedImage || undefined,
      audioUrl: hasVoice && recordedAudioUrl ? recordedAudioUrl : undefined,
      audioDuration: hasVoice ? `0:${voiceDuration < 10 ? '0' : ''}${voiceDuration || 8}` : undefined,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      activeRoomId: attachRoom && activeRoom ? activeRoom.id : undefined,
      activeRoomTitle: attachRoom && activeRoom ? activeRoom.title : undefined,
      tags: selectedTags,
    };

    onPublish(newMoment);
    onClose();
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#16122b] via-[#0d0a1c] to-[#080514] border-2 border-purple-500/60 rounded-3xl p-5 text-start shadow-[0_0_40px_rgba(168,85,247,0.3)] space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <h3 className="font-black text-base text-amber-300">{t('createMoment')}</h3>
          </div>

          <div className="w-8" />
        </div>

        {/* User Mini Bar */}
        <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-2xl border border-purple-500/30">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400" />
          <div>
            <span className="font-black text-xs text-white block">{user.name}</span>
            <span className="text-[10px] text-amber-300 font-bold">مشاركة مع مجتمع SALEEM 🌟</span>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-1.5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="شارك لحظاتك، خواطرك، أو تسجيلاتك الصوتية مع الأصدقاء..."
            rows={4}
            className="w-full bg-[#120d24] border border-purple-500/40 focus:border-amber-400 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none transition-colors"
          />
        </div>

        {/* Image Preview if selected */}
        {selectedImage && (
          <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 max-h-48 group">
            <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Voice Note Recorded Preview */}
        {hasVoice && recordedAudioUrl && (
          <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 p-3 rounded-2xl border border-purple-400/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleTogglePreviewAudio}
                className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow cursor-pointer transition-all active:scale-95"
                title={isPlayingPreview ? 'إيقاف المعاينة' : 'تشغيل وسماع التسجيل'}
              >
                {isPlayingPreview ? <Square className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-bold text-amber-300 block">تسجيل صوتي حقيقي ({voiceDuration || 1} ثانية) 🎵</span>
                <span className="text-[10px] text-slate-400">انقر للاستماع قبل النشر</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setHasVoice(false);
                setRecordedAudioUrl(null);
                if (previewAudioRef.current) previewAudioRef.current.pause();
                setIsPlayingPreview(false);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors p-1"
            >
              حذف
            </button>
          </div>
        )}

        {/* Recording active state */}
        {isRecording && (
          <div className="bg-rose-950/80 border border-rose-500/60 p-3.5 rounded-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-xs font-black text-rose-300">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span>جاري التسجيل الصوتي... 0:{voiceDuration < 10 ? '0' : ''}{voiceDuration}</span>
            </div>
            <button
              type="button"
              onClick={handleToggleRecord}
              className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>إيقاف وحفظ</span>
            </button>
          </div>
        )}

        {/* Tag Picker */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>اختر وسوم اللحظة:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Link Room Option */}
        {activeRoom && (
          <div
            onClick={() => setAttachRoom(!attachRoom)}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              attachRoom ? 'bg-amber-500/15 border-amber-400 text-amber-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <div>
                <span className="text-xs font-black block text-white">إرفاق رابط غرفتي الصوتية المباشرة</span>
                <span className="text-[10px] text-amber-300">"{activeRoom.title}"</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${attachRoom ? 'bg-amber-400 border-amber-300 text-slate-950' : 'border-slate-700'}`}>
              {attachRoom && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
        )}

        {/* Media Attach Tools */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-900/40">
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-white border border-purple-500/30 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>صورة</span>
            </button>

            {/* Voice record button */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border-amber-500/30'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>{isRecording ? 'إيقاف' : 'تسجيل صوتي'}</span>
            </button>
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>نشر اللحظة 🚀</span>
          </button>
        </div>

      </div>
    </div>
  );
};
