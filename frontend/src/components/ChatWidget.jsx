import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { api } from "../lib/api";

const STORAGE_KEY = "didi_chat_session";

const WELCOME = "Ciao 👋 Sono l'assistente virtuale di Database Immobiliare Daniela. Come posso aiutarti? Puoi chiedermi di vendite, affitti, valutazioni, strumenti, programma Acquisitore Occasionale… o qualsiasi cosa sul mercato immobiliare di Loano e Riviera.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [messages, setMessages] = useState([{ role: "assistant", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setSending(true);
    try {
      const { data } = await api.post("/chat/message", {
        session_id: sessionId,
        message: text,
      });
      if (!sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem(STORAGE_KEY, data.session_id);
      }
      setMessages(m => [...m, { role: "assistant", text: data.reply }]);
      if (!open) setUnread(true);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: "Mi spiace, c'è stato un problema. Riprova tra poco o scrivici su WhatsApp al 339 717 9087." }]);
    } finally {
      setSending(false);
    }
  };

  const toggle = () => {
    setOpen(o => !o);
    if (!open) setUnread(false);
  };

  const quickReplies = [
    "Voglio vendere casa",
    "Cerco casa a Loano",
    "Come funziona l'Acquisitore Occasionale?",
  ];

  return (
    <>
      <button
        className={`chat-fab ${open ? "open" : ""}`}
        onClick={toggle}
        aria-label="Apri chat"
        data-testid="chat-fab"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {unread && !open && <span className="chat-badge" />}
        {!open && <span className="chat-fab-ping" />}
      </button>

      {open && (
        <div className="chat-panel" data-testid="chat-panel">
          <div className="chat-header">
            <div className="chat-avatar">
              <Sparkles size={18} />
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">Assistente Daniela</div>
              <div className="chat-header-status">
                <span className="chat-dot" /> AI · online 24/7
              </div>
            </div>
            <button className="chat-close" onClick={toggle} aria-label="Chiudi" data-testid="chat-close"><X size={18}/></button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg-${m.role}`} data-testid={`chat-msg-${i}`}>
                <ChatBubble text={m.text} />
              </div>
            ))}
            {sending && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-bubble">
                  <span className="chat-typing"><i/><i/><i/></span>
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && !sending && (
            <div className="chat-quick">
              {quickReplies.map(q => (
                <button key={q} className="chat-quick-btn" onClick={() => { setInput(q); setTimeout(send, 50); }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi un messaggio…"
              data-testid="chat-input"
              disabled={sending}
              autoFocus
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Invia" data-testid="chat-send">
              <Send size={18} />
            </button>
          </form>
          <div className="chat-foot">Powered by AI · Per assistenza umana: <a href="tel:+393397179087">339 717 9087</a></div>
        </div>
      )}
    </>
  );
}

function ChatBubble({ text }) {
  const html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
    .replace(/(\/[a-z0-9-/]+)/gi, '<a href="$1" class="chat-link">$1</a>');
  return <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: html }} />;
}
