// ============================================
// Sandboxed Code Runner — In-Browser JavaScript Sandbox
// Executes user JS/TS code with console capture, timeout (5s), and test cases
// ============================================

import type { TestCase, TestResult } from '@/types';

export interface ExecutionResult {
  logs: string[];
  output: string;
  error: string | null;
  durationMs: number;
  testResults: TestResult[];
  allPassed: boolean;
}

export async function runSandboxCode(
  userCode: string,
  testCases: TestCase[] = [],
  timeoutMs = 5000
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const logs: string[] = [];
  let error: string | null = null;
  let output = '';
  const testResults: TestResult[] = [];

  // Create isolated worker blob script
  const workerScript = `
    self.onmessage = function(e) {
      const code = e.data.code;
      const testCases = e.data.testCases || [];
      const logs = [];

      const customConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        info: (...args) => logs.push('[INFO] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      };

      try {
        // Evaluate code with overridden console
        const userFn = new Function('console', code);
        const returned = userFn(customConsole);

        // Run test cases if present
        const testResults = [];
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          try {
            const runnerFn = new Function('console', code + '\\n return solution(' + tc.input + ');');
            const actualVal = runnerFn(customConsole);
            const actualStr = JSON.stringify(actualVal);
            const expectedClean = tc.expected.trim();
            const passed = actualStr === expectedClean || String(actualVal) === expectedClean;
            testResults.push({
              testIndex: i,
              input: tc.input,
              expected: tc.expected,
              actual: actualStr,
              passed,
            });
          } catch (err) {
            testResults.push({
              testIndex: i,
              input: tc.input,
              expected: tc.expected,
              actual: 'N/A',
              passed: false,
              error: String(err && err.message ? err.message : err),
            });
          }
        }

        self.postMessage({
          success: true,
          logs,
          returned: returned !== undefined ? (typeof returned === 'object' ? JSON.stringify(returned, null, 2) : String(returned)) : '',
          testResults
        });
      } catch (err) {
        self.postMessage({
          success: false,
          logs,
          error: String(err && err.message ? err.message : err)
        });
      }
    };
  `;

  return new Promise((resolve) => {
    let blob: Blob;
    let workerUrl: string;
    let worker: Worker;

    try {
      blob = new Blob([workerScript], { type: 'application/javascript' });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
    } catch {
      // Fallback for environments where Web Workers are restricted
      return resolve(runFallbackInProcess(userCode, testCases, startTime));
    }

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        logs,
        output: '',
        error: `Execution timed out after ${timeoutMs / 1000}s (infinite loop or long execution).`,
        durationMs: Math.round(performance.now() - startTime),
        testResults: [],
        allPassed: false,
      });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);

      const endTime = performance.now();
      const data = e.data;

      if (!data.success) {
        return resolve({
          logs: data.logs || [],
          output: '',
          error: data.error || 'Execution Error',
          durationMs: Math.round(endTime - startTime),
          testResults: [],
          allPassed: false,
        });
      }

      const allPassed = data.testResults.length > 0 ? data.testResults.every((t: TestResult) => t.passed) : true;

      resolve({
        logs: data.logs || [],
        output: data.returned || '',
        error: null,
        durationMs: Math.round(endTime - startTime),
        testResults: data.testResults || [],
        allPassed,
      });
    };

    worker.postMessage({ code: userCode, testCases });
  });
}

function runFallbackInProcess(userCode: string, testCases: TestCase[], startTime: number): ExecutionResult {
  const logs: string[] = [];
  const customConsole = {
    log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    error: (...args: any[]) => logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    warn: (...args: any[]) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    info: (...args: any[]) => logs.push('[INFO] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
  };

  try {
    const userFn = new Function('console', userCode);
    const returned = userFn(customConsole);

    const testResults: TestResult[] = [];
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      try {
        const runnerFn = new Function('console', userCode + '\n return solution(' + tc.input + ');');
        const actualVal = runnerFn(customConsole);
        const actualStr = JSON.stringify(actualVal);
        const expectedClean = tc.expected.trim();
        const passed = actualStr === expectedClean || String(actualVal) === expectedClean;
        testResults.push({
          testIndex: i,
          input: tc.input,
          expected: tc.expected,
          actual: actualStr,
          passed,
        });
      } catch (err: any) {
        testResults.push({
          testIndex: i,
          input: tc.input,
          expected: tc.expected,
          actual: 'N/A',
          passed: false,
          error: err?.message || String(err),
        });
      }
    }

    const allPassed = testResults.length > 0 ? testResults.every(t => t.passed) : true;

    return {
      logs,
      output: returned !== undefined ? (typeof returned === 'object' ? JSON.stringify(returned, null, 2) : String(returned)) : '',
      error: null,
      durationMs: Math.round(performance.now() - startTime),
      testResults,
      allPassed,
    };
  } catch (err: any) {
    return {
      logs,
      output: '',
      error: err?.message || String(err),
      durationMs: Math.round(performance.now() - startTime),
      testResults: [],
      allPassed: false,
    };
  }
}
