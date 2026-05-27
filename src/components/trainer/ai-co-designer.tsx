"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningBlock } from "@/types";
import { motion } from "framer-motion";
import { askCoDesignerAction } from "@/app/actions/ai";

interface AICoDesignerProps {
  courseTitle: string;
  moduleTitle: string;
  moduleDescription: string;
  blocks: LearningBlock[];
  onAddBlock?: (proposedBlock: any) => void;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposedBlock?: any;
};

export function AICoDesigner({ courseTitle, moduleTitle, moduleDescription, blocks, onAddBlock }: AICoDesignerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const existingBlocksInfo = blocks.map((b, i) => `${i + 1}. [${b.type}] ${b.title}`).join('\\n');
      
      const response = await askCoDesignerAction({
        trainerMessage: userMessage.content,
        courseTitle,
        moduleTitle,
        moduleDescription,
        existingBlocksInfo
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        proposedBlock: response.proposedBlock
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I ran into an error while trying to process that."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-80 border-l border-slate-200 bg-white flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-200 bg-emerald-green/5 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-green" />
        <h3 className="font-heading font-semibold text-slate-800">AI Co-Designer</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center p-6 mt-4">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              I'm your AI Co-Designer! Ask me for brainstorming ideas, block rewriting, or structure suggestions based on your module's context. I can even create blocks for you!
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id} 
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className={`text-xs font-semibold mb-1 ${m.role === 'user' ? 'text-royal-blue' : 'text-emerald-green'}`}>
                {m.role === 'user' ? 'You' : 'Co-Designer'}
              </span>
              <div 
                className={`p-3 rounded-xl max-w-[90%] text-sm whitespace-pre-wrap shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-royal-blue text-white rounded-tr-sm' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:text-slate-800'
                }`}
              >
                {m.content}
                
                {m.proposedBlock && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm not-prose">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded">
                        {m.proposedBlock.type}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 text-xs mb-1">{m.proposedBlock.title}</p>
                    <p className="text-slate-500 text-[10px] line-clamp-2 mb-3">{m.proposedBlock.content}</p>
                    {onAddBlock && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-xs h-7 border-emerald-green/30 text-emerald-green hover:bg-emerald-green/5"
                        onClick={() => onAddBlock(m.proposedBlock)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add to Module
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm p-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask to create a block..."
            className="w-full p-3 pr-12 border border-slate-300 rounded-xl outline-none focus:border-emerald-green focus:ring-1 focus:ring-emerald-green resize-none text-sm bg-slate-50 transition-all"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 h-8 w-8 rounded-lg bg-emerald-green hover:bg-emerald-green/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
