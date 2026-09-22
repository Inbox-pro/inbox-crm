import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  HelpCircle,
  FileText,
  TrendingUp,
  RefreshCw,
  Sliders,
  ExternalLink,
  Briefcase,
  Users as UsersIcon,
  Building2,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { AiChatMessage } from '../types';
import { Avatar } from '../components/common/Avatar';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { InboxLogo } from '../components/common/InboxLogo';

export const AiAssistant: React.FC = () => {
  const { currentUser, currentOrg } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg_0',
      sender: 'assistant',
      text: `Hello ${currentUser?.name || 'there'}! I am **Inbox AI Copilot**, your enterprise revenue and CRM intelligence assistant built by Inbox Infotech Pvt. Ltd.\n\nI can analyze your deal pipeline, draft executive follow-ups, score high-value inbound prospects, and automate CRM task creation. How can I assist you today?`,
      timestamp: '10:00 AM',
      suggestedActions: [
        'Which deals need attention today?',
        'Show my highest priority leads',
        'Summarize ABC Technologies',
        'Which deals are closing this month?',
      ],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const QUICK_PROMPTS = [
    {
      title: 'Deals Needing Attention',
      prompt: 'Which deals need attention today?',
      icon: TrendingUp,
    },
    {
      title: 'Top Priority Leads',
      prompt: 'Show my highest priority leads',
      icon: UsersIcon,
    },
    {
      title: 'Draft Follow-Up Email',
      prompt: 'Draft an executive follow-up email for Sunita Menon',
      icon: FileText,
    },
    {
      title: 'Deals Closing This Month',
      prompt: 'Which deals are closing this month?',
      icon: Zap,
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: AiChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const response = await aiService.sendMessage(query);
      setMessages((prev) => [...prev, response.data]);
    } catch (err) {
      console.error(err);
      showToast('AI service response error. Please retry.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied response to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Ready for your next CRM intelligence query. How can I help?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Which deals need attention today?',
          'Show my highest priority leads',
          'Summarize ABC Technologies',
        ],
      },
    ]);
    showToast('Conversation cleared');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-5xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Inbox AI Assistant</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Gemini Ready
                </span>
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI-powered intelligence copilot by Inbox Infotech for sales forecasting, lead qualification, and customer follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            Tenant: <strong className="text-slate-800 dark:text-slate-200">{currentOrg?.name || 'Inbox Infotech'}</strong>
          </span>
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Clear Chat History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        {QUICK_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(item.prompt)}
              className="p-2.5 text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {isAssistant ? (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : (
                  <Avatar name={currentUser?.name || 'User'} size="sm" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80'
                    : 'bg-blue-600 text-white shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className="font-bold text-[11px] opacity-80 flex items-center gap-1.5">
                    {isAssistant ? 'Inbox AI Copilot' : currentUser?.name || 'You'}
                    {isAssistant && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                        Inbox Infotech
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Text Content */}
                <div className="whitespace-pre-line text-xs font-normal selection:bg-blue-300">
                  {msg.text}
                </div>

                {/* Structured Interactive Entity Cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    {msg.cards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {card.type}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {card.value}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                            {card.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {card.subtitle}
                          </p>
                        </div>

                        {card.link && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <Link
                              to={card.link}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <span>Inspect Record</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Suggested Actions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => handleSendMessage(action)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 transition-colors text-left"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistant Footer Copy Tool */}
                {isAssistant && (
                  <div className="flex justify-end pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 text-xs items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
              <span className="text-slate-400 text-xs ml-1 font-medium">Inbox AI is analyzing CRM signals...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Ask Inbox AI to forecast revenue, summarize leads, audit deal risks, or draft emails..."
          className="flex-1 px-3 py-2 text-xs bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isTyping}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
