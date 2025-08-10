import { API_BASE_URL, USE_MOCKS } from "@/config";

export type CrawlJob = {
  id: string;
  url: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number; // 0-100
  createdAt: string;
};

export type DatasetItem = {
  id: string;
  content: string;
  category?: string;
  updatedAt: string;
};

export type AgentConfig = {
  id: string;
  name: string; // Dify / Google
  baseUrl?: string;
  apiKey?: string;
};

export type TestRun = {
  id: string;
  datasetId: string;
  agentId: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  createdAt: string;
};

export type TestResult = {
  id: string;
  runId: string;
  input: string;
  output: string;
  score?: number;
  createdAt: string;
};

function get<T>(path: string): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`).then((r) => r.json());
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
}

// ============ MOCKS ============
const storage = {
  read<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  },
  write<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const MOCK = {
  jobsKey: "avh_jobs",
  datasetsKey: "avh_datasets",
  agentsKey: "avh_agents",
  runsKey: "avh_runs",
  resultsKey: "avh_results",
};

// 初始化部分示例数据
(function initMock() {
  if (!USE_MOCKS) return;
  if (!localStorage.getItem(MOCK.datasetsKey)) {
    storage.write(MOCK.datasetsKey, [
      { id: "ds_1", content: "示例问题：请总结以下文本…", category: "general", updatedAt: new Date().toISOString() },
      { id: "ds_2", content: "金融场景问答样本", category: "finance", updatedAt: new Date().toISOString() },
    ] as DatasetItem[]);
  }
  if (!localStorage.getItem(MOCK.agentsKey)) {
    storage.write(MOCK.agentsKey, [
      { id: "ag_dify", name: "Dify", baseUrl: "https://api.dify.ai", apiKey: "" },
      { id: "ag_google", name: "Google", baseUrl: "https://generativelanguage.googleapis.com", apiKey: "" },
    ] as AgentConfig[]);
  }
})();

export const api = {
  // 爬虫
  async startCrawl(url: string): Promise<{ id: string }>
  {
    if (USE_MOCKS) {
      const jobs = storage.read<CrawlJob[]>(MOCK.jobsKey, []);
      const id = `job_${Date.now()}`;
      jobs.unshift({ id, url, status: "running", progress: 5, createdAt: new Date().toISOString() });
      storage.write(MOCK.jobsKey, jobs);
      return { id };
    }
    return post<{ id: string }>("/api/crawler/start", { url });
  },
  async listCrawlJobs(): Promise<CrawlJob[]> {
    if (USE_MOCKS) {
      const jobs = storage.read<CrawlJob[]>(MOCK.jobsKey, []);
      // 模拟进度
      const updated = jobs.map((j) => {
        if (j.status === "running") {
          const progress = Math.min(100, j.progress + Math.ceil(Math.random() * 15));
          return {
            ...j,
            progress,
            status: progress >= 100 ? "completed" : "running",
          };
        }
        return j;
      });
      storage.write(MOCK.jobsKey, updated);
      return updated;
    }
    return get<CrawlJob[]>("/api/crawler/jobs");
  },

  // 数据集
  async listDatasets(): Promise<DatasetItem[]> {
    if (USE_MOCKS) return storage.read<DatasetItem[]>(MOCK.datasetsKey, []);
    return get<DatasetItem[]>("/api/datasets");
  },
  async updateDataset(item: DatasetItem): Promise<DatasetItem> {
    if (USE_MOCKS) {
      const list = storage.read<DatasetItem[]>(MOCK.datasetsKey, []);
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx >= 0) list[idx] = { ...item, updatedAt: new Date().toISOString() };
      storage.write(MOCK.datasetsKey, list);
      return list[idx];
    }
    return post<DatasetItem>("/api/datasets/update", item);
  },

  // Agent 配置
  async listAgents(): Promise<AgentConfig[]> {
    if (USE_MOCKS) return storage.read<AgentConfig[]>(MOCK.agentsKey, []);
    return get<AgentConfig[]>("/api/agents");
  },
  async saveAgent(agent: AgentConfig): Promise<AgentConfig> {
    if (USE_MOCKS) {
      const list = storage.read<AgentConfig[]>(MOCK.agentsKey, []);
      const idx = list.findIndex((x) => x.id === agent.id);
      if (idx >= 0) list[idx] = agent; else list.push(agent);
      storage.write(MOCK.agentsKey, list);
      return agent;
    }
    return post<AgentConfig>("/api/agents/save", agent);
  },

  // 测试流程
  async startTestRun(datasetId: string, agentId: string): Promise<{ id: string }>{
    if (USE_MOCKS) {
      const runs = storage.read<TestRun[]>(MOCK.runsKey, []);
      const id = `run_${Date.now()}`;
      runs.unshift({ id, datasetId, agentId, status: "running", progress: 1, createdAt: new Date().toISOString() });
      storage.write(MOCK.runsKey, runs);
      return { id };
    }
    return post<{ id: string }>("/api/tests/start", { datasetId, agentId });
  },
  async listTestRuns(): Promise<TestRun[]> {
    if (USE_MOCKS) {
      const runs = storage.read<TestRun[]>(MOCK.runsKey, []);
      const updated = runs.map((r) => {
        if (r.status === "running") {
          const progress = Math.min(100, r.progress + Math.ceil(Math.random() * 20));
          return { ...r, progress, status: progress >= 100 ? "completed" : "running" };
        }
        return r;
      });
      storage.write(MOCK.runsKey, updated);
      return updated;
    }
    return get<TestRun[]>("/api/tests/runs");
  },

  // 结果
  async listResults(): Promise<TestResult[]> {
    if (USE_MOCKS) return storage.read<TestResult[]>(MOCK.resultsKey, []);
    return get<TestResult[]>("/api/results");
  },
  async pushToLabelStudio(payload: { datasetId?: string; runId?: string; url: string; token: string }): Promise<{ ok: boolean }>{
    if (USE_MOCKS) return { ok: true };
    return post<{ ok: boolean }>("/api/labelstudio/push", payload);
  },
};
