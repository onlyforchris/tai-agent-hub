import React, { useState } from "react";
import { AgentList } from "./agents/AgentList";
import { AgentConfigWizard } from "./agents/AgentConfigWizard";

export function AgentsView() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  if (!selectedAgentId) {
    return <AgentList onSelect={setSelectedAgentId} />;
  }
  return (
    <AgentConfigWizard agentId={selectedAgentId} onBack={() => setSelectedAgentId(null)} />
  );
}
