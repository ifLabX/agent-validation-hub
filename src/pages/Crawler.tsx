import { useEffect, useMemo, useRef, useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, Spider, SpiderJob } from "@/services/api";
import { POLLING_INTERVAL_MS } from "@/config";

const PRESETS = [
  { key: "xueqiu", label: "雪球", cmd: "python spider.py run --source xueqiu --limit 100" },
  { key: "guba", label: "股吧", cmd: "python spider.py run --source guba --limit 100" },
  { key: "ttjj", label: "天天基金", cmd: "python spider.py run --source ttjj --limit 100" },
] as const;

type PresetKey = typeof PRESETS[number]["key"];

export default function CrawlerPage() {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null);
  const [command, setCommand] = useState<string>("");
  const [activeJobId, setActiveJobId] = useState<string | number | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | number | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const lastStatsRef = useRef<any>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const spidersQuery = useQuery<Spider[]>({
    queryKey: ["spiders"],
    queryFn: api.listSpiders,
  });
  const jobsQuery = useQuery<SpiderJob[]>({
    queryKey: ["spider-jobs"],
    queryFn: api.listSpiderJobs,
    refetchInterval: POLLING_INTERVAL_MS,
  });

  const handleSelectPreset = (k: PresetKey) => {
    setSelectedPreset(k);
    const preset = PRESETS.find((p) => p.key === k)!;
    setCommand(preset.cmd);
  };

  const findSpiderIdForPreset = (label: string) => {
    const list = spidersQuery.data || [];
    const found = list.find((s) => s.name === label || s.name.includes(label));
    return (found?.id ?? list[0]?.id) as string | undefined;
  };

  const startMutation = useMutation({
    mutationFn: (spiderId: string) => api.startSpiderJob(spiderId),
    onSuccess: (job: any) => {
      toast({ title: "已启动爬虫任务", description: "任务已加入队列" });
      setActiveJobId(job?.id ?? null);
      setExpandedJobId(job?.id ?? null);
      setLogLines((lines) => [...lines, `[${new Date().toLocaleTimeString()}] 任务已启动`]);
      jobsQuery.refetch();
    },
  });

  const activeJob = useMemo(() => jobsQuery.data?.find((j) => j.id === activeJobId), [jobsQuery.data, activeJobId]);

  useEffect(() => {
    if (!activeJob) return;
    const stats = (activeJob as any).stats || {};
    const crawled = stats.crawled ?? stats.fetch_count ?? stats.crawl ?? 0;
    const stored = stats.stored ?? stats.saved ?? 0;
    const failed = stats.failed ?? stats.error ?? 0;
    const p = typeof activeJob.progress === "number" ? activeJob.progress : 0;
    const pct = p <= 1 ? Math.round(p * 100) : Math.round(p);
    const last = lastStatsRef.current;
    if (!last || last.crawled !== crawled || last.stored !== stored || last.failed !== failed || last.pct !== pct || last.status !== activeJob.status) {
      setLogLines((lines) => [
        ...lines,
        `[${new Date().toLocaleTimeString()}] 状态:${activeJob.status} 进度:${pct}% 已抓取:${crawled} 入库:${stored} 失败:${failed}`,
      ]);
      lastStatsRef.current = { crawled, stored, failed, pct, status: activeJob.status };
    }
  }, [activeJob?.progress, activeJob?.status, jobsQuery.data]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logLines]);

  const startJob = () => {
    if (!selectedPreset) {
      toast({ title: "请选择爬虫类型", description: "请先选择一个预设爬虫" });
      return;
    }
    const label = PRESETS.find((p) => p.key === selectedPreset)!.label;
    const spiderId = findSpiderIdForPreset(label);
    if (!spiderId) {
      toast({ title: "未找到爬虫", description: `请先在爬虫注册中添加：${label}` });
      return;
    }
    // 这里调用后端任务启动；命令行由后端读取（当前仅在前端展示和可编辑）
    startMutation.mutate(spiderId);
  };

  const pct = (v?: number) => {
    const n = typeof v === "number" ? v : 0;
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
    };

  return (
    <div>
      <SEO title="数据爬虫管理" description="配置目标站点并查看爬取进度，入库状态可视化" />

      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-4">启动新的爬虫任务</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <Button
              key={p.key}
              variant={selectedPreset === p.key ? "hero" : "soft"}
              onClick={() => handleSelectPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="将要执行的命令行（可编辑）"
          />
          <div className="flex gap-3">
            <Button variant="hero" onClick={startJob} disabled={!selectedPreset || startMutation.isPending}>
              {startMutation.isPending ? "启动中…" : "开始任务"}
            </Button>
          </div>
        </div>
      </Card>

      {activeJob && (
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">运行日志</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-sm text-muted-foreground">任务ID: {String(activeJob.id)}</div>
            <div className="text-sm text-muted-foreground">状态: {activeJob.status}</div>
          </div>
          <Progress value={pct(activeJob.progress)} className="mb-3" />
          <div ref={logRef} className="h-48 overflow-auto rounded-md border p-3 text-sm">
            {logLines.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">{l}</div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">爬虫任务</h2>
        <div className="space-y-4">
          {jobsQuery.data?.map((j) => {
            const name = spidersQuery.data?.find((s) => s.id === j.spider_id)?.name || j.spider_id;
            const stats: any = (j as any).stats || {};
            const crawled = stats.crawled ?? stats.fetch_count ?? 0;
            const stored = stats.stored ?? 0;
            const failed = stats.failed ?? 0;
            const isExpanded = expandedJobId === j.id;
            return (
              <div key={j.id} className="rounded-lg border">
                <button
                  className="w-full text-left p-4 flex items-center gap-4"
                  onClick={() => setExpandedJobId(isExpanded ? null : (j.id as any))}
                >
                  <div className="min-w-52 text-sm text-muted-foreground">{name}</div>
                  <Progress value={pct(j.progress)} className="flex-1" />
                  <div className="w-52 text-right text-sm">
                    <span className="mr-3">抓取:{crawled} 入库:{stored} 失败:{failed}</span>
                    <span>{j.status}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-4 pt-0 text-sm text-muted-foreground">
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>任务ID: {String(j.id)}</div>
                      <div>爬虫: {String(name)}</div>
                      <div>进度: {pct(j.progress)}%</div>
                      <div>状态: {j.status}</div>
                      {(j as any).started_at && <div>开始: {String((j as any).started_at)}</div>}
                      {(j as any).finished_at && <div>结束: {String((j as any).finished_at)}</div>}
                      {(j as any).error && <div className="col-span-full">错误: {String((j as any).error)}</div>}
                    </div>
                    <div className="mt-3">
                      {j.status === "succeeded" ? "已写入测试数据表" : "运行中…"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {jobsQuery.data?.length === 0 && (
            <div className="text-sm text-muted-foreground">暂无任务</div>
          )}
        </div>
      </Card>
    </div>
  );
}
