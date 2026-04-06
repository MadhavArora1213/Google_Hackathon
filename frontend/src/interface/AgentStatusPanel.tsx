import { Sparkles, Send } from 'lucide-react';
import React from 'react';
import { getAgentSet, getAllAgents, getAllCharacters } from '../data/agents';
import { useCoreStore } from '../integration/store/coreStore';
import { useTeamStore, useActiveTeam } from '../integration/store/teamStore';
import { useUiStore } from '../integration/store/uiStore';
import { useSceneManager } from '../simulation/SceneContext';
import { Avatar } from './components/Avatar';

import { formatTokens } from './ProjectView';

interface AgentStatusPanelProps {
  agentIndex: number;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ agentIndex }) => {
  const { tasks } = useCoreStore();
  const system = useActiveTeam();
  const scene = useSceneManager();
  const agents = getAllAgents(system);

  const agent = getAllCharacters(system).find(a => a.index === agentIndex);
  if (!agent) return null;

  const activeTask = tasks.find(
    (t) => t.assignedAgentId === agentIndex && t.status === 'in_progress'
  ) ?? null;

  const usage = useCoreStore.getState().agentTokenUsage[agentIndex] || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  const handleQuickPrompt = async (val: string) => {
    if (!val.trim()) return;
    useUiStore.getState().setChatting(true);
    await scene?.sendMessage(val);
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Agent Info */}
      <div className="mb-4 space-y-6">
        {/* Role/Description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {agent.index === 0 ? 'Identity' : 'Description'}
            </p>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium capitalize-first">
            {agent.index === 0 ? 'The Human user who orchestrates the entire OfficeMind AI ecosystem through natural language commands.' : agent.description}
          </p>
        </div>

        {/* Skills (New!) */}
        {agent.skills && agent.skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Capabilities</p>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill, i) => (
                <div
                  key={i}
                  className="text-[9px] font-black px-2 py-1 rounded-lg border shadow-xs leading-none flex items-center transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${agent.color}08`,
                    color: agent.color,
                    borderColor: `${agent.color}20`
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile</p>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100/60 font-mono">
            <p className="text-[11px] font-bold text-darkDelegation uppercase tracking-tighter">
              {agent.index === 0 ? 'Admin / Manager' : agent.model}
            </p>
          </div>
        </div>

        {/* Token Usage - Only for actual agents */}
        {agent.index !== 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Tokens</p>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono">
              <span className="text-zinc-700">{formatTokens(usage.promptTokens)} <span className="text-zinc-400 font-medium">input</span></span>
              <span className="text-zinc-300">+</span>
              <span className="text-zinc-700">{formatTokens(usage.completionTokens)} <span className="text-zinc-400 font-medium">output</span></span>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-zinc-100 w-full mb-6" />

      {/* Task Status / Quick Prompt */}
      {agent.index === 0 ? (
        <div className="flex flex-col gap-3">
           <div className="flex items-center gap-2 mb-1 px-1">
             <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100/50 text-emerald-600">
               <Sparkles size={14} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Master Prompt</p>
           </div>
           
           <div className="relative group">
              <textarea 
                placeholder="What should the team do next?"
                rows={4}
                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all resize-none placeholder:text-zinc-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const val = (e.target as HTMLTextAreaElement).value;
                    handleQuickPrompt(val);
                    (e.target as HTMLTextAreaElement).value = '';
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity flex items-center gap-1.5">
                 <span className="text-[9px] font-black text-zinc-300 uppercase tracking-tighter">Enter to send</span>
              </div>
           </div>
           
           <button 
             onClick={(e) => {
               const area = (e.currentTarget.previousSibling?.firstChild as HTMLTextAreaElement);
               handleQuickPrompt(area.value);
               area.value = '';
             }}
             className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
           >
              <Send size={14} strokeWidth={3} />
              Dispatch Command
           </button>
        </div>
      ) : activeTask ? (
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: agent.color }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: agent.color }}></span>
            </span>
            Doing Now
          </p>
          <p className="text-sm text-darkDelegation leading-snug font-bold">
            "{activeTask.title}"
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400/50 mb-2">
            Status
          </p>
          <p className="text-sm text-zinc-300 leading-snug italic font-medium">
            Waiting for next task...
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentStatusPanel;
