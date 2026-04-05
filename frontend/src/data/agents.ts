import { USER_COLOR } from '../theme/brand';
import { DEFAULT_MODELS } from '../core/llm/constants';

export const USER_ID = 'user';
export const USER_NAME = 'User';
export const MAX_AGENTS = 10;
export { USER_COLOR };
export const DEFAULT_AGENTIC_SET_ID = 'officemind';
export interface AgentNode {
  id: string;
  index: number;
  name: string;
  description: string;
  color: string;
  model: string;
  skills?: string[];
  humanInTheLoop?: boolean;
  position?: { x: number; y: number };
  subagents?: AgentNode[];
}

export type OutputType = 'text' | 'image' | 'music' | 'video';
export interface AgenticSystem {
  id: string;
  teamName: string;
  teamType: string;
  teamDescription: string;
  color: string;
  outputType: OutputType;
  outputModel: string;
  outputAutoApprove?: boolean;
  user: {
    index: number;
    model: string;
    position?: { x: number; y: number };
  };
  leadAgent: AgentNode;
}

export const AGENTIC_SETS: AgenticSystem[] = [
  {
    id: 'officemind',
    teamName: 'OfficeMind AI',
    teamType: 'Productivity OS',
    teamDescription: 'A multi-agent system for end-to-end task orchestration and productivity automation.',
    color: '#F9BC05',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'alex-orchestrator',
      index: 1,
      name: 'Alex',
      description: 'The Orchestrator. Coordinates all sub-agents and decomposes complex tasks.',
      color: '#F9BC05',
      model: DEFAULT_MODELS.text,
      skills: ['Task Decomposition', 'Agent Delegation', 'Workflow Execution', 'State Persistence'],
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'sam-scheduler',
          index: 2,
          name: 'Sam',
          description: 'The Scheduler. Manages calendars, detects conflicts, and finds free slots.',
          color: '#34A853',
          model: DEFAULT_MODELS.text,
          skills: ['Calendar Management', 'Free Slot Detection', 'Conflict Resolution', 'Weather-Aware Scheduling'],
          position: { x: -400, y: 280 }
        },
        {
          id: 'mia-tasks',
          index: 3,
          name: 'Mia',
          description: 'The Task Manager. Manages Notion tasks, priorities, and deadlines.',
          color: '#6366F1',
          model: DEFAULT_MODELS.text,
          skills: ['Notion Task Creation', 'Bulk Generation', 'Status Tracking', 'AI Prioritization'],
          position: { x: -200, y: 280 }
        },
        {
          id: 'dev-email',
          index: 4,
          name: 'Dev',
          description: 'The Email Agent. Summarizes inboxes and drafts professional communications.',
          color: '#EA4335',
          model: DEFAULT_MODELS.text,
          skills: ['Email Drafting', 'Inbox Summarization', 'Invite Generation'],
          position: { x: 0, y: 280 }
        },
        {
          id: 'kai-comms',
          index: 5,
          name: 'Kai',
          description: 'The Comms Lead. Manages Slack notifications and real-time team updates.',
          color: '#9C27B0',
          model: DEFAULT_MODELS.text,
          skills: ['Slack Notifications', 'Workflow Status DMs'],
          position: { x: 200, y: 280 }
        },
        {
          id: 'riya-research',
          index: 6,
          name: 'Riya',
          description: 'The Researcher. Performs web searches and provides structured intelligence.',
          color: '#00BCD4',
          model: DEFAULT_MODELS.text,
          skills: ['Web Research', 'Intelli-Briefings'],
          position: { x: 400, y: 280 }
        },
        {
          id: 'neo-memory',
          index: 7,
          name: 'Neo',
          description: 'The Memory Keeper. Handles semantic storage and RAG-based recall.',
          color: '#607D8B',
          model: DEFAULT_MODELS.text,
          skills: ['Semantic Storage', 'Vector Recall (RAG)'],
          position: { x: -300, y: 430 }
        },
        {
          id: 'aria-analytics',
          index: 8,
          name: 'Aria',
          description: 'The Data Analyst. Tracks productivity scores and burnout risks.',
          color: '#FF5722',
          model: DEFAULT_MODELS.text,
          skills: ['Productivity Scoring', 'Burnout Detection', 'Weekly Reporting'],
          position: { x: -100, y: 430 }
        },
        {
          id: 'finn-files',
          index: 9,
          name: 'Finn',
          description: 'The File Specialist. Organizes Google Drive docs and workflow outputs.',
          color: '#795548',
          model: DEFAULT_MODELS.text,
          skills: ['Drive Management', 'File Search', 'Auto-Archive'],
          position: { x: 100, y: 430 }
        },
        {
          id: 'luna-context',
          index: 10,
          name: 'Luna',
          description: 'The Context Agent. Provides weather, location, and travel data.',
          color: '#E91E63',
          model: DEFAULT_MODELS.text,
          skills: ['Weather Analysis', 'Maps/Commute Logic'],
          position: { x: 300, y: 430 }
        }
      ]
    }
  },
  {
    id: 'photo-studio',
    teamName: 'Nano Banana Lab',
    teamType: 'Visual',
    teamDescription: 'Pro image generation using the [Subject] + [Action] + [Context] + [Comp] + [Style] formula.',
    color: '#FBBF24',
    outputType: 'image',
    outputModel: DEFAULT_MODELS.image,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'art-director',
      index: 1,
      name: 'Art Director',
      description: 'Synthesizes descriptions into valid Nano Banana prompts.',
      color: '#FBBF24',
      humanInTheLoop: true,
      model: DEFAULT_MODELS.text,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'scene-designer',
          index: 2,
          name: 'Scene Designer',
          description: 'Focuses on Subject and Action within the scene.',
          color: '#F59E0B',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: -150, y: 280 }
        },
        {
          id: 'lighting-stylist',
          index: 3,
          name: 'Lighting Stylist',
          description: 'Focuses on Composition, Lighting, and Style/Materiality.',
          color: '#E0E672',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: 150, y: 280 }
        }
      ]
    }
  },
  {
    id: 'music-studio',
    teamName: 'Lyria Factory',
    teamType: 'Music Production',
    teamDescription: 'High-fidelity audio production following Lyria guidelines.',
    color: '#43E47C',
    outputType: 'music',
    outputModel: DEFAULT_MODELS.music,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'master-producer',
      index: 1,
      name: 'Master Producer',
      description: 'Orchestrates the 4 pillars of sound into a cohesive track.',
      color: '#43E47C',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'genre-expert',
          index: 2,
          name: 'Genre Expert',
          description: 'Defines style, mood, and global aesthetic (e.g., Synthwave, Lofi).',
          color: '#74D295',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -450, y: 280 }
        },
        {
          id: 'tempo-architect',
          index: 3,
          name: 'Tempo Architect',
          description: 'Specifies BPM, rhythmical complexity, and time signatures.',
          color: '#92D540',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -150, y: 280 }
        },
        {
          id: 'instrumentalist',
          index: 4,
          name: 'Instrumentalist',
          description: 'Selects timbres, arrangement, and orchestration layers.',
          color: '#40D5AD',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 150, y: 280 }
        },
        {
          id: 'dynamics-engineer',
          index: 5,
          name: 'Dynamics Engineer',
          description: 'Controls volume, texture, contrast, and emotional progression.',
          color: '#50BB55',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 450, y: 280 }
        }
      ]
    }
  },
  {
    id: 'film-studio',
    teamName: 'Veo Studio',
    teamType: 'Cinematic',
    teamDescription: 'Full cinematic production: Visuals + Soundstage (Veo 3.1 style).',
    color: '#E64347',
    outputType: 'video',
    outputModel: DEFAULT_MODELS.video,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'film-director',
      index: 1,
      name: 'Film Director',
      description: 'Orchestrates visuals and soundstage with global cinematic vision.',
      color: '#E64347',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'visual-lead',
          index: 2,
          name: 'Visual Lead',
          description: 'Manages cinematography and VFX direction.',
          color: '#F17DC5',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -200, y: 280 },
          subagents: [
            {
              id: 'cinematographer',
              index: 4,
              name: 'Cinematographer',
              description: 'Defines camera work, shot composition, and subject action.',
              color: '#E643C5',
              model: DEFAULT_MODELS.text,
              position: { x: -200, y: 430 }
            }
          ]
        },
        {
          id: 'audio-lead',
          index: 3,
          name: 'Audio Lead',
          description: 'Manages the soundstage: Dialogue, SFX, and Ambience.',
          color: '#7CE630',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 200, y: 280 },
          subagents: [
            {
              id: 'sound-designer',
              index: 5,
              name: 'Sound Designer',
              description: 'Specifies SFX (SFX:), Ambient Noise (Ambient noise:), and Dialogue (" ").',
              color: '#50BB55',
              model: DEFAULT_MODELS.text,
              position: { x: 200, y: 430 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'strategy-coach',
    teamName: 'Strategy Coach',
    teamType: 'Strategic',
    teamDescription: 'A high-level strategic advisor for project direction and roadmap.',
    color: '#64748B',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'visionary-advisor',
      index: 1,
      name: 'Visionary Advisor',
      description: 'Handles project direction, roadmap, and ecosystem growth strategy.',
      color: '#64748B',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 }
    }
  },
  {
    id: 'pr-agency',
    teamName: 'PR Agency',
    teamType: 'Public Relations',
    teamDescription: 'A sequential pipeline for media outreach: from strategy to press drafting.',
    color: '#E34B99',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'pr-director',
      index: 1,
      name: 'PR Director',
      description: 'Oversees media relations, strategic communications, and brand reputation.',
      color: '#E34B99',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'media-strategist',
          index: 2,
          name: 'Media Strategist',
          description: 'Identifies key media outlets and manages journalist outreach.',
          color: '#E6D979',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 260 },
          subagents: [
            {
              id: 'press-writer',
              index: 3,
              name: 'Press Writer',
              description: 'Drafts press releases and media kits based on strategic goals.',
              color: '#5E888E',
              model: DEFAULT_MODELS.text,
              position: { x: 0, y: 390 }
            }
          ]
        }
      ]
    }
  }
];

export function getAgentSet(id: string, customSystems: AgenticSystem[] = []): AgenticSystem {
  return (
    customSystems.find((s) => s.id === id) ||
    AGENTIC_SETS.find((s) => s.id === id) ||
    AGENTIC_SETS[0]
  );
}

export function getAllAgents(system: AgenticSystem): AgentNode[] {
  const agents: AgentNode[] = [];
  const traverse = (node: AgentNode) => {
    agents.push(node);
    if (node.subagents) {
      node.subagents.forEach(traverse);
    }
  };
  traverse(system.leadAgent);
  return agents;
}

export function getAllCharacters(system: AgenticSystem): AgentNode[] {
  const userNode: AgentNode = {
    id: USER_ID,
    index: system.user.index,
    name: USER_NAME,
    color: USER_COLOR,
    model: system.user.model,
    description: 'Human user issuing commands.',
  };
  return [userNode, ...getAllAgents(system)];
}
