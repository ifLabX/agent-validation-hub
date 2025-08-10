import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export default function SettingsPage() {
  const { toast } = useToast();
  const [lsUrl, setLsUrl] = useState(localStorage.getItem("avh_ls_url") || "");
  const [lsToken, setLsToken] = useState(localStorage.getItem("avh_ls_token") || "");

  const save = () => {
    localStorage.setItem("avh_ls_url", lsUrl);
    localStorage.setItem("avh_ls_token", lsToken);
    toast({ title: "已保存 LabelStudio 配置" });
  };

  const pushExample = async () => {
    const ok = await api.pushToLabelStudio({ url: lsUrl, token: lsToken, datasetId: "ds_1" });
    toast({ title: ok.ok ? "已推送到 LabelStudio" : "推送失败", variant: ok.ok ? undefined : "destructive" });
  };

  return (
    <div>
      <SEO title="系统设置" description="配置 LabelStudio 与其他系统的访问参数" />
      <Card className="p-6 max-w-2xl">
        <h1 className="text-xl font-semibold mb-4">LabelStudio</h1>
        <div className="space-y-3">
          <Input placeholder="LabelStudio URL" value={lsUrl} onChange={(e) => setLsUrl(e.target.value)} />
          <Input placeholder="LabelStudio Token" value={lsToken} onChange={(e) => setLsToken(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="hero" onClick={save}>保存</Button>
            <Button onClick={pushExample}>推送示例数据集</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
