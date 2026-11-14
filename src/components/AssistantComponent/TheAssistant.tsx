"use client";

import styles from "./TheAssistant.module.scss";
import cn from "classnames";
import Link from "next/link";
import {
  Fragment,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Bot,
  MessageCircle,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { playChime, unlockAudio } from "./sound";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Persist the conversation in sessionStorage: survives page reloads and locale
// switches within the tab, but clears when the tab closes (kept out of
// localStorage on purpose — chat can contain personal data).
const STORAGE_KEY = "assistant:chat:v1";
const MAX_STORED_MESSAGES = 50;
const TEASER_SESSION_KEY = "assistant:teaser-shown:v1";
const MUTE_KEY = "assistant:muted";

/** Abort a request that never finishes; show a cancellation notice. */
const REQUEST_TIMEOUT_MS = 45000;
/** Fewer chips after an answer, so they don't push it out of view. */
const MAX_FOLLOWUP_SUGGESTIONS = 4;
/** Same width as $sm: below it the panel fills the screen. */
const FULL_SCREEN_PANEL_QUERY = "(max-width: 640px)";
/** After this long with no first token, switch the status text to "almost". */
const STATUS_STAGE2_MS = 6000;
/** Delay before the attention teaser pops in on first visit. */
const TEASER_OPEN_DELAY_MS = 2500;
/** Auto-hide the teaser after this long. */
const TEASER_AUTO_HIDE_MS = 9000;

type Teaser = "greeting" | "answer";
type Notice = "error" | "timeout" | "overloaded";

function loadStoredMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ChatMessage =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string",
    );
  } catch {
    return [];
  }
}

const INLINE_TOKEN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

/** Render `[label](href)` links and `**bold**` inside a single line. */
function parseInline(text: string, onLinkClick: () => void): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  INLINE_TOKEN.lastIndex = 0;
  while ((match = INLINE_TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, linkLabel, linkHref, boldText] = match;
    if (linkHref) {
      const isInternal = linkHref.startsWith("/");
      if (isInternal) {
        nodes.push(
          <Link
            key={`l${key++}`}
            href={linkHref}
            className={styles.link}
            onClick={onLinkClick}
          >
            {linkLabel}
          </Link>,
        );
      } else {
        nodes.push(
          <a
            key={`l${key++}`}
            href={linkHref}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkLabel}
          </a>,
        );
      }
    } else if (boldText) {
      nodes.push(<strong key={`b${key++}`}>{boldText}</strong>);
    }

    lastIndex = INLINE_TOKEN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/** Render assistant text: split lines, treat `*`/`-` prefixes as list items. */
function renderContent(text: string, onLinkClick: () => void): ReactNode {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);

  return lines.map((line, index) => {
    const trimmed = line.trim();
    const isBullet = /^[*-]\s+/.test(trimmed);

    if (isBullet) {
      return (
        <span key={index} className={styles.bullet}>
          {parseInline(trimmed.replace(/^[*-]\s+/, ""), onLinkClick)}
        </span>
      );
    }

    return (
      <Fragment key={index}>
        {index > 0 && <br />}
        {parseInline(trimmed, onLinkClick)}
      </Fragment>
    );
  });
}

export const TheAssistant = () => {
  const t = useTranslations("Assistant");
  const locale = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [statusStage, setStatusStage] = useState(0);
  const [unread, setUnread] = useState(false);
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const [muted, setMuted] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const statusTimerRef = useRef<number | undefined>(undefined);
  const openRef = useRef(false);
  const mutedRef = useRef(false);

  // Prefer the dedicated invisible-mode key for the assistant; fall back to the
  // shared site key until the dedicated pair is configured. If you set the
  // dedicated site key, set TURNSTILE_ASSISTANT_SECRET_KEY on the server too.
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_ASSISTANT_SITE_KEY ||
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const tokenResolveRef = useRef<((token: string | null) => void) | null>(null);

  const allSuggestions = t.raw("suggestions") as string[];
  const suggestions =
    messages.length === 0
      ? allSuggestions
      : allSuggestions
          .filter((s) => !messages.some((m) => m.content === s))
          .slice(0, MAX_FOLLOWUP_SUGGESTIONS);

  function notifySound(kind: "notify" | "soft") {
    if (!mutedRef.current) playChime(kind);
  }

  /** Trigger the invisible Turnstile challenge and resolve with a fresh token. */
  function requestCaptchaToken(): Promise<string | null> {
    const widget = turnstileRef.current;
    if (!turnstileSiteKey || !widget) return Promise.resolve(null);

    return new Promise((resolve) => {
      tokenResolveRef.current = resolve;
      try {
        widget.reset();
        widget.execute();
      } catch {
        tokenResolveRef.current = null;
        resolve(null);
        return;
      }
      // Fallback so a stuck challenge never hangs the send.
      window.setTimeout(() => {
        if (tokenResolveRef.current) {
          tokenResolveRef.current = null;
          resolve(null);
        }
      }, 15000);
    });
  }

  function resolveToken(token: string | null) {
    tokenResolveRef.current?.(token);
    tokenResolveRef.current = null;
  }

  function openPanel() {
    unlockAudio(); // gesture → allow notification sounds later
    setIsOpen(true);
    setUnread(false);
    setTeaser(null);
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setNotice(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors (private mode / disabled storage).
    }
  }

  function toggleMute() {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        // Ignore storage errors.
      }
      return next;
    });
  }

  // Keep refs in sync for use inside async callbacks / timers.
  useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Load the persisted mute preference (a per-user setting → localStorage).
  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      // Ignore storage errors.
    }
  }, []);

  // Restore any persisted conversation on mount.
  const hasHydratedRef = useRef(false);
  useEffect(() => {
    const stored = loadStoredMessages();
    if (stored.length) setMessages(stored);
    hasHydratedRef.current = true;
  }, []);

  // Persist the conversation after each completed turn.
  useEffect(() => {
    if (!hasHydratedRef.current || isStreaming) return;
    try {
      if (messages.length === 0) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)),
        );
      }
    } catch {
      // Ignore storage errors (private mode / quota / disabled storage).
    }
  }, [messages, isStreaming]);

  // Attention teaser on first visit (once per tab session).
  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(TEASER_SESSION_KEY) === "1";
    } catch {
      // Ignore storage errors.
    }
    if (alreadyShown) return;

    const id = window.setTimeout(() => {
      if (openRef.current) return;
      setTeaser("greeting");
      setUnread(true);
      notifySound("soft");
      try {
        sessionStorage.setItem(TEASER_SESSION_KEY, "1");
      } catch {
        // Ignore storage errors.
      }
    }, TEASER_OPEN_DELAY_MS);

    return () => window.clearTimeout(id);
  }, []);

  // Auto-hide the teaser bubble.
  useEffect(() => {
    if (!teaser) return;
    const id = window.setTimeout(() => setTeaser(null), TEASER_AUTO_HIDE_MS);
    return () => window.clearTimeout(id);
  }, [teaser]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Full-screen panel: iOS ignores overflow:hidden on the page and lays its
  // keyboard over the layout, so pin the body and fit the panel to what's visible.
  useEffect(() => {
    const panel = panelRef.current;
    const viewport = window.visualViewport;
    if (
      !isOpen ||
      !panel ||
      !viewport ||
      !window.matchMedia(FULL_SCREEN_PANEL_QUERY).matches
    ) {
      return;
    }

    const { style: bodyStyle } = document.body;
    const pageScrollY = window.scrollY;
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${pageScrollY}px`;
    bodyStyle.width = "100%";

    const fitPanel = () => {
      panel.style.setProperty("--assistant-top", `${viewport.offsetTop}px`);
      panel.style.setProperty("--assistant-height", `${viewport.height}px`);
    };
    // The keyboard shrinks the message list: keep the latest message in view.
    const handleResize = () => {
      fitPanel();
      const list = scrollRef.current;
      if (list) list.scrollTop = list.scrollHeight;
    };

    fitPanel();
    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", fitPanel);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", fitPanel);
      panel.style.removeProperty("--assistant-top");
      panel.style.removeProperty("--assistant-height");
      bodyStyle.position = "";
      bodyStyle.top = "";
      bodyStyle.width = "";
      window.scrollTo({ top: pageScrollY, behavior: "instant" });
    };
  }, [isOpen]);

  /** Core send: append `text` to `base` history and stream the answer. */
  async function runSend(base: ChatMessage[], text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    unlockAudio(); // called from a click/tap → unlock audio for the reply chime
    setNotice(null);
    setInput("");

    const nextMessages: ChatMessage[] = [
      ...base,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setIsStreaming(true);
    setStatusStage(0);

    window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(
      () => setStatusStage(1),
      STATUS_STAGE2_MS,
    );

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const captchaToken = await requestCaptchaToken();
      if (turnstileSiteKey && !captchaToken) {
        // Expected condition (challenge couldn't complete silently): surface a
        // friendly notice + Retry instead of throwing a raw console error.
        setNotice("error");
        return;
      }

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: nextMessages, captchaToken }),
        signal: controller.signal,
      });

      if (response.status === 503) {
        setNotice("overloaded");
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      // Add an empty assistant bubble we fill in as chunks arrive.
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedAny = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        if (!receivedAny) {
          receivedAny = true;
          window.clearTimeout(statusTimerRef.current);
        }
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk,
          };
          return updated;
        });
      }

      // Chime when the answer is ready. If the panel is closed, also raise the
      // unread badge + teaser so the user knows to come back.
      if (!openRef.current) {
        setUnread(true);
        setTeaser("answer");
        notifySound("notify");
      } else {
        notifySound("soft");
      }
    } catch (error) {
      console.error("[assistant] send failed:", error);
      setNotice(timedOut ? "timeout" : "error");
      // Drop the assistant bubble if it never received any content.
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      window.clearTimeout(timeoutId);
      window.clearTimeout(statusTimerRef.current);
      setIsStreaming(false);
      setStatusStage(0);
    }
  }

  function sendMessage(text: string) {
    runSend(messages, text);
  }

  function handleRetry() {
    // Re-run the last user message without duplicating it: rewind to just
    // before it (dropping any partial assistant reply) and resend.
    const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserIndex < 0) return;
    const lastUser = messages[lastUserIndex];
    runSend(messages.slice(0, lastUserIndex), lastUser.content);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  const closePanel = () => setIsOpen(false);
  const waitingForFirstToken =
    isStreaming && messages[messages.length - 1]?.role === "user";

  return (
    <>
      {teaser && !isOpen && (
        <div
          className={cn(styles.teaser, styles.teaserVisible)}
          role="button"
          tabIndex={0}
          onClick={openPanel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPanel();
            }
          }}
        >
          <span className={styles.teaserText}>
            {teaser === "answer" ? t("teaserAnswer") : t("teaserGreeting")}
          </span>
          <button
            type="button"
            className={styles.teaserClose}
            onClick={(e) => {
              e.stopPropagation();
              setTeaser(null);
            }}
            aria-label={t("close")}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      )}

      <button
        type="button"
        className={cn(styles.fab, {
          [styles.fabHidden]: isOpen,
          [styles.fabPulse]: unread && !isOpen,
        })}
        onClick={openPanel}
        aria-label={t("fabLabel")}
      >
        <MessageCircle size={26} aria-hidden />
        {unread && !isOpen && <span className={styles.unreadDot} aria-hidden />}
      </button>

      <div
        ref={panelRef}
        className={cn(styles.panel, { [styles.panelOpen]: isOpen })}
        role="dialog"
        aria-label={t("title")}
        aria-hidden={!isOpen}
      >
        <header className={styles.header}>
          <span className={styles.headerIcon} aria-hidden>
            <Bot size={22} />
          </span>
          <span className={styles.headerText}>
            <span className={styles.headerTitle}>{t("title")}</span>
            <span className={styles.headerSubtitle}>{t("subtitle")}</span>
          </span>
          <button
            type="button"
            className={styles.headerBtn}
            onClick={toggleMute}
            aria-label={muted ? t("unmuteSound") : t("muteSound")}
            title={muted ? t("unmuteSound") : t("muteSound")}
          >
            {muted ? (
              <VolumeX size={18} aria-hidden />
            ) : (
              <Volume2 size={18} aria-hidden />
            )}
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              className={styles.headerBtn}
              onClick={handleNewChat}
              aria-label={t("newChat")}
              title={t("newChat")}
            >
              <RotateCcw size={18} aria-hidden />
            </button>
          )}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closePanel}
            aria-label={t("close")}
          >
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className={styles.messages} ref={scrollRef}>
          <div className={cn(styles.bubble, styles.bubbleAssistant)}>
            {t("greeting")}
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(styles.bubble, styles.bubbleEnter, {
                [styles.bubbleUser]: message.role === "user",
                [styles.bubbleAssistant]: message.role === "assistant",
              })}
            >
              {message.role === "assistant"
                ? renderContent(message.content, closePanel)
                : message.content}
            </div>
          ))}

          {!isStreaming && !notice && (
            <div className={cn(styles.suggestions, styles.bubbleEnter)}>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={styles.suggestion}
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {waitingForFirstToken && (
            <div
              className={cn(
                styles.bubble,
                styles.bubbleAssistant,
                styles.typingBubble,
              )}
              role="status"
              aria-live="polite"
            >
              <span className={styles.typingDots} aria-hidden>
                <span />
                <span />
                <span />
              </span>
              <span className={styles.statusText}>
                {statusStage === 0 ? t("statusProcessing") : t("statusAlmost")}
              </span>
            </div>
          )}

          {notice && (
            <div className={styles.errorRow} role="status" aria-live="polite">
              <span className={styles.errorText}>
                {notice === "timeout"
                  ? t("timeout")
                  : notice === "overloaded"
                    ? t("overloaded")
                    : t("error")}
              </span>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={handleRetry}
              >
                {t("retry")}
              </button>
            </div>
          )}
        </div>

        {turnstileSiteKey && isOpen && (
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            options={{
              execution: "execute",
              appearance: "interaction-only",
              size: "flexible",
            }}
            onSuccess={(token) => resolveToken(token)}
            onError={() => resolveToken(null)}
            onExpire={() => resolveToken(null)}
          />
        )}

        <div className={styles.inputBar}>
          <textarea
            ref={inputRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            rows={1}
            maxLength={2000}
          />
          <button
            type="button"
            className={styles.sendBtn}
            onClick={() => sendMessage(input)}
            disabled={isStreaming || input.trim().length === 0}
            aria-label={t("send")}
          >
            <Send size={20} aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
};
