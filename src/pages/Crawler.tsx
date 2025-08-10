import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, Spider, SpiderJob } from "@/services/api";
import { POLLING_INTERVAL_MS } from "@/config";

export default function CrawlerPage() {
  const { toast } = useToast();
  const [spiderId, setSpiderId] = useState<string>("");

  const spidersQuery = useQuery<Spider[]>({
    queryKey: ["spiders"],
    queryFn: api.listSpiders,
  });
  const jobsQuery = useQuery<SpiderJob[]>({
    queryKey: ["spider-jobs"],
    queryFn: api.listSpiderJobs,
    refetchInterval: POLLING_INTERVAL_MS,
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => api.startSpiderJob(id),
    onSuccess: () => {
      toast({ title: "已启动爬虫任务", description: "任务已加入队列" });
      setSpiderId("");
      jobsQuery.refetch();
    },
  });

  return (
    <div>
      <SEO title="数据爬虫管理" description="配置目标站点并查看爬取进度，入库状态可视化" />
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-4">启动新的爬虫任务</h1>
        <div className="flex gap-3">
          <Select value={spiderId} onValueChange={setSpiderId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="选择爬虫" /></SelectTrigger>
            <SelectContent>
              {spidersQuery.data?.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="hero" onClick={() => spiderId && startMutation.mutate(spiderId)} disabled={!spiderId || startMutation.isPending}>
            {startMutation.isPending ? "启动中…" : "开始任务"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">爬虫任务</h2>
        <div className="space-y-4">
          {jobsQuery.data?.map((j) => {
            const name = spidersQuery.data?.find((s) => s.id === j.spider_id)?.name || j.spider_id;
            return (
              <div key={j.id} className="flex items-center gap-4">
                <div className="min-w-52 text-sm text-muted-foreground">{name}</div>
                <Progress value={j.progress} className="flex-1" />
                <div className="w-20 text-right text-sm">{j.status}</div>
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
