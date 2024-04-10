// 9.7 Agents

export class Agent {
  '[[LittleEndian]]': boolean
  '[[CanBlock]]': boolean
  '[[Signifier]]': any
  '[[IsLockFree1]]': boolean
  '[[IsLockFree2]]': boolean
  '[[IsLockFree3]]': boolean
  '[[CandidateExecution]]': any
  '[[KeptAlive]]': any
}
// 9.7.1 AgentSignifier ( )

export function AgentSignifier() {
  // 1. Let AR be the Agent Record of the surrounding agent.
  let AR = new Agent()
  // 2. Return AR.[[Signifier]].
  return AR['[[Signifier]]']
}
