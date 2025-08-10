import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function ResultsPage() {
  const { data: results = [] } = useQuery({ queryKey: ["results"], queryFn: api.listResults });

  return (
    <div>
      <SEO title="测试结果集管理" description="查看与筛选测试结果，支持导出与标注对接" />
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-4">结果列表</h1>
        <div className="space-y-3">
          {results.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="text-sm">输入：{r.input}</div>
              <div className="text-sm">输出：{r.output}</div>
              {r.score !== undefined && (
                <div className="text-sm text-muted-foreground">得分：{r.score}</div>
              )}
            </Card>
          ))}
          {results.length === 0 && <div className="text-sm text-muted-foreground">暂无结果</div>}
        </div>
      </Card>
    </div>
  );
}
