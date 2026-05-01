export interface ExecutionResult {
  stdout: string;
  stderr: string;
  success: boolean;
  executionTimeMs: number;
}

export interface SandboxConfig {
  memoryMb?: number;
  timeoutMs?: number;
}

/**
 * MOCK INTERFACE FOR FIRECRACKER / DAYTONA
 * This allows secure execution of the generated Node.js code.
 */
export async function executeInSandbox(
  code: string,
  config?: SandboxConfig
): Promise<ExecutionResult> {
  console.log("Mock executing code in Firecracker/Daytona sandbox...");
  
  // Simulated delay for cold start + execution
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    stdout: "Server running on port 5000\nConnected to mock DB.",
    stderr: "",
    success: true,
    executionTimeMs: 145,
  };
}
