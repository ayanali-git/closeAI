'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Message } from '@/lib/chat-service';
import { CloseAIIcon } from '@/components/brand/logo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Share2,
  Paperclip,
  ArrowDown,
  Volume2,
  VolumeX,
  Loader,
  MoreHorizontal,
  Pencil
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import toast from '@/lib/toast';

export interface MessageListProps {
  messages: Message[];
  user: User | null;
  isTyping: boolean;
  pendingMessage: { content: string; files: any[] } | null;
  onRegenerate?: (message?: Message, index?: number) => void;
  onEditMessage?: (content: string) => void;
  onEditAndResend?: (messageId: string, newContent: string, messageIndex: number) => void;
}

const LANG_ALIAS: Record<string, string> = {
  'c++': 'cpp',
  'cpp': 'cpp',
  'c': 'c',
  'py': 'python',
  'python': 'python',
  'js': 'javascript',
  'javascript': 'javascript',
  'ts': 'typescript',
  'typescript': 'typescript',
  'jsx': 'jsx',
  'tsx': 'tsx',
  'sh': 'bash',
  'shell': 'bash',
  'bash': 'bash',
  'zsh': 'bash',
  'json': 'json',
  'sql': 'sql',
  'css': 'css',
  'html': 'markup',
  'xml': 'markup',
  'svg': 'markup',
  'markup': 'markup',
  'java': 'java',
  'cs': 'csharp',
  'csharp': 'csharp',
  'c#': 'csharp',
  'go': 'go',
  'golang': 'go',
  'rust': 'rust',
  'rs': 'rust',
};

function highlightCode(code: string, lang: string): string {
  const cleanLang = (lang || '').toLowerCase().trim();
  const normalized = LANG_ALIAS[cleanLang] || cleanLang;
  const grammar = Prism.languages[normalized] || Prism.languages.clike || Prism.languages.javascript;
  if (!grammar) {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  try {
    return Prism.highlight(code, grammar, normalized);
  } catch (e) {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/** Preprocesses LaTeX formula markers, currency dollar signs, table formatting, and unclosed delimiters */
function preprocessContent(text: string): string {
  if (!text) return '';

  let result = text;

  // 1. Convert pipe-pipe separated lines into proper markdown table rows with newlines
  result = result.replace(/\|\s*\|\s*/g, '|\n| ');

  // 2. Prevent currency dollar signs ($100, $1 Trillion, $2.5B) from being incorrectly parsed as LaTeX math
  // In KaTeX / remark-math, any $ followed immediately by a digit is a monetary amount, not a formula
  result = result.replace(/(?<!\\)\$(?=\d)/g, '\\$');

  // 3. Normalize LaTeX display/inline brackets \[ \] and \( \)
  result = result
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 4. Fix unescaped underscores inside \text{...} in math formulas
  result = result.replace(/\\text\{([^}]+)\}/g, (_, inner) => {
    return `\\text{${inner.replace(/(?<!\\)_/g, '\\_')}}`;
  });

  // 5. Clean up awkward spaced asterisks like "* *, **"
  result = result.replace(/\*\s+\*,\s+\*\*/g, ', **');

  // 6. Auto-close dangling unclosed code blocks (```) during streaming/interrupted generation
  const codeBlockCount = (result.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    result += '\n```';
  }

  // 7. Auto-close dangling bold (**) during streaming/interrupted generation
  const boldCount = (result.match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    result += '**';
  }

  return result;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  let displayLang = language ? language.toLowerCase().trim() : "";
  if (!displayLang) {
    const firstLine = code.trim().split("\n")[0].trim();
    if (
      /^(sudo|brew|apt|dnf|pacman|yum|npm|npx|pnpm|yarn|git|docker|curl|wget|cd|mkdir|chmod|chown|systemctl|export|source|sh|bash)\b/.test(
        firstLine
      )
    ) {
      displayLang = "bash";
    } else {
      displayLang = "code";
    }
  }

  const highlightedHtml = useMemo(() => {
    return highlightCode(code, displayLang);
  }, [code, displayLang]);

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-neutral-200/90 dark:border-neutral-700/60 bg-neutral-50 dark:bg-[#141414] text-left">
      {/* Header bar: language + copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-[#1f1f1f] text-xs font-sans text-neutral-600 dark:text-neutral-300 select-none border-b border-neutral-200/80 dark:border-neutral-700/60">
        <span className="font-mono text-base lowercase font-medium tracking-wide text-foreground">
          {displayLang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-2 rounded-sm text-base text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer outline-none"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="font-medium">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content with horizontal scrollbar */}
      <div className="p-3.5 sm:p-4 overflow-x-auto code-scroll text-[15px] sm:text-[14px] font-mono leading-relaxed bg-neutral-100 dark:bg-[#1f1f1f] select-text">
        <pre className="!m-0 !p-0 bg-transparent border-0 font-mono whitespace-pre w-max min-w-full">
          <code
            className={`!bg-transparent !p-0 font-mono whitespace-pre block language-${displayLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}

function isImageFile(file: any): boolean {
  if (file?.type && typeof file.type === 'string' && file.type.toLowerCase().startsWith('image/')) {
    return true;
  }
  const name = file?.filename || file?.name || file?.url || '';
  if (typeof name === 'string') {
    return (
      /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)(\?.*)?$/i.test(name) ||
      /^pasted_image/i.test(name)
    );
  }
  return false;
}

function MessageAttachmentItem({ file }: { file: any }) {
  const isImg = isImageFile(file);
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (file?.url && typeof file.url === 'string') return file.url;
    if (typeof window !== 'undefined' && file instanceof File) {
      try {
        return URL.createObjectURL(file);
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  useEffect(() => {
    if (file?.url && typeof file.url === 'string') {
      setImgSrc(file.url);
    } else if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const displayName = file?.filename || file?.name || 'File';

  if (isImg && imgSrc) {
    return (
      <a
        href={imgSrc}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl bg-neutral-100 dark:bg-[#262626] transition-all max-w-[100px] sm:max-w-[150px] cursor-pointer select-none"
        title={displayName}
      >
        <img
          src={imgSrc}
          alt={displayName}
          className="w-full max-h-[180px] sm:max-h-[220px] object-cover rounded-xl transition-transform"
          loading="lazy"
        />
      </a>
    );
  }

  // Non-image file pill
  return (
    <div className="flex items-center gap-1.5 bg-secondary text-foreground text-sm sm:text-[14px] px-3 py-1.5 rounded-full border border-border">
      <Paperclip className="w-4 h-4 text-muted-foreground" />
      <span className="truncate max-w-[130px] sm:max-w-[160px] font-medium">
        {displayName}
      </span>
    </div>
  );
}

function getFeedbackCookie(): Record<string, 'up' | 'down'> {
  if (typeof document === 'undefined') return {};
  try {
    const cookies = document.cookie.split('; ');
    const feedbackCookie = cookies.find(row => row.trim().startsWith('feedback_response='));
    if (feedbackCookie) {
      const rawVal = feedbackCookie.split('=')[1] || '';
      if (!rawVal) return {};
      const res: Record<string, 'up' | 'down'> = {};
      rawVal.split(',').forEach(pair => {
        const [id, type] = pair.split(':');
        if (id && (type === 'up' || type === 'down')) {
          res[id] = type;
        }
      });
      return res;
    }
  } catch (e) {
    console.error('Error reading feedback cookie:', e);
  }
  return {};
}

function setFeedbackCookie(data: Record<string, 'up' | 'down'>) {
  if (typeof document === 'undefined') return;
  try {
    const entries = Object.entries(data).filter(([_, type]) => type === 'up' || type === 'down');
    if (entries.length === 0) {
      document.cookie = 'feedback_response=; path=/; max-age=0';
      return;
    }
    const val = entries.map(([id, type]) => `${id}:${type}`).join(',');
    document.cookie = `feedback_response=${val}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {
    console.error('Error writing feedback cookie:', e);
  }
}

export function MessageList({
  messages,
  user,
  isTyping,
  pendingMessage,
  onRegenerate,
  onEditMessage,
  onEditAndResend,
}: MessageListProps) {
  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [loadingFeedbackId, setLoadingFeedbackId] = useState<string | null>(null);
  const [loadingSpeechId, setLoadingSpeechId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraftText, setEditDraftText] = useState<string>('');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync feedback state from cookie on mount
  useEffect(() => {
    const initialFeedback = getFeedbackCookie();
    setFeedback(initialFeedback);
  }, []);

  // Stop speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = (msgId: string, content: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      setLoadingSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setLoadingSpeechId(msgId);

    const plainText = content
      .replace(/```[\s\S]*?```/g, 'Code block.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_-]/g, '')
      .trim();

    if (!plainText) {
      setLoadingSpeechId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(plainText);

    utterance.onstart = () => {
      setLoadingSpeechId(null);
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setLoadingSpeechId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setLoadingSpeechId(null);
    };

    try {
      window.speechSynthesis.speak(utterance);
      // Fallback timer if browser speech engine doesn't fire onstart callback immediately
      setTimeout(() => {
        setLoadingSpeechId((prev) => (prev === msgId ? null : prev));
        setSpeakingMessageId((prev) => (prev ? prev : msgId));
      }, 400);
    } catch (e) {
      setLoadingSpeechId(null);
      setSpeakingMessageId(null);
    }
  };

  // Auto-focus and resize textarea when entering edit mode
  useEffect(() => {
    if (editingMessageId && editTextareaRef.current) {
      editTextareaRef.current.focus();
      const valLength = editTextareaRef.current.value.length;
      editTextareaRef.current.setSelectionRange(valLength, valLength);
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${Math.min(editTextareaRef.current.scrollHeight, 280)}px`;
    }
  }, [editingMessageId]);

  const startEditing = (msgId: string, content: string) => {
    setEditingMessageId(msgId);
    setEditDraftText(content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditDraftText('');
  };

  const submitEdit = (msg: Message, index: number) => {
    if (!editDraftText.trim() || isTyping) return;
    const newContent = editDraftText.trim();
    setEditingMessageId(null);
    setEditDraftText('');
    if (onEditAndResend) {
      onEditAndResend(msg.id, newContent, index);
    } else if (onEditMessage) {
      onEditMessage(newContent);
    }
  };

  // Auto-scroll on new messages or typing
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [messages.length, isTyping, pendingMessage]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    const isCurrentlyActive = feedback[id] === type;

    // Clicking active feedback button again to remove feedback — no loader
    if (isCurrentlyActive) {
      setFeedback(prev => {
        const next = { ...prev };
        delete next[id];
        setFeedbackCookie(next);
        return next;
      });
      return;
    }

    // Submitting new feedback — show loader
    const key = `${id}-${type}`;
    setLoadingFeedbackId(key);

    setTimeout(() => {
      setFeedback(prev => {
        const next = { ...prev };
        next[id] = type;
        setFeedbackCookie(next);
        return next;
      });

      setLoadingFeedbackId(null);
      toast.success(type === 'up' ? 'Feedback submitted' : 'Feedback recorded');
    }, 200);
  };

  let userMessageCounter = 0;

  return (
    <div className="w-full max-w-3xl mx-auto pt-10 pb-2 space-y-5 px-6">
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const userMsgIndex = isUser ? userMessageCounter++ : null;
        const msgId = msg.id || `msg-${index}`;
        const isCopied = copiedId === msgId;
        const targetDomId = msg.id ? `msg-${msg.id}` : `message-${userMsgIndex}`;

        if (isUser) {
          const isEditing = editingMessageId === msgId;
          return (
            <div
              key={msgId}
              id={targetDomId}
              className={cn("flex flex-col group transition-all", isEditing ? "w-full items-stretch" : "items-end")}
            >
              {/* Attached Files & Image Previews */}
              {msg.files && msg.files.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mb-2.5 justify-end items-end">
                  {msg.files.map((file: any, i: number) => (
                    <MessageAttachmentItem key={file.id || file.url || i} file={file} />
                  ))}
                </div>
              )}

              {isEditing ? (
                /* Inline Editor */
                <div className="w-full bg-secondary dark:bg-[#2F2F2F] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-border/60 dark:border-neutral-700/60">
                  <textarea
                    ref={editTextareaRef}
                    value={editDraftText}
                    onChange={(e) => {
                      setEditDraftText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 280)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitEdit(msg, index);
                      } else if (e.key === 'Escape') {
                        cancelEditing();
                      }
                    }}
                    rows={Math.min(Math.max(editDraftText.split('\n').length, 2), 8)}
                    className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 resize-none text-[15px] sm:text-[15.5px] leading-relaxed text-foreground placeholder:text-muted-foreground select-text"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2 mt-2 pt-1 select-none">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-3 py-1.5 rounded-full text-[15px] font-medium bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => submitEdit(msg, index)}
                      disabled={!editDraftText.trim() || isTyping}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[15px] font-medium transition-all cursor-pointer",
                        editDraftText.trim() && !isTyping
                          ? "bg-foreground text-background hover:opacity-90 active:scale-95"
                          : "bg-neutral-300 dark:bg-[#484848] text-muted-foreground/60 cursor-not-allowed opacity-60"
                      )}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* User Bubble Capsule */}
                  <div className="bg-bubble dark:bg-[#2F2F2F] text-foreground text-[15px] sm:text-[15.5px] leading-relaxed rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap select-text break-words">
                    {msg.content}
                  </div>

                  {/* User Hover Actions Toolbar */}
                  <div className="flex items-center gap-1 mt-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => copyToClipboard(msg.content, msgId)}
                          className="p-1.5 rounded-sm hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Copy prompt"
                        >
                          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={4} className="text-md">Copy</TooltipContent>
                    </Tooltip>

                    {(onEditAndResend || onEditMessage) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => startEditing(msgId, msg.content)}
                            className="p-1.5 rounded-sm hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Edit message"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={4} className="text-md">Edit</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        }

        // Assistant Message View
        return (
          <div key={msgId} className="w-full group space-y-2">

            <div className="w-full space-y-3">
              {/* Message Content */}
              <div className="chat-markdown text-foreground select-text text-[15px] sm:text-[15.5px] leading-7 break-words overflow-hidden w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                  components={{
                    table({ children }: any) {
                      return (
                        <div className="my-4 w-full overflow-x-auto rounded-xl border border-border/70 bg-card/40">
                          <table className="w-full text-left border-collapse text-sm !m-0">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }: any) {
                      return (
                        <thead className="bg-secondary/70 dark:bg-[#1f1f1f] border-b border-border/80 text-foreground font-semibold text-xs tracking-wider uppercase">
                          {children}
                        </thead>
                      );
                    },
                    th({ children }: any) {
                      return (
                        <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wider">
                          {children}
                        </th>
                      );
                    },
                    td({ children }: any) {
                      return (
                        <td className="px-4 py-2.5 border-t border-border/80 text-foreground/90 text-sm align-top leading-relaxed">
                          {children}
                        </td>
                      );
                    },
                    tr({ children }: any) {
                      return (
                        <tr className="hover:bg-secondary/30 transition-colors">
                          {children}
                        </tr>
                      );
                    },
                    p({ children }: any) {
                      return <p className="mb-3.5 last:mb-0 leading-7 text-foreground/95">{children}</p>;
                    },
                    h1({ children }: any) {
                      return <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-foreground mt-7 mb-3 first:mt-0">{children}</h1>;
                    },
                    h2({ children }: any) {
                      return <h2 className="text-xl sm:text-[22px] font-semibold tracking-tight text-foreground mt-6 mb-2.5 first:mt-0">{children}</h2>;
                    },
                    h3({ children }: any) {
                      return <h3 className="text-lg sm:text-[19px] font-semibold tracking-tight text-foreground mt-5 mb-2 first:mt-0">{children}</h3>;
                    },
                    h4({ children }: any) {
                      return <h4 className="text-base font-semibold text-foreground mt-4 mb-1.5 first:mt-0">{children}</h4>;
                    },
                    ul({ children }: any) {
                      return <ul className="my-3 pl-6 list-disc space-y-1.5 text-foreground/95 leading-7">{children}</ul>;
                    },
                    ol({ children }: any) {
                      return <ol className="my-3 pl-6 list-decimal space-y-1.5 text-foreground/95 leading-7">{children}</ol>;
                    },
                    li({ children }: any) {
                      return <li className="leading-7 pl-0.5">{children}</li>;
                    },
                    blockquote({ children }: any) {
                      return <blockquote className="my-4 border-l-2 border-border/80 pl-4 italic text-muted-foreground leading-7">{children}</blockquote>;
                    },
                    hr() {
                      return <hr className="my-6 border-border/60" />;
                    },
                    strong({ children }: any) {
                      return <strong className="font-semibold text-foreground">{children}</strong>;
                    },
                    pre({ children }: any) {
                      if (React.isValidElement(children)) {
                        const childProps: any = children.props || {};
                        const match = /language-(\w+)/.exec(childProps.className || "");
                        const lang = match ? match[1] : "";
                        const rawCode = Array.isArray(childProps.children)
                          ? childProps.children.join("")
                          : String(childProps.children || "");
                        return (
                          <CodeBlock
                            language={lang}
                            code={rawCode.replace(/\n$/, "")}
                          />
                        );
                      }
                      return (
                        <div className="my-3 sm:my-4 rounded-xl overflow-hidden border border-neutral-200/90 dark:border-neutral-700/60 bg-neutral-50 dark:bg-[#1e1e1e] p-3 code-scroll">
                          <pre className="text-[15px] font-mono text-neutral-900 dark:text-neutral-100 whitespace-pre w-max min-w-full">
                            {children}
                          </pre>
                        </div>
                      );
                    },
                    code({ className, children, ...props }: any) {
                      return (
                        <code
                          className="bg-neutral-200/60 dark:bg-white/10 text-foreground px-1.5 py-0.5 rounded-md font-mono text-[15px] font-normal select-text"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {preprocessContent(msg.content)}
                </ReactMarkdown>
              </div>

              {/* Assistant Action Toolbar — revealed when typing completes */}
              {(!isTyping || index !== messages.length - 1) && (
                <div className="flex items-center gap-1.5 pt-1 text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => copyToClipboard(msg.content, msgId)}
                        className="p-1.5 rounded-sm hover:bg-secondary hover:text-foreground transition-colors"
                        aria-label="Copy response"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4} className="text-md">Copy</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleFeedback(msgId, 'up')}
                        disabled={loadingFeedbackId === `${msgId}-up`}
                        className={cn(
                          "p-1.5 rounded-sm transition-colors cursor-pointer disabled:opacity-70 disabled:pointer-events-auto disabled:cursor-not-allowed",
                          feedback[msgId] === 'up'
                            ? "text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        aria-label="Good response"
                      >
                        {loadingFeedbackId === `${msgId}-up` ? (
                          <Loader className="w-4 h-4 animate-spin text-foreground shrink-0" />
                        ) : (
                          <ThumbsUp
                            className={cn(
                              "w-4 h-4 transition-all",
                              feedback[msgId] === 'up' && "fill-current"
                            )}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4} className="text-md">Good response</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleFeedback(msgId, 'down')}
                        disabled={loadingFeedbackId === `${msgId}-down`}
                        className={cn(
                          "p-1.5 rounded-sm transition-colors cursor-pointer disabled:opacity-70 disabled:pointer-events-auto disabled:cursor-not-allowed",
                          feedback[msgId] === 'down'
                            ? "text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        aria-label="Bad response"
                      >
                        {loadingFeedbackId === `${msgId}-down` ? (
                          <Loader className="w-4 h-4 animate-spin text-foreground shrink-0" />
                        ) : (
                          <ThumbsDown
                            className={cn(
                              "w-4 h-4 transition-all",
                              feedback[msgId] === 'down' && "fill-current"
                            )}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4} className="text-md">Bad response</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleReadAloud(msgId, msg.content)}
                        disabled={loadingSpeechId === msgId}
                        className={cn(
                          "p-1.5 rounded-sm transition-colors cursor-pointer disabled:opacity-70 disabled:pointer-events-auto disabled:cursor-not-allowed",
                          speakingMessageId === msgId
                            ? "text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        aria-label={speakingMessageId === msgId ? "Stop reading" : "Read aloud"}
                      >
                        {loadingSpeechId === msgId ? (
                          <Loader className="w-4 h-4 animate-spin text-foreground shrink-0" />
                        ) : speakingMessageId === msgId ? (
                          <VolumeX className="w-4 h-4 text-foreground" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4} className="text-md">
                      {loadingSpeechId === msgId ? "Loading..." : speakingMessageId === msgId ? "Stop" : "Read aloud"}
                    </TooltipContent>
                  </Tooltip>

                  {onRegenerate && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onRegenerate(msg, index)}
                          disabled={isTyping}
                          className="p-1.5 rounded-sm hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Regenerate response"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={4} className="text-md">Regenerate</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Optimistic Pending User Message */}
      {pendingMessage && (
        <div className="flex flex-col items-end opacity-85">
          {pendingMessage.files.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-2.5 justify-end items-end">
              {pendingMessage.files.map((file, i) => (
                <MessageAttachmentItem key={i} file={file} />
              ))}
            </div>
          )}
          <div className="bg-bubble dark:bg-[#2F2F2F] text-foreground text-[15px] sm:text-[15.5px] leading-relaxed rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap select-text break-words">
            {pendingMessage.content}
          </div>
        </div>
      )}

      {/* Typing / Thinking Indicator — shown while AI is thinking before first token */}
      {isTyping &&
        (Boolean(pendingMessage) ||
          !messages.length ||
          messages[messages.length - 1]?.role === "user" ||
          (messages[messages.length - 1]?.role === "assistant" &&
            !messages[messages.length - 1]?.content)) && (
          <div className="flex gap-2.5 sm:gap-3 items-center py-2 select-none">
            <span className="text-[14px] sm:text-[14.5px] font-medium text-muted-foreground animate-pulse">
              Thinking...
            </span>
          </div>
        )}

      <div ref={scrollBottomRef} />
    </div>
  );
}
