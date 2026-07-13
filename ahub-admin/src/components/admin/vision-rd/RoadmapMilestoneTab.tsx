import { useState, useRef } from "react";
import { Plus, Loader2, Image as ImageIcon, Milestone, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { resolveBackendMediaUrl } from "@/lib/media";
import {
  useRoadmap,
  useUpdateRoadmap,
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useReorderMilestones,
  useUploadVisionRoadmapImage,
} from "@/hooks/useCMS";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2 } from "lucide-react";

export function RoadmapMilestoneTab() {
  const { data: roadmaps, isLoading: isRoadmapLoading, isError: isRError, error: rError } = useRoadmap();
  const updateRoadmap = useUpdateRoadmap();
  const uploadImage = useUploadVisionRoadmapImage();
  const roadmapItem = roadmaps?.[0];

  const { data: milestones, isLoading: isMsLoading, isError: isMsError, error: msError } = useMilestones();
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const reorderMilestones = useReorderMilestones();

  const [localMilestones, setLocalMilestones] = useState<any[]>(milestones || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMs, setEditingMs] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const prevMilestonesRef = useRef(milestones);
  if (milestones && milestones !== prevMilestonesRef.current) {
    prevMilestonesRef.current = milestones;
    setLocalMilestones(milestones);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [roadmapUrl, setRoadmapUrl] = useState(roadmapItem?.image_url || "");
  const [isUploadingR, setIsUploadingR] = useState(false);
  const roadmapFileRef = useRef<HTMLInputElement>(null);

  const prevRoadmapItemRef = useRef(roadmapItem);
  if (roadmapItem !== prevRoadmapItemRef.current) {
    prevRoadmapItemRef.current = roadmapItem;
    if (roadmapItem?.image_url) setRoadmapUrl(roadmapItem.image_url);
  }

  const handleRoadmapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingR(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadImage.mutateAsync({ entityType: "roadmap", formData: fd });
      setRoadmapUrl(result.image_url);
      toast.success("Roadmap image uploaded!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setIsUploadingR(false);
    }
  };

  const handleRoadmapSave = async () => {
    if (!roadmapItem?.id) {
      toast.error("No roadmap record found");
      return;
    }
    try {
      await updateRoadmap.mutateAsync({ id: roadmapItem.id, itemData: { image_url: roadmapUrl || null } });
      toast.success("Roadmap updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const openCreate = () => {
    setEditingMs(null);
    setIsDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingMs(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingMs) {
        await updateMilestone.mutateAsync({ id: editingMs.id, itemData: formData });
        toast.success("Milestone updated!");
      } else {
        await createMilestone.mutateAsync(formData);
        toast.success("Milestone created!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this milestone?")) return;
    try {
      await deleteMilestone.mutateAsync(id);
      toast.success("Milestone deleted!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = localMilestones.findIndex((m) => m.id === active.id);
    const newIdx = localMilestones.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(localMilestones, oldIdx, newIdx);
    setLocalMilestones(reordered);
    await reorderMilestones.mutateAsync(
      reordered.map((m, i) => ({ id: m.id, order: i }))
    );
  };

  const filtered = search
    ? localMilestones.filter((m: any) =>
        m.year_label.toLowerCase().includes(search.toLowerCase())
      )
    : localMilestones;

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#FF6B00]" />
            Strategic Roadmap
          </CardTitle>
          <CardDescription className="text-slate-400">Upload the roadmap image.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isRoadmapLoading ? (
            <div className="py-4"><Loader2 className="animate-spin text-slate-400 h-6 w-6 mx-auto" /></div>
          ) : isRError ? (
            <div className="py-4 text-red-500">Failed: {rError?.message}</div>
          ) : (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-4">
                {roadmapUrl ? (
                  <div className="relative w-60 h-36 rounded-xl overflow-hidden border border-slate-200">
                    <img src={resolveBackendMediaUrl(roadmapUrl)} alt="Roadmap" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-60 h-36 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    No image
                  </div>
                )}
                <div>
                  <input
                    ref={roadmapFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleRoadmapUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl cursor-pointer"
                    disabled={isUploadingR}
                    onClick={() => roadmapFileRef.current?.click()}
                  >
                    {isUploadingR ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-1" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    {roadmapUrl ? "Change" : "Upload"}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleRoadmapSave}
                  disabled={updateRoadmap.isPending}
                  className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl"
                >
                  {updateRoadmap.isPending ? "Saving..." : "Save Roadmap"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Milestone className="h-5 w-5 text-[#FF6B00]" />
              Milestones
            </CardTitle>
            <CardDescription className="text-slate-400">Manage milestone images and taglines.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search year..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl max-w-xs border-slate-200"
            />
            <Button onClick={openCreate} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isMsLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
            </div>
          ) : isMsError ? (
            <div className="py-12 text-center text-red-500">Failed: {msError?.message}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No milestones found.</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Tagline</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filtered.map((m: any) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filtered.map((m: any) => (
                      <SortableMilestoneRow
                        key={m.id}
                        item={m}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingMs ? "Edit Milestone" : "Add Milestone"}
            </DialogTitle>
          </DialogHeader>
          <MilestoneForm
            initialData={editingMs}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={createMilestone.isPending || updateMilestone.isPending}
            uploadImage={uploadImage}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableMilestoneRow({
  item,
  onEdit,
  onDelete,
}: {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[50px] text-center">
        <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded">
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-bold text-slate-900">{item.year_label}</TableCell>
      <TableCell className="text-slate-600">{item.tagline}</TableCell>
      <TableCell>
        {item.image_url ? (
          <img src={resolveBackendMediaUrl(item.image_url)} alt={item.year_label} className="h-10 w-16 object-cover rounded border" />
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        )}
      </TableCell>
      <TableCell className="text-center font-semibold text-slate-700">{item.display_order}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="cursor-pointer">
            <Edit2 className="h-4 w-4 text-slate-500 hover:text-[#FF6B00]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="cursor-pointer">
            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function MilestoneForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  uploadImage,
}: {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  uploadImage: any;
}) {
  const [yearLabel, setYearLabel] = useState(initialData?.year_label || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const prevInitialDataRef = useRef(initialData);
  if (initialData !== prevInitialDataRef.current) {
    prevInitialDataRef.current = initialData;
    if (initialData) {
      setYearLabel(initialData.year_label || "");
      setTagline(initialData.tagline || "");
      setImageUrl(initialData.image_url || "");
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadImage.mutateAsync({ entityType: "milestones", formData: fd });
      setImageUrl(result.image_url);
    } catch (err: any) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearLabel) {
      toast.error("Year label is required.");
      return;
    }
    onSubmit({ year_label: yearLabel, tagline, image_url: imageUrl || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Year *</Label>
        <Input required value={yearLabel} onChange={(e) => setYearLabel(e.target.value)} placeholder="2024-2025" className="rounded-xl border-slate-200" />
      </div>
      <div>
        <Label>Tagline</Label>
        <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Scale & Impact" className="rounded-xl border-slate-200" />
      </div>
      <div>
        <Label>Image</Label>
        <div className="flex items-center gap-4 mt-1">
          {imageUrl ? (
            <img src={resolveBackendMediaUrl(imageUrl)} alt="" className="h-16 w-24 object-cover rounded border" />
          ) : (
            <div className="h-16 w-24 rounded bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
              No image
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button type="button" variant="outline" size="sm" className="rounded-xl cursor-pointer" disabled={isUploading} onClick={() => fileRef.current?.click()}>
            {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload
          </Button>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
