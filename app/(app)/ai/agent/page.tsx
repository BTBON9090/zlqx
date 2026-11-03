import type { Metadata } from "next";
import { AgentWorkspace } from "@/components/agent/workspace";

export const metadata: Metadata = {
  title: "Agent 对话 · AI 中心",
  description: "与招聘 Agent 进行高自由度的对话，按需调用技能、管理任务序列并同步可视化结果。",
};

export default function AgentPage() {
  return <AgentWorkspace />;
}
