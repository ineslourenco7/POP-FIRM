import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, HeadphonesIcon, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Msg = { from: "user" | "bot"; text: string; ts: Date };

const BOT_RESPONSES = [
  "Obrigado pela mensagem! Um agente irá responder em breve. Tempo médio de resposta: 5 minutos.",
  "Recebemos a tua mensagem. Para questões urgentes, podes também enviar email para support@quantfund.pt.",
  "A nossa equipa de suporte está disponível 24/7. Vamos responder o mais brevemente possível!",
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Olá! 👋 Bem-vindo ao suporte da QuantFund. Como podemos ajudar?",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [botIdx, setBotIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { from: "user", text, ts: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: Msg = {
        from: "bot",
        text: BOT_RESPONSES[botIdx % BOT_RESPONSES.length],
        ts: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setBotIdx((i) => i + 1);
      if (!open) setUnread((n) => n + 1);
    }, 900);
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className={`w-[340px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            minimized ? "h-14" : "h-[480px]"
          }`}
        >
          {/* Header */}
          <div className="h-14 bg-primary flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <HeadphonesIcon className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">Suporte 24/7</div>
                <div className="text-[10px] text-white/70 leading-tight">Online agora</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized((m) => !m)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                title={minimized ? "Expandir" : "Minimizar"}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 ${m.from === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        m.from === "user"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 px-1">{fmt(m.ts)}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Email hint */}
              <div className="px-4 py-2 bg-card border-t border-border text-[11px] text-muted-foreground text-center">
                Ou envie email para{" "}
                <a href="mailto:support@quantfund.pt" className="text-primary hover:underline">
                  support@quantfund.pt
                </a>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Escreve a tua mensagem..."
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
                <Button size="icon" onClick={sendMessage} className="shrink-0 h-9 w-9 rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => { setOpen((o) => !o); setUnread(0); }}
        className="relative w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Abrir suporte"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
