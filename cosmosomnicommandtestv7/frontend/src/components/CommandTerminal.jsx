import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import websocketService from '../services/websocket';
import { commandApi } from '../services/api';
import audioService from '../services/audio';

export default function CommandTerminal() {
  const { commandHistory, addCommandResult, connected } = useStore();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const commandHistoryRef = useRef([]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commandHistory]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Track command history for up/down navigation
  useEffect(() => {
    commandHistoryRef.current = commandHistory
      .filter(h => h.status === 'success' || h.status === 'error')
      .map(h => h.input);
  }, [commandHistory]);

  const executeCommand = useCallback(async (command) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    audioService.playCommandExecute();

    try {
      if (connected && websocketService.isConnected()) {
        // Use WebSocket if connected
        websocketService.sendCommand(command);
      } else {
        // Fall back to REST API
        const result = await commandApi.execute(command);
        addCommandResult(result);

        if (result.status === 'success') {
          audioService.playCommandSuccess();
        } else {
          audioService.playCommandError();
        }
      }
    } catch (error) {
      addCommandResult({
        id: Date.now(),
        timestamp: Date.now(),
        input: command,
        output: {
          type: 'error',
          lines: [`ERROR: ${error.message}`],
          timestamp: Date.now()
        },
        status: 'error'
      });
      audioService.playCommandError();
    } finally {
      setIsProcessing(false);
      setHistoryIndex(-1);
    }
  }, [connected, addCommandResult]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      executeCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    audioService.playKeypress();

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const history = commandHistoryRef.current;
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistoryRef.current[commandHistoryRef.current.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const commands = ['help', 'status', 'scan', 'deploy', 'reroute', 'inspect', 'diagnose',
        'hail', 'navigate', 'alert', 'fleet', 'shields', 'weapons', 'sensors', 'comms',
        'crew', 'report', 'log', 'clear'];
      const match = commands.find(c => c.startsWith(input.toLowerCase()));
      if (match) {
        setInput(match);
      }
    }
  };

  const renderOutput = (output) => {
    if (!output) return null;

    const typeColors = {
      info: 'text-holo-cyan',
      success: 'text-holo-green',
      warning: 'text-holo-orange',
      error: 'text-holo-red',
      clear: 'text-holo-cyan'
    };

    return (
      <div className={typeColors[output.type] || 'text-holo-cyan'}>
        {output.lines?.map((line, i) => (
          <div key={i} className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-space-darker">
      {/* Terminal header */}
      <div className="p-4 border-b border-panel-border bg-panel-bg/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-holo-red/60" />
              <div className="w-3 h-3 rounded-full bg-holo-orange/60" />
              <div className="w-3 h-3 rounded-full bg-holo-green/60" />
            </div>
            <h2 className="font-display text-lg font-bold text-holo-blue uppercase tracking-wider">
              Command Terminal
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-holo-green' : 'bg-holo-red'}`} />
            <span className="text-holo-cyan/60 font-mono">
              {connected ? 'LINKED' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Welcome message */}
        <div className="text-holo-blue mb-4">
          <pre className="text-xs leading-tight">
{`
  ╔═══════════════════════════════════════════════════════════════════╗
  ║                    COSMOS OMNI-COMMAND TERMINAL                   ║
  ║                         Version 4.2.1                             ║
  ╚═══════════════════════════════════════════════════════════════════╝
`}
          </pre>
          <div className="text-holo-cyan/60 mt-2">
            Type "help" for available commands. Use Tab for completion, Up/Down for history.
          </div>
        </div>

        {/* Command history */}
        <AnimatePresence>
          {commandHistory.map((entry, index) => (
            <motion.div
              key={entry.id || index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              {/* Input line */}
              <div className="flex items-center gap-2 text-holo-green">
                <span className="text-holo-blue">$</span>
                <span>{entry.input}</span>
              </div>

              {/* Output */}
              {entry.output && (
                <div className="mt-2 ml-4 pl-2 border-l border-panel-border">
                  {renderOutput(entry.output)}
                </div>
              )}

              {/* Processing indicator */}
              {entry.status === 'processing' && (
                <div className="mt-2 ml-4 flex items-center gap-2 text-holo-cyan/60">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 bg-holo-cyan rounded-full"
                  />
                  <span>Processing...</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current processing */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-holo-cyan/60">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-2 h-2 bg-holo-cyan rounded-full"
            />
            <span>Executing command...</span>
          </div>
        )}
      </div>

      {/* Input line */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-panel-border bg-panel-bg/30">
        <div className="flex items-center gap-2">
          <span className="text-holo-blue font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none outline-none text-holo-green font-mono text-sm placeholder-holo-cyan/30"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-3 py-1 bg-holo-blue/20 text-holo-blue text-xs uppercase rounded disabled:opacity-30 hover:bg-holo-blue/30 transition-colors"
          >
            Execute
          </button>
        </div>

        {/* Quick commands */}
        <div className="mt-2 flex flex-wrap gap-2">
          {['status', 'fleet status', 'scan sector', 'alert status', 'shields status'].map(cmd => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                setInput(cmd);
                inputRef.current?.focus();
              }}
              className="px-2 py-0.5 text-xs text-holo-cyan/60 hover:text-holo-cyan bg-space-dark rounded transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </form>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-holo-blue/10"
          animate={{ top: ['0%', '100%'] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
