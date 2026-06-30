import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Edit2, Trash2, Building2, Star, Loader2, Upload, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useStartups,
  useCreateStartup,
  useUpdateStartup,
  useDeleteStartup,
  useReorderStartups,
  useUploadStartupImage,
} from "@/hooks/useCMS";
import { resolveBackendMediaUrl } from "@/lib/media";

/* ── Startup Sortable Row ── */
function StartupListRow({
  startup,
  onEdit,
  onDelete,
}: {
  startup: any;
  onEdit: (s: any) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: startup.id });
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
    >
      <td className="w-10 px-2">
        <button type="button" className="cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
      </td>
      <td className="py-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
          {startup.logo_url ? (
            <img src={resolveBackendMediaUrl(startup.logo_url)} alt={startup.name} className="h-7 w-7 object-contain" />
          ) : (
            <Building2 className="h-4 w-4 text-slate-300" />
          )}
        </div>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{startup.name}</span>
          {startup.featured && <Star size={12} className="fill-amber-400 text-amber-400" />}
        </div>
        <div className="text-xs text-slate-400">{startup.founder_name}</div>
      </td>
      <td className="py-3">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          {startup.industry || startup.category || "—"}
        </span>
      </td>
      <td className="py-3 text-center text-sm text-slate-500">{startup.display_order}</td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(startup)}>
            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(startup.id)}>
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ── Startup Form Dialog (inline) ── */
function StartupFormDialog({
  open,
  onOpenChange,
  editingStartup,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingStartup: any | null;
  onSaved: () => void;
}) {
  const createStartup = useCreateStartup();
  const updateStartup = useUpdateStartup();
  const uploadImage = useUploadStartupImage();
  const isPending = createStartup.isPending || updateStartup.isPending;

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [founderName, setFounderName] = useState("");
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [fundingStage, setFundingStage] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [popularity, setPopularity] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = (s: any | null) => {
    if (s) {
      setName(s.name || "");
      setShortDescription(s.short_description || "");
      setWebsiteUrl(s.website_url || "");
      setFounderName(s.founder_name || "");
      setCategory(s.category || "");
      setIndustry(s.industry || "");
      setFoundedYear(s.founded_year ? String(s.founded_year) : "");
      setFundingStage(s.funding_stage || "");
      setDisplayOrder(s.display_order || 0);
      setFeatured(s.featured || false);
      setPopularity(s.popularity || 0);
      setImageUrl(s.logo_url || null);
    } else {
      setName(""); setShortDescription(""); setWebsiteUrl(""); setFounderName("");
      setCategory(""); setIndustry(""); setFoundedYear(""); setFundingStage("");
      setDisplayOrder(0); setFeatured(false); setPopularity(0); setImageUrl(null);
    }
  };

  useEffect(() => { resetForm(editingStartup); }, [editingStartup]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage.mutateAsync(formData);
      setImageUrl(result.image_url);
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      short_description: shortDescription,
      logo_url: imageUrl,
      website_url: websiteUrl || null,
      founder_name: founderName,
      category: category || null,
      industry: industry || null,
      founded_year: foundedYear ? parseInt(foundedYear, 10) : null,
      funding_stage: fundingStage || null,
      display_order: displayOrder,
      featured,
      popularity,
    };
    try {
      if (editingStartup) {
        await updateStartup.mutateAsync({ id: editingStartup.id, startupData: data });
        toast.success("Startup updated!");
      } else {
        await createStartup.mutateAsync(data);
        toast.success("Startup created!");
      }
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="max-w-2xl rounded-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingStartup ? "Edit Startup" : "Add Startup"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Logo Image</Label>
            <div className="mt-1 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
                {imageUrl ? (
                  <img src={resolveBackendMediaUrl(imageUrl)} alt="Logo" className="h-12 w-12 object-contain" />
                ) : (
                  <Upload className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
                {isUploading && <Loader2 className="mt-1 h-4 w-4 animate-spin text-slate-400" />}
                {imageUrl && (
                  <p className="mt-1 text-[10px] text-slate-400 truncate">URL: {imageUrl}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Heading / Company Name *</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Startup name" />
            </div>
            <div>
              <Label>Visit Link / Website</Label>
              <Input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Founder Name</Label>
              <Input required value={founderName} onChange={(e) => setFounderName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. EdTech" />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Education" />
            </div>
            <div>
              <Label>Founded Year</Label>
              <Input type="number" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} placeholder="e.g. 2021" />
            </div>
            <div>
              <Label>Funding Stage</Label>
              <Input value={fundingStage} onChange={(e) => setFundingStage(e.target.value)} placeholder="e.g. Seed, Series A" />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Popularity</Label>
              <Input type="number" value={popularity} onChange={(e) => setPopularity(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <Switch checked={featured} onCheckedChange={setFeatured} />
                <Label>Featured (show in ticker)</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || isUploading} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Startup Portfolio Tab (combined) ── */
export function StartupPortfolioTab() {
  const { data: startups, isLoading: startupsLoading } = useStartups();
  const deleteStartup = useDeleteStartup();
  const reorderStartups = useReorderStartups();

  const startupList: any[] = startups ?? [];

  const [startupSearch, setStartupSearch] = useState("");
  const [isStartupDialog, setIsStartupDialog] = useState(false);
  const [editingStartup, setEditingStartup] = useState<any | null>(null);

  const handleStartupDelete = async (id: number) => {
    if (!confirm("Delete this startup?")) return;
    try { await deleteStartup.mutateAsync(id); toast.success("Startup deleted"); }
    catch (err: any) { toast.error(err.message); }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = startupList.findIndex((s) => s.id === active.id);
    const newIdx = startupList.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = [...startupList];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    try { await reorderStartups.mutateAsync(reordered.map((s, i) => ({ id: s.id, order: i }))); }
    catch { toast.error("Reorder failed"); }
  };

  const filteredStartups = startupSearch
    ? startupList.filter((s) => s.name?.toLowerCase().includes(startupSearch.toLowerCase()))
    : startupList;

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Startup Portfolio</CardTitle>
            <CardDescription className="text-slate-400">
              Manage startup portfolio entries. Toggle <strong>Featured</strong> to show logo in the frontend ticker. Drag rows to reorder.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search startups..." value={startupSearch} onChange={(e) => setStartupSearch(e.target.value)} className="rounded-xl max-w-[160px] border-slate-200" />
            <Button onClick={() => { setEditingStartup(null); setIsStartupDialog(true); }} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {startupsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredStartups.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead className="w-[60px]">Logo</TableHead>
                      <TableHead>Heading / Name</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead className="w-20 text-center">Order</TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStartups.length === 0 ? (
                      <TableRow><td colSpan={6} className="py-8 text-center text-sm text-slate-400">No start ups found.</td></TableRow>
                    ) : (
                      filteredStartups.map((s: any) => (
                        <StartupListRow key={s.id} startup={s} onEdit={(s) => { setEditingStartup(s); setIsStartupDialog(true); }} onDelete={handleStartupDelete} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <StartupFormDialog
        open={isStartupDialog}
        onOpenChange={setIsStartupDialog}
        editingStartup={editingStartup}
        onSaved={() => {}}
      />
    </div>
  );
}
