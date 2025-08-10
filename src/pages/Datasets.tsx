import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, Dataset, TaskKind } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const taskTypes: TaskKind[] = ["intent", "ner", "t2sql", "e2e", "mixed"];

export default function DatasetsPage() {
  const { toast } = useToast();
  const { data: datasets = [], refetch } = useQuery({ queryKey: ["datasets"], queryFn: api.listDatasets });
  const [editing, setEditing] = useState<Dataset | null>(null);

  const mutate = useMutation({
    mutationFn: api.saveDataset,
    onSuccess: () => {
      toast({ title: "已保存" });
      setEditing(null);
      refetch();
    },
  });

  return (
    <div>
      <SEO title="测试数据集管理" description="对数据表中测试数据进行编辑、分类与维护" />
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-4">数据集</h1>
        <div className="space-y-4">
          {datasets.map((d) => (
            <Card key={d.id} className="p-4 hover:shadow-md transition-smooth">
              {editing?.id === d.id ? (
                <div className="space-y-3">
                  <Input placeholder="数据集名称" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  <Input placeholder="描述" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                  <Select value={editing.task_type} onValueChange={(v) => setEditing({ ...editing!, task_type: v as TaskKind })}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="选择任务类型" /></SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button variant="hero" size="sm" onClick={() => mutate.mutate(editing!)}>保存</Button>
                    <Button variant="outline" size="sm" onClick={() => setEditing(null)}>取消</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">任务类型：{d.task_type}{d.description ? ` · ${d.description}` : ''}</div>
                  </div>
                  <Button size="sm" onClick={() => setEditing(d)}>编辑</Button>
                </div>
              )}
            </Card>
          ))}
          {datasets.length === 0 && <div className="text-sm text-muted-foreground">暂无数据</div>}
        </div>
      </Card>
    </div>
  );
}
