import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, AgentConfig } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function AgentsPage() {
  const { toast } = useToast();
  const { data: agents = [], refetch } = useQuery({ queryKey: ["agents"], queryFn: api.listAgents });
  const [editing, setEditing] = useState<AgentConfig | null>(null);

  const save = useMutation({
    mutationFn: api.saveAgent,
    onSuccess: () => {
      toast({ title: "已保存 Agent 配置" });
      setEditing(null);
      refetch();
    },
  });

  return (
    <div>
      <SEO title="测试端点接入" description="配置 Dify、Google 等 Agent 系统的 API 以接入应用" />
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="font-semibold mb-2">{a.name}</div>
            {editing?.id === a.id ? (
              <div className="space-y-3">
                <Input placeholder="Base URL" value={editing.baseUrl} onChange={(e) => setEditing({ ...editing!, baseUrl: e.target.value })} />
                <Input placeholder="API Key（保存在本地）" value={editing.apiKey} onChange={(e) => setEditing({ ...editing!, apiKey: e.target.value })} />
                <div className="flex gap-2">
                  <Button variant="hero" size="sm" onClick={() => save.mutate(editing!)}>保存</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(null)}>取消</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Base URL：{a.baseUrl || "未设置"}</div>
                <div className="text-sm text-muted-foreground">API Key：{a.apiKey ? "******" : "未设置"}</div>
                <Button size="sm" onClick={() => setEditing(a)}>编辑</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
