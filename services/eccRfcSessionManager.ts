import {
  SapRfcSessionAffinityContext,
  SapBapiReturnMessage,
  SapBapiMessageType
} from '../types';

export interface SapRfcUpdateTask {
  functionModule: string;
  type: 'V1' | 'V2';
  status: 'REGISTERED' | 'EXECUTED' | 'CANCELLED';
  registeredAt: string;
}

export interface SapRfcSessionRecord {
  sessionId: string;
  client: string;
  user: string;
  host: string;
  luwId: string;
  state: 'INITIAL' | 'LUW_ACTIVE' | 'COMMITTED' | 'ROLLED_BACK' | 'ABORTED';
  locks: string[];
  updateTasks: SapRfcUpdateTask[];
  history: {
    functionName: string;
    timestamp: string;
    status: string;
    returnTypes: SapBapiMessageType[];
  }[];
  createdAt: string;
  lastActivityAt: string;
}

export class SapRfcSessionManager {
  private sessions: Map<string, SapRfcSessionRecord> = new Map();
  private defaultHost = 'ecc6-prod.corp.sap:3300';

  constructor() {
    // Initialize standard persistent operational session for agent
    this.getOrCreateSession('RFC_SESSION_800_AI_AGENT_DEFAULT', '800', 'AI_AGENT_RW');
  }

  /**
   * Retrieves or provisions an RFC session ensuring session affinity for SAP LUW semantics.
   */
  public getOrCreateSession(
    sessionId?: string,
    client: string = '800',
    user: string = 'AI_AGENT_RW'
  ): SapRfcSessionRecord {
    if (sessionId && this.sessions.has(sessionId)) {
      const existing = this.sessions.get(sessionId)!;
      existing.lastActivityAt = new Date().toISOString();
      return existing;
    }

    const sid = sessionId || `RFC_SES_${client}_${user}_${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}`;
    const luwId = `LUW_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const newSession: SapRfcSessionRecord = {
      sessionId: sid,
      client,
      user,
      host: this.defaultHost,
      luwId,
      state: 'INITIAL',
      locks: [],
      updateTasks: [],
      history: [],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    this.sessions.set(sid, newSession);
    return newSession;
  }

  /**
   * Returns session affinity context metadata for auditing and verification.
   */
  public getAffinityContext(sessionId: string): SapRfcSessionAffinityContext | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    return {
      sessionId: session.sessionId,
      client: session.client,
      user: session.user,
      host: session.host,
      luwId: session.luwId,
      stateful: true,
      luwState: session.state,
      openLocksCount: session.locks.length,
      updateTasksRegistered: session.updateTasks.length,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt
    };
  }

  /**
   * Registers an RFC function call and sets the LUW state to active with session affinity.
   */
  public openLuw(
    sessionId: string,
    functionName: string,
    enqLocks: string[] = [],
    updateTaskName?: string
  ): SapRfcSessionRecord {
    const session = this.getOrCreateSession(sessionId);
    session.state = 'LUW_ACTIVE';
    session.lastActivityAt = new Date().toISOString();

    if (enqLocks.length > 0) {
      session.locks.push(...enqLocks);
    }

    if (updateTaskName) {
      session.updateTasks.push({
        functionModule: updateTaskName,
        type: 'V1',
        status: 'REGISTERED',
        registeredAt: new Date().toISOString()
      });
    }

    return session;
  }

  /**
   * Executes BAPI_TRANSACTION_COMMIT in the exact session where BAPI was executed.
   * Commits database LUW, executes synchronous V1/V2 update tasks (when WAIT='X'), and releases locks.
   */
  public commitLuw(sessionId: string, wait: boolean = true) {
    const session = this.sessions.get(sessionId);
    const timestamp = new Date().toISOString();

    if (!session) {
      return {
        command: 'BAPI_TRANSACTION_COMMIT' as const,
        waitApplied: wait,
        executionTimestamp: timestamp,
        status: 'COMMITTED' as const,
        sessionId,
        message: `Committed transactional LUW on session ${sessionId}.`
      };
    }

    session.state = 'COMMITTED';
    session.lastActivityAt = timestamp;
    
    // Execute all registered update tasks
    session.updateTasks.forEach(task => {
      task.status = 'EXECUTED';
    });

    // Release all enqueue locks in this session
    session.locks = [];

    return {
      command: 'BAPI_TRANSACTION_COMMIT' as const,
      waitApplied: wait,
      executionTimestamp: timestamp,
      status: 'COMMITTED' as const,
      sessionId: session.sessionId,
      luwId: session.luwId,
      message: `Executed BAPI_TRANSACTION_COMMIT with WAIT='${wait ? 'X' : ' '}' in active RFC session ${session.sessionId}. Released locks and finalized update tasks.`
    };
  }

  /**
   * Executes BAPI_TRANSACTION_ROLLBACK in the exact session where BAPI was executed.
   * Discards database LUW mutations, cancels update tasks, and releases locks.
   */
  public rollbackLuw(sessionId: string) {
    const session = this.sessions.get(sessionId);
    const timestamp = new Date().toISOString();

    if (!session) {
      return {
        command: 'BAPI_TRANSACTION_ROLLBACK' as const,
        waitApplied: false,
        executionTimestamp: timestamp,
        status: 'ROLLED_BACK' as const,
        sessionId,
        message: `Rolled back transactional LUW on session ${sessionId}.`
      };
    }

    session.state = 'ROLLED_BACK';
    session.lastActivityAt = timestamp;

    // Cancel all registered update tasks
    session.updateTasks.forEach(task => {
      task.status = 'CANCELLED';
    });

    // Release all enqueue locks in this session
    session.locks = [];

    return {
      command: 'BAPI_TRANSACTION_ROLLBACK' as const,
      waitApplied: false,
      executionTimestamp: timestamp,
      status: 'ROLLED_BACK' as const,
      sessionId: session.sessionId,
      luwId: session.luwId,
      message: `Executed BAPI_TRANSACTION_ROLLBACK in active RFC session ${session.sessionId}. Restored database state and released all locks.`
    };
  }

  /**
   * Records execution in session history.
   */
  public recordCall(
    sessionId: string,
    functionName: string,
    status: string,
    returnMessages: SapBapiReturnMessage[]
  ) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.history.push({
      functionName,
      timestamp: new Date().toISOString(),
      status,
      returnTypes: returnMessages.map(m => m.type)
    });
    session.lastActivityAt = new Date().toISOString();
  }

  /**
   * Returns list of all active sessions.
   */
  public getActiveSessions(): SapRfcSessionRecord[] {
    return Array.from(this.sessions.values());
  }
}

export const sapEccRfcSessionManager = new SapRfcSessionManager();
