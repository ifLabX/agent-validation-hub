import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Progress } from "@/components/ui/progress";
import { POLLING_INTERVAL_MS } from "@/config";

export default function TestRunsPage() {
  const { data: datasets = [] } = useQuery({ queryKey: ["datasets"], queryFn: api.listDatasets });
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: api.listAgents });
  const runsQuery = useQuery({ queryKey: ["runs"], queryFn: api.listTestRuns, refetchInterval: POLLING_INTERVAL_MS });
  const [datasetId, setDatasetId] = useState<string | undefined>(datasets[0]?.id);
  const [agentId, setAgentId] = useState<string | undefined>(agents[0]?.id);

  const start = useMutation({ mutationFn: () => api.startTestRun(datasetId!, agentId!) , onSuccess: () => runsQuery.refetch()});

  return (
    <div>
      <SEO title="测试进程管理" description="选择数据集与 Agent 端点发起测试，实时查看进度并入库结果" />
      <Card className="p-6">
        <h1 className="text-lg font-semibold mb-4">发起测试</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={datasetId} onValueChange={setDatasetId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="选择数据集" /></SelectTrigger>
            <SelectContent>
              {datasets.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="选择 Agent" /></SelectTrigger>
            <SelectContent>
              {agents.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="hero" onClick={() => datasetId && agentId && start.mutate()} disabled={!datasetId || !agentId || start.isPending}>
            {start.isPending ? "启动中…" : "开始测试"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">测试运行</h2>
        <div className="space-y-3">
          {runsQuery.data?.map((r) => (
            <div key={r.id} className="flex items-center gap-4">
              <div className="min-w-56 text-sm text-muted-foreground">#{r.id}</div>
              <Progress value={r.progress} className="flex-1" />
              <div className="w-20 text-right text-sm">{r.status}</div>
            </div>
          ))}
          {runsQuery.data?.length === 0 && <div className="text-sm text-muted-foreground">暂无运行</div>}
        </div>
      </Card>
    </div>
  );
}
