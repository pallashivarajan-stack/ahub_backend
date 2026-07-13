import { useState } from "react";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useImpactMetrics,
  useCreateImpactMetric,
  useUpdateImpactMetric,
  useDeleteImpactMetric,
} from "@/hooks/useCMS";
import { ImpactForm } from "./ImpactForm";

export function ImpactTab() {
  const { data: metrics, isLoading } = useImpactMetrics();
  const createMetric = useCreateImpactMetric();
  const updateMetric = useUpdateImpactMetric();
  const deleteMetric = useDeleteImpactMetric();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<any | null>(null);

  const filtered = (metrics || []).filter(
    (m: any) =>
      m.metric_id?.toLowerCase().includes(search.toLowerCase()) ||
      m.label?.toLowerCase().includes(search.toLowerCase()) ||
      m.value?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingMetric(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (metric: any) => {
    setEditingMetric(metric);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingMetric) {
        await updateMetric.mutateAsync({ id: editingMetric.id, metricData: formData });
        toast.success("Impact metric updated!");
      } else {
        await createMetric.mutateAsync(formData);
        toast.success("Impact metric created!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Something went wrong.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this impact metric?")) return;
    try {
      await deleteMetric.mutateAsync(id);
      toast.success("Impact metric deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Impact Metrics</CardTitle>
              <CardDescription>Manage the numbers shown on the Impact page (Active Startups, Funds Raised, etc.)</CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Metric
            </Button>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Search metrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs rounded-xl border-slate-200"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              {search ? "No metrics match your search." : "No metrics yet. Click \"Add Metric\" to create one."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Metric ID</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Sub Label</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((metric: any) => (
                  <TableRow key={metric.id}>
                    <TableCell className="text-slate-400">{metric.display_order}</TableCell>
                    <TableCell className="font-mono text-xs">{metric.metric_id}</TableCell>
                    <TableCell className="font-semibold">{metric.value}</TableCell>
                    <TableCell>{metric.label}</TableCell>
                    <TableCell className="text-slate-400 text-xs">{metric.sub_label || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(metric)}
                          className="h-8 w-8 text-slate-400 hover:text-[#FF6B00]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(metric.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingMetric(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMetric ? "Edit Impact Metric" : "Add Impact Metric"}</DialogTitle>
          </DialogHeader>
          <ImpactForm
            initialData={editingMetric}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={createMetric.isPending || updateMetric.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
