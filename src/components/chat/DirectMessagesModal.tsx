import React, { useState } from 'react';
import { UserProfile, PrivateConversation, DirectMessage } from '../../types';
import { X, Send, Image, Mic, Gift, Phone, Video, Search, CheckCheck, Crown, Sparkles, Bot } from 'lucide-react';


interface DirectMessagesModalProps {
  user: UserProfile;
  onClose: () => void;
  onStartCall?: (partner: { id: string; name: string; avatar: string }, isVideo: boolean) => void;
}

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  user,
  onClose,
  onStartCall,
}) => {
  const [conversations, setConversations] = useState<PrivateConversation[]>([
    {
      partnerId: 'bot_salem_ai',
      partnerName: 'مساعد سليم الذكي 🤖',
      partnerAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      partnerVip: 10,
      isOnline: true,
      lastMessage: 'أهلاً بك! أنا مساعد سليم الذكي، اسألني عن أي شيء وسأجيبك فوراً! 🌟',
      lastMessageTime: 'الآن',
      unreadCount: 0,
      messages: [
        {
          id: 'ai_intro',
          senderId: 'bot_salem_ai',
          senderName: 'مساعد سليم الذكي 🤖',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
          receiverId: user.id,
          text: `👑 مرحباً بك يا ${user.name || 'صديقنا'} في تطبيق SALEEM!\nأنا مساعدك الذكي لخدمة العملاء والدعم الفني 24/7 🤖✨\n\nاسألني عن الشحن، سحب الأرباح، الغرف الصوتية، الوكالات، أو مستويات VIP وسأجيبك فوراً!`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
        },
      ],
    },
    {
      partnerId: 'user_sara',
      partnerName: 'سارة الملكة 👑',
      partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      partnerVip: 6,
      isOnline: true,
      lastMessage: 'شكراً جزيلاً على الهدية الفخمة في الروم! 🌹',
      lastMessageTime: '10:45 م',
      unreadCount: 1,
      messages: [
        {
          id: '1',
          senderId: 'user_sara',
          senderName: 'سارة الملكة 👑',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          receiverId: user.id,
          text: 'مرحباً! نورت الروم اليوم ✨',
          timestamp: '10:40 م',
          isRead: true,
        },
      ],
    },
  ]);

  const [activePartner, setActivePartner] = useState<PrivateConversation | null>(conversations[0]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activePartner) return;

    const userText = inputText.trim();
    const newMsg: DirectMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      receiverId: activePartner.partnerId,
      text: userText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setActivePartner((prev) => (prev ? { ...prev, messages: [...prev.messages, newMsg], lastMessage: newMsg.text || '' } : null));
    setConversations((prev) =>
      prev.map((c) =>
        c.partnerId === activePartner.partnerId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text || '', lastMessageTime: 'الآن' }
          : c
      )
    );
    setInputText('');

    if (activePartner.partnerId === 'bot_salem_ai') {
      setIsAiTyping(true);
      Promise.resolve('شكراً لتواصلك! يمكنك التواصل مع فريق الدعم من خلال غرفة الإدارة الرسمية في القائمة الرئيسية. 🌟')
        .then((reply) => {
          const aiReply: DirectMessage = {
            id: `ai_${Date.now()}`,
            senderId: 'bot_salem_ai',
            senderName: 'مساعد سليم الذكي 🤖',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
            receiverId: user.id,
            text: reply,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            isRead: true,
          };

          setActivePartner((prev) => (prev && prev.partnerId === 'bot_salem_ai' ? { ...prev, messages: [...prev.messages, aiReply], lastMessage: reply.slice(0, 40) + '...' } : prev));
          setConversations((prev) =>
            prev.map((c) =>
              c.partnerId === 'bot_salem_ai'
                ? { ...c, messages: [...c.messages, aiReply], lastMessage: reply.slice(0, 40) + '...', lastMessageTime: 'الآن' }
                : c
            )
          );
        })
        .finally(() => {
          setIsAiTyping(false);
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#16182c] via-[#0d0e1a] to-[#06070e] border-2 border-indigo-500/70 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(99,102,241,0.3)] space-y-4 overflow-hidden h-[85vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="font-black text-sm text-indigo-300">الرسائل والمحادثات الخاصة 💬</h3>

          <div className="w-6" />
        </div>

        {/* 📱 CONVERSATIONS LIST OR ACTIVE CHAT VIEW */}
        {!activePartner ? (
          /* CONVERSATIONS LIST */
          <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-right">
            {conversations.map((c) => (
              <div
                key={c.partnerId}
                onClick={() => setActivePartner(c)}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">{c.lastMessageTime}</span>
                  {c.unreadCount > 0 && (
                    <span className="mt-1 inline-block bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full text-center leading-4">
                      {c.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-white block">{c.partnerName}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">{c.lastMessage}</span>
                  </div>

                  <div className="relative">
                    <img src={c.partnerAvatar} alt={c.partnerName} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500" />
                    {c.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ACTIVE 1v1 CHAT VIEW */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Active Partner Top Bar */}
            <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStartCall?.({ id: activePartner.partnerId, name: activePartner.partnerName, avatar: activePartner.partnerAvatar }, false)}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                  title="مكالمة صوتية خاصة"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onStartCall?.({ id: activePartner.partnerId, name: activePartner.partnerName, avatar: activePartner.partnerAvatar }, true)}
                  className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow"
                  title="مكالمة فيديو خاصة"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="text-xs font-black text-white block">{activePartner.partnerName}</span>
                  <span className="text-[9px] text-emerald-400">{activePartner.isOnline ? 'متصل الآن 🟢' : 'غير متصل'}</span>
                </div>
                <img src={activePartner.partnerAvatar} alt={activePartner.partnerName} className="w-9 h-9 rounded-full object-cover border border-indigo-400" />
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2 p-2 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col">
              {activePartner.messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-2.5 rounded-2xl text-xs text-right shadow-md ${isMe ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'}`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-[9px] text-slate-300/80 block mt-1">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}

              {isAiTyping && activePartner.partnerId === 'bot_salem_ai' && (
                <div className="flex justify-end">
                  <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-indigo-300 flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>مساعد سليم الذكي يكتب الإجابة... 🤖</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب رسالة خاصة..."
                className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-right text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
