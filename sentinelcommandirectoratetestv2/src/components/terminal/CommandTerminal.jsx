import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ChevronRight, X, Maximize2, Minimize2 } from 'lucide-react';
import useStore from '../../stores/mainStore';
import { format } from 'date-fns';

export default function CommandTerminal() {
  const {
    terminalHistory,
    terminalCommandHistory,
    terminalHistoryIndex,
    executeCommand,
    navigateTerminalHistory,
    clearTerminal,
  } = useStore();

  const [input, setInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  useEffect(() => {
    if (terminalHistoryIndex >= 0 && terminalCommandHistory[terminalHistoryIndex]) {
      setInput(terminalCommandHistory[terminalHistoryIndex]);
    } else if (terminalHistoryIndex === -1) {
      setInput('');
    }
  }, [terminalHistoryIndex, terminalCommandHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateTerminalHistory(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateTerminalHistory(-1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const commands = ['help', 'status', 'threats', 'operations', 'assets', 'intercepts', 'cyber', 'query', 'isolate', 'decrypt', 'task', 'alert', 'scan', 'extract', 'clear', 'exit'];
      const matches = commands.filter(c => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      clearTerminal();
    }
  };

  const getOutputClass = (type) => {
    switch (type) {
      case 'success': return 'terminal-success';
      case 'error': return 'terminal-error';
      case 'warning': return 'terminal-warning';
      case 'info': return 'terminal-info';
      case 'input': return 'terminal-prompt';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-cmd-darker ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cmd-panel border-b border-cmd-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-status-active/20">
            <Terminal size={20} className="text-status-active" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Strategic Command Terminal</h1>
            <p className="text-xs text-gray-500">SENTINEL-CMD v3.7.2 | TOP SECRET//SCI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-cmd-dark rounded transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 size={16} className="text-gray-400" />
            ) : (
              <Maximize2 size={16} className="text-gray-400" />
            )}
          </button>
          <button
            onClick={clearTerminal}
            className="p-1.5 hover:bg-cmd-dark rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Welcome Message */}
        {terminalHistory.length === 0 && (
          <div className="mb-4">
            <pre className="text-cmd-accent">
{`
  ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
  ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
  ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
  ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
  ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
  ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝

  COMMAND DIRECTORATE - STRATEGIC INTELLIGENCE SYSTEM
  ====================================================
  Classification: TOP SECRET//SCI
  Session Started: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC
  Clearance Level: DIRECTOR

  Type 'help' for available commands.
`}
            </pre>
          </div>
        )}

        {/* Command History */}
        {terminalHistory.map((entry, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            {entry.type === 'input' ? (
              <div className="flex items-start gap-2">
                <span className="text-cmd-accent">sentinel@command:~$</span>
                <span className="text-white">{entry.content}</span>
              </div>
            ) : (
              <pre className={`whitespace-pre-wrap ${getOutputClass(entry.type)}`}>
                {entry.content}
              </pre>
            )}
          </motion.div>
        ))}

        {/* Current Input */}
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <span className="text-cmd-accent">sentinel@command:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white caret-cmd-accent"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-cmd-panel border-t border-cmd-border">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-4">
            <span>TAB: Autocomplete</span>
            <span>↑↓: History</span>
            <span>Ctrl+L: Clear</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Commands: {terminalCommandHistory.length}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-active animate-pulse" />
              SECURE CONNECTION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
