import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const StatCard = ({ title, value, hint }: { title: string; value: string | number; hint?: string }) => (
  <Card className="p-5 hover:shadow-lg transition-smooth">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="mt-2 text-3xl font-semibold">{value}</div>
    {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
  </Card>
);

const Index = () => {
  const { data: runs = [] } = useQuery({ queryKey: ["runs"], queryFn: api.listTestRuns });
  const running = runs.filter((r) => r.status === "running");

  return (
    <div>
      <SEO title="Agent Validation Hub – 仪表盘" description="管理爬虫、数据集、Agent 接入、测试流程与结果集的统一平台" />
      <section className="mb-6">
        <Card className="p-8 bg-gradient-primary shadow-glow">
          <h1 className="text-3xl font-bold text-primary-foreground">智能体测试与评估平台</h1>
          <p className="mt-2 text-primary-foreground/90">统一管理爬虫数据、测试数据集、Agent 接入与测试编排。</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/testruns"><Button variant="hero">开始测试</Button></Link>
            <Link to="/datasets"><Button variant="soft">管理数据集</Button></Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="正在运行的测试" value={running.length} />
        <StatCard title="数据集数量" value={2} hint="示例数据，可与后端对接" />
        <StatCard title="可用 Agent" value={2} />
        <StatCard title="近期待办" value={"3"} />
      </section>

      {running.length > 0 && (
        <section className="mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">进行中的测试</h2>
            <div className="space-y-3">
              {running.map((r) => (
                <div key={r.id} className="flex items-center gap-4">
                  <div className="min-w-40 text-sm">#{r.id}</div>
                  <Progress value={r.progress} className="flex-1" />
                  <div className="w-16 text-right text-sm text-muted-foreground">{r.progress}%</div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
};

export default Index;
