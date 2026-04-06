import { AgentNode, AgenticSystem, getAllAgents } from '../../data/agents';
import { useCoreStore } from '../../integration/store/coreStore';
import { AgentHost } from './AgentHost';
import { useUiStore } from '../../integration/store/uiStore';

/**
 * AgentSimulation — Autonomous Service Layer.
 * 
 * DESIGN PRINCIPLE: State-Driven Orchestration.
 * 1. Monitors the Store to trigger autonomous loops.
 * 2. Visuals are reflections of this state.
 * 3. Event-based Resilience: Re-checks for tasks when agents become idle.
 */
export class AgentSimulation {
  private agents: Map<number, AgentHost> = new Map();
  private system: AgenticSystem;
  private unsubs: (() => void)[] = [];
  private heartbeatInterval: any = null;
  private lastSparkTriggerTime: number = 0;
  private socket: WebSocket | null = null;

  constructor(system: AgenticSystem) {
    this.system = system;
    this.initializeAgents();
    this.startStateMonitoring();
  }

  private startStateMonitoring() {
    // 1. Heartbeat safety net (Periodically check for scheduled tasks and empty boards)
    this.heartbeatInterval = setInterval(() => {
      const state = useCoreStore.getState();
      if (state.phase === 'working' && state.tasks.length === 0) {
        this.triggerAutonomousStrategy();
      } else if (state.phase === 'working') {
        this.processScheduledTasks();
      }
    }, 5000);

    // 2. Core Store Monitoring
    this.unsubs.push(
      useCoreStore.subscribe((state, prevState) => {
        // A. Initial Strategy (Spark)
        if (state.phase === 'working' && prevState.phase === 'idle' && state.tasks.length === 0) {
          this.triggerAutonomousStrategy();
        }

        // B. Task Lifecycle: Process SCHEDULED tasks
        if (state.phase === 'working') {
          this.processScheduledTasks();
        }

        // C. Project Completion
        this.checkProjectCompletion();

        // D. WebSocket Bridge Implementation
        if (state.workflowId !== prevState.workflowId) {
          if (state.workflowId) {
            this.connectToBackendStream(state.workflowId);
          } else {
            this.disconnectFromBackendStream();
          }
        }
      })
    );

    // 3. UI Store Monitoring (Cleanup)
    this.unsubs.push(
      useUiStore.subscribe((state, prevState) => {
        if (!state.isChatting && prevState.isChatting) {
          const core = useCoreStore.getState();
          if (core.phase === 'working' && core.tasks.length === 0) this.triggerAutonomousStrategy();
        }
      })
    );
  }

  private connectToBackendStream(workflowId: string) {
    this.disconnectFromBackendStream();
    
    console.log(`[AgentSimulation] Connecting to stream for workflow: ${workflowId}`);
    this.socket = new WebSocket(`ws://localhost:8000/api/v1/stream/${workflowId}`);
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleExternalEvent(data);
      } catch (err) {
        console.error('[AgentSimulation] Failed to parse WS event:', err);
      }
    };

    this.socket.onerror = (err) => console.error('[AgentSimulation] WS Error:', err);
    this.socket.onclose = () => {
       console.log('[AgentSimulation] WS Stream closed.');
       useCoreStore.getState().setWorkflowId(null);
    };
  }

  private disconnectFromBackendStream() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private async handleExternalEvent(event: any) {
    if (event.type === 'agent_action') {
      const allAgents = getAllAgents(this.system);
      const agentNode = allAgents.find(a => a.name.toLowerCase().includes(event.agent.toLowerCase()) || a.id.toLowerCase().includes(event.agent.toLowerCase()));
      
      if (agentNode) {
        const agentHost = this.getAgent(agentNode.index);
        if (agentHost) {
          // Sync state and trigger visual feedback
          const isDone = event.status === 'done';
          agentHost.setState(isDone ? 'idle' : 'working');
          
          // Add to internal history for Technical Log
          agentHost.appendHistory({
             role: 'assistant',
             content: event.message,
             metadata: { internal: true, technical: true, action: event.action }
          });
        }
      }
    } else if (event.type === 'workflow_complete') {
       useCoreStore.getState().addLogEntry({
          agentIndex: 1, // Alex
          action: 'Orchestration Complete',
       });
       this.disconnectFromBackendStream();
    }
  }

  /** Central method to check for and start available tasks. */
  public processScheduledTasks() {
    const state = useCoreStore.getState();
    if (state.phase !== 'working') return;

    state.tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').forEach(task => {
      const agent = this.getAgent(task.assignedAgentId);
      const uiStatus = useUiStore.getState().agentStatuses[task.assignedAgentId];
      
      // Resilience check: only start if agent is truly idle and not currently thinking.
      // We check both internal state and UI status as safety.
      if (agent && (agent.state === 'idle' || uiStatus === 'idle') && !agent.isThinking) {
        this.startTaskExecution(task.assignedAgentId, task.id);
      }
    });
  }

  private async triggerAutonomousStrategy() {
    const lead = this.getAgent(1);
    const ui = useUiStore.getState();
    const core = useCoreStore.getState();

    // GUARD: Prevent duplication
    if (!lead || lead.isThinking || core.tasks.length > 0) return;
    if (ui.isChatting && ui.selectedNpcIndex === lead.data.index) return;
    
    if (Date.now() - this.lastSparkTriggerTime < 1000) return;
    this.lastSparkTriggerTime = Date.now();

    await lead.spark();
  }

  private async startTaskExecution(agentIndex: number, taskId: string) {
    const agent = this.getAgent(agentIndex);
    if (!agent) return;

    agent.setTask(taskId); 
    useCoreStore.getState().updateTaskStatus(taskId, 'in_progress');
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    try {
      if (!agent.isThinking) {
        await agent.executeTask(taskId);
      }
    } catch (err) {
      console.error(`[AgentSimulation] Agent ${agentIndex} failed:`, err);
    } finally {
      // Resilience check: only clear task if not waiting for review or meeting
      if (agent.state !== 'on_hold' && agent.state !== 'talking') {
        agent.setTask(null);
        agent.setState('idle');
      }
      
      // KEY: When finished, check if there are other scheduled tasks waiting
      this.processScheduledTasks();
      
      // AND check if the project is now ready for delivery 
      // (Resilience for 1-agent teams where lead is thinking when the last task finishes)
      this.checkProjectCompletion();
    }
  }

  private async checkProjectCompletion() {
    const state = useCoreStore.getState();
    const allTasksFinished = state.tasks.length > 0 && state.tasks.every(t => t.status === 'done');
    
    if (state.phase === 'working' && allTasksFinished && !state.isGeneratingAsset) {
      const lead = this.getAgent(this.system.leadAgent.index);
      if (lead && !lead.isThinking) {
        await lead.concludeProject();
      }
    }
  }

  private initializeAgents() {
    const allAgents = getAllAgents(this.system);
    for (const agentData of allAgents) {
      this.agents.set(agentData.index, new AgentHost(agentData, this));
    }
  }

  public getAgent(index: number): AgentHost | undefined {
    return this.agents.get(index);
  }

  public getAllAgents(): AgentHost[] {
    return Array.from(this.agents.values());
  }

  public async handleUserMessage(agentIndex: number, text: string) {
    // If user is selected (index 0), route the message to the Lead Agent
    const targetIndex = agentIndex === this.system.user.index ? this.system.leadAgent.index : agentIndex;
    
    const agent = this.getAgent(targetIndex);
    if (!agent || !agent.canChat()) return null;
    const response = await agent.think(text, { isChat: true });
    return response.text;
  }

  public dispose() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.unsubs.forEach(unsub => unsub());
    this.unsubs = [];
    this.agents.forEach(a => a.dispose());
  }
}
