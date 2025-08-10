import { API_BASE_URL, USE_MOCKS } from "@/config";

// ===== Types aligned to DB schema =====
export type TaskKind = "intent" | "ner" | "t2sql" | "e2e" | "mixed";

export type Dataset = {
  id: string; // BIGSERIAL -> string for frontend
  name: string;
  task_type: TaskKind;
  description?: string;
  created_at: string;
};

export type Question = {
  id: string;
  dataset_id: string;
  content: string;
  category?: string;
  source_type?: string;
  source_remark?: string;
  difficulty?: number; // SMALLINT
  meta?: Record<string, any>;
  created_at: string;
};

export type GoldIntent = { question_id: string; intent_label: string };
export type GoldNER = { question_id: string; entities: Record<string, any> };
export type GoldT2SQL = { question_id: string; sql: string };
export type GoldE2E = { question_id: string; reference_answer?: string; rubric?: Record<string, any> };

export type Agent = {
  id: string;
  name: string;
  module: Exclude<TaskKind, "mixed">; // intent/ner/t2sql/e2e
  version: string;
  model_name?: string;
  prompt_hash?: string;
  code_commit?: string;
  config?: Record<string, any>;
  created_at: string;
};

export type Endpoint = {
  id: string;
  kind: "dify" | "gemini" | "openai" | "http";
  name: string;
  base_url?: string;
  auth?: Record<string, any>; // { api_key, bearer }
  default_params?: Record<string, any>;
  created_at: string;
};

export type TestRun = {
  id: string;
  dataset_id: string;
  agent_id: string;
  run_type: Exclude<TaskKind, "mixed">;
  params?: Record<string, any>;
  started_at?: string;
  finished_at?: string;
  status: "pending" | "running" | "succeeded" | "failed";
  progress: number; // 0-100
};

export type RunTask = {
  id: string;
  run_id: string;
  question_id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "skipped";
  try_count: number;
  latency_ms?: number;
  error?: string;
  created_at: string;
  updated_at: string;
};

export type Prediction = {
  id: string;
  run_id: string;
  question_id: string;
  pred_answer?: string;
  pred_intent?: string;
  pred_entities?: Record<string, any>;
  pred_sql?: string;
  raw_response?: Record<string, any>;
  latency_ms?: number;
  tokens?: Record<string, any>;
  errors?: Record<string, any>;
  created_at: string;
};

export type Evaluation = {
  id: string;
  run_id: string;
  question_id: string;
  metric: string;
  value: number;
  pass?: boolean;
  details?: Record<string, any>;
};

// Back-compat for Results page simple view
export type TestResult = {
  id: string;
  runId: string;
  input: string; // question content
  output: string; // pred_answer or summary
  score?: number;
  createdAt: string;
};

// ===== Base fetchers =====
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

// ===== Mocks =====
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
  datasets: "ia_datasets",
  questions: "ia_questions",
  agents: "ia_agents",
  endpoints: "ia_endpoints",
  runs: "ia_test_runs",
  runTasks: "ia_run_tasks",
  predictions: "ia_predictions",
  evaluations: "ia_evaluations",
  // Simple results for current Results page
  simpleResults: "avh_results",
  spiders: "ia_spiders",
  spiderJobs: "ia_spider_jobs",
  spiderItems: "ia_spider_items",
};

(function initMock() {
  if (!USE_MOCKS) return;
  if (!localStorage.getItem(MOCK.datasets)) {
    const now = new Date().toISOString();
    const ds: Dataset[] = [
      { id: "1", name: "通用意图样例", task_type: "intent", description: "用于意图识别示例", created_at: now },
      { id: "2", name: "金融NER样例", task_type: "ner", description: "金融领域实体识别", created_at: now },
    ];
    storage.write(MOCK.datasets, ds);
  }
  if (!localStorage.getItem(MOCK.questions)) {
    const now = new Date().toISOString();
    const qs: Question[] = [
      { id: "101", dataset_id: "1", content: "我想查询账户余额", category: "bank", source_type: "seed", difficulty: 1, created_at: now },
      { id: "102", dataset_id: "2", content: "今天上证指数是多少？", category: "market", source_type: "seed", difficulty: 2, created_at: now },
    ];
    storage.write(MOCK.questions, qs);
  }
  if (!localStorage.getItem(MOCK.agents)) {
    const now = new Date().toISOString();
    const agents: Agent[] = [
      { id: "11", name: "GPT-4o 模型A", module: "e2e", version: "v1", model_name: "gpt-4o", created_at: now },
      { id: "12", name: "意图识别B", module: "intent", version: "v1", model_name: "intent-bert", created_at: now },
    ];
    storage.write(MOCK.agents, agents);
  }
  if (!localStorage.getItem(MOCK.endpoints)) {
    const now = new Date().toISOString();
    const eps: Endpoint[] = [
      { id: "201", kind: "openai", name: "OpenAI 官方", base_url: "https://api.openai.com", auth: { api_key: "" }, created_at: now },
      { id: "202", kind: "http", name: "自研HTTP", base_url: "https://api.example.com", created_at: now },
    ];
    storage.write(MOCK.endpoints, eps);
  }
  if (!localStorage.getItem(MOCK.runs)) {
    storage.write<TestRun[]>(MOCK.runs, []);
  }
  if (!localStorage.getItem(MOCK.runTasks)) {
    storage.write<RunTask[]>(MOCK.runTasks, []);
  }
  if (!localStorage.getItem(MOCK.predictions)) {
    storage.write<Prediction[]>(MOCK.predictions, []);
  }
  if (!localStorage.getItem(MOCK.evaluations)) {
    storage.write<Evaluation[]>(MOCK.evaluations, []);
  }
  if (!localStorage.getItem(MOCK.simpleResults)) {
    const now = new Date().toISOString();
    storage.write(MOCK.simpleResults, [
      { id: "r1", runId: "run_1", input: "我想查询账户余额", output: "请前往账户页面查看余额。", createdAt: now },
    ] as TestResult[]);
  }
  if (!localStorage.getItem(MOCK.spiders)) {
    const now = new Date().toISOString();
    storage.write(MOCK.spiders, [
      { id: "301", name: "news_rss", target: "https://news.example/rss", runner: "http_hook", config: { type: "rss" }, created_at: now },
    ] as Spider[]);
  }
  if (!localStorage.getItem(MOCK.spiderJobs)) {
    storage.write<SpiderJob[]>(MOCK.spiderJobs, []);
  }
  if (!localStorage.getItem(MOCK.spiderItems)) {
    storage.write<SpiderItem[]>(MOCK.spiderItems, []);
  }
})();

// ===== Spider types & APIs =====
export type Spider = {
  id: string;
  name: string; // news_rss, fund_notice
  target: string; // target site / entry
  runner: string; // airflow_job, http_hook
  config?: Record<string, any>;
  created_at: string;
};

export type SpiderJob = {
  id: string;
  spider_id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  progress: number; // 0~100 as percentage
  stats?: Record<string, any>;
  started_at?: string;
  finished_at?: string;
  error?: string;
};

export type SpiderItem = {
  id: string;
  job_id: string;
  url?: string;
  title?: string;
  content?: string;
  meta?: Record<string, any>;
  mapped_question_id?: string;
};

export const api = {
  // ===== Datasets =====
  async listDatasets(): Promise<Dataset[]> {
    if (USE_MOCKS) return storage.read<Dataset[]>(MOCK.datasets, []);
    return get<Dataset[]>("/api/datasets");
  },
  async saveDataset(ds: Dataset): Promise<Dataset> {
    if (USE_MOCKS) {
      const list = storage.read<Dataset[]>(MOCK.datasets, []);
      const idx = list.findIndex((x) => x.id === ds.id);
      if (idx >= 0) list[idx] = ds; else list.unshift({ ...ds, id: String(Date.now()), created_at: new Date().toISOString() });
      storage.write(MOCK.datasets, list);
      return idx >= 0 ? list[idx] : list[0];
    }
    return post<Dataset>("/api/datasets/save", ds);
  },

  // ===== Questions =====
  async listQuestions(datasetId?: string): Promise<Question[]> {
    if (USE_MOCKS) {
      const all = storage.read<Question[]>(MOCK.questions, []);
      return datasetId ? all.filter((q) => q.dataset_id === datasetId) : all;
    }
    const path = datasetId ? `/api/questions?dataset_id=${datasetId}` : "/api/questions";
    return get<Question[]>(path);
  },
  async saveQuestion(q: Question): Promise<Question> {
    if (USE_MOCKS) {
      const list = storage.read<Question[]>(MOCK.questions, []);
      const idx = list.findIndex((x) => x.id === q.id);
      if (idx >= 0) list[idx] = q; else list.unshift({ ...q, id: String(Date.now()), created_at: new Date().toISOString() });
      storage.write(MOCK.questions, list);
      return idx >= 0 ? list[idx] : list[0];
    }
    return post<Question>("/api/questions/save", q);
  },

  // ===== Agents (evaluation agents) =====
  async listAgents(): Promise<Agent[]> {
    if (USE_MOCKS) return storage.read<Agent[]>(MOCK.agents, []);
    return get<Agent[]>("/api/agents");
  },
  async saveAgent(agent: Agent): Promise<Agent> {
    if (USE_MOCKS) {
      const list = storage.read<Agent[]>(MOCK.agents, []);
      const idx = list.findIndex((x) => x.id === agent.id);
      if (idx >= 0) list[idx] = agent; else list.unshift({ ...agent, id: String(Date.now()), created_at: new Date().toISOString() });
      storage.write(MOCK.agents, list);
      return idx >= 0 ? list[idx] : list[0];
    }
    return post<Agent>("/api/agents/save", agent);
  },

  // ===== Endpoints (LLM/endpoints) =====
  async listEndpoints(): Promise<Endpoint[]> {
    if (USE_MOCKS) return storage.read<Endpoint[]>(MOCK.endpoints, []);
    return get<Endpoint[]>("/api/endpoints");
  },
  async saveEndpoint(ep: Endpoint): Promise<Endpoint> {
    if (USE_MOCKS) {
      const list = storage.read<Endpoint[]>(MOCK.endpoints, []);
      const idx = list.findIndex((x) => x.id === ep.id);
      if (idx >= 0) list[idx] = ep; else list.unshift({ ...ep, id: String(Date.now()), created_at: new Date().toISOString() });
      storage.write(MOCK.endpoints, list);
      return idx >= 0 ? list[idx] : list[0];
    }
    return post<Endpoint>("/api/endpoints/save", ep);
  },

  // ===== Test runs =====
  async startTestRun(datasetId: string, agentId: string): Promise<{ id: string }> {
    if (USE_MOCKS) {
      const agents = storage.read<Agent[]>(MOCK.agents, []);
      const agent = agents.find((a) => a.id === agentId);
      const run_type = (agent?.module ?? "e2e") as Exclude<TaskKind, "mixed">;
      const runs = storage.read<TestRun[]>(MOCK.runs, []);
      const id = `run_${Date.now()}`;
      runs.unshift({ id, dataset_id: datasetId, agent_id: agentId, run_type, status: "running", progress: 1, started_at: new Date().toISOString() });
      storage.write(MOCK.runs, runs);
      return { id };
    }
    return post<{ id: string }>("/api/tests/start", { dataset_id: datasetId, agent_id: agentId });
  },
  async listTestRuns(): Promise<TestRun[]> {
    if (USE_MOCKS) {
      const runs = storage.read<TestRun[]>(MOCK.runs, []);
      const updated = runs.map((r): TestRun => {
        if (r.status === "running") {
          const progress = Math.min(100, r.progress + Math.ceil(Math.random() * 20));
          const status: TestRun["status"] = progress >= 100 ? "succeeded" : "running";
          return { ...r, progress, status, finished_at: status === "succeeded" ? new Date().toISOString() : r.finished_at };
        }
        return r;
      });
      storage.write(MOCK.runs, updated);
      return updated;
    }
    return get<TestRun[]>("/api/tests/runs");
  },

  // ===== Simple results for current Results page =====
  async listResults(): Promise<TestResult[]> {
    if (USE_MOCKS) return storage.read<TestResult[]>(MOCK.simpleResults, []);
    return get<TestResult[]>("/api/results/simple");
  },

  // ===== LabelStudio push (kept for Settings demo) =====
  async pushToLabelStudio(payload: { datasetId?: string; runId?: string; url: string; token: string }): Promise<{ ok: boolean }>{
    if (USE_MOCKS) return { ok: true };
    return post<{ ok: boolean }>("/api/labelstudio/push", payload);
  },

  // ===== Spiders =====
  async listSpiders(): Promise<Spider[]> {
    if (USE_MOCKS) return storage.read<Spider[]>(MOCK.spiders, []);
    return get<Spider[]>("/api/spiders");
  },
  async saveSpider(spider: Spider): Promise<Spider> {
    if (USE_MOCKS) {
      const list = storage.read<Spider[]>(MOCK.spiders, []);
      const idx = list.findIndex((x) => x.id === spider.id);
      if (idx >= 0) list[idx] = spider; else list.unshift({ ...spider, id: String(Date.now()), created_at: new Date().toISOString() });
      storage.write(MOCK.spiders, list);
      return idx >= 0 ? list[idx] : list[0];
    }
    return post<Spider>("/api/spiders/save", spider);
  },
  async listSpiderJobs(): Promise<SpiderJob[]> {
    if (USE_MOCKS) {
      const jobs = storage.read<SpiderJob[]>(MOCK.spiderJobs, []);
      // simulate progress
      const updated = jobs.map((j): SpiderJob => {
        if (j.status === "running") {
          const progress = Math.min(100, j.progress + Math.ceil(Math.random() * 15));
          const status: SpiderJob["status"] = progress >= 100 ? "succeeded" : "running";
          return { ...j, progress, status, finished_at: status === "succeeded" ? new Date().toISOString() : j.finished_at };
        }
        return j;
      });
      storage.write(MOCK.spiderJobs, updated);
      return updated;
    }
    return get<SpiderJob[]>("/api/spiders/jobs");
  },
  async startSpiderJob(spider_id: string): Promise<{ id: string }> {
    if (USE_MOCKS) {
      const jobs = storage.read<SpiderJob[]>(MOCK.spiderJobs, []);
      const id = `sj_${Date.now()}`;
      jobs.unshift({ id, spider_id, status: "running", progress: 1, started_at: new Date().toISOString() });
      storage.write(MOCK.spiderJobs, jobs);
      return { id };
    }
    return post<{ id: string }>("/api/spiders/start", { spider_id });
  },
};
