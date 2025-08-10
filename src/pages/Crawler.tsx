import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { POLLING_INTERVAL_MS } from "@/config";

export default function CrawlerPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["crawl-jobs"],
    queryFn: api.listCrawlJobs,
    refetchInterval: POLLING_INTERVAL_MS,
  });

  const startMutation = useMutation({
    mutationFn: (u: string) => api.startCrawl(u),
    onSuccess: () => {
      toast({ title: "已启动爬虫", description: "任务已加入队列" });
      setUrl("");
      jobsQuery.refetch();
    },
  });

  return (
    <div>
      <SEO title="数据爬虫管理" description="配置目标站点并查看爬取进度，入库状态可视化" />
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-4">启动新的爬虫任务</h1>
        <div className="flex gap-3">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://target.site" />
          <Button variant="hero" onClick={() => url && startMutation.mutate(url)} disabled={!url || startMutation.isPending}>
            {startMutation.isPending ? "启动中…" : "开始爬取"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">爬虫任务</h2>
        <div className="space-y-4">
          {jobsQuery.data?.map((j) => (
            <div key={j.id} className="flex items-center gap-4">
              <div className="min-w-52 text-sm text-muted-foreground">{j.url}</div>
              <Progress value={j.progress} className="flex-1" />
              <div className="w-20 text-right text-sm">{j.status}</div>
            </div>
          ))}
          {jobsQuery.data?.length === 0 && (
            <div className="text-sm text-muted-foreground">暂无任务</div>
          )}
        </div>
      </Card>
    </div>
  );
}
