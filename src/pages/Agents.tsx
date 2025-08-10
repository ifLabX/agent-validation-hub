import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, Agent, TaskKind } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function AgentsPage() {
  const { toast } = useToast();
  const { data: agents = [], refetch } = useQuery({ queryKey: ["agents"], queryFn: api.listAgents });
  const [editing, setEditing] = useState<Agent | null>(null);

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
                <Input placeholder="名称" value={editing.name} onChange={(e) => setEditing({ ...editing!, name: e.target.value })} />
                <Select value={editing.module} onValueChange={(v) => setEditing({ ...editing!, module: v as Agent["module"] })}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="选择模块" /></SelectTrigger>
                  <SelectContent>
                    {["intent","ner","t2sql","e2e"].map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Input placeholder="版本" value={editing.version} onChange={(e) => setEditing({ ...editing!, version: e.target.value })} />
                <Input placeholder="模型名称" value={editing.model_name || ""} onChange={(e) => setEditing({ ...editing!, model_name: e.target.value })} />
                <Input placeholder="Prompt Hash" value={editing.prompt_hash || ""} onChange={(e) => setEditing({ ...editing!, prompt_hash: e.target.value })} />
                <Input placeholder="代码提交" value={editing.code_commit || ""} onChange={(e) => setEditing({ ...editing!, code_commit: e.target.value })} />
                <div className="flex gap-2">
                  <Button variant="hero" size="sm" onClick={() => save.mutate(editing!)}>保存</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(null)}>取消</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">模块：{a.module} · 版本：{a.version}</div>
                <div className="text-sm text-muted-foreground">模型：{a.model_name || "未设置"}</div>
                <Button size="sm" onClick={() => setEditing(a)}>编辑</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
