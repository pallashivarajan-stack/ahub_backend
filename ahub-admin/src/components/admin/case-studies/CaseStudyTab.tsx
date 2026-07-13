import { useState, useRef } from "react";
import { Plus, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useCaseStudies,
  useCreateCaseStudy,
  useUpdateCaseStudy,
  useDeleteCaseStudy,
  useReorderCaseStudies,
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

import { SortableCaseStudyRow } from "./CaseStudyList";
import { CaseStudyForm } from "./CaseStudyForm";

export function CaseStudyTab() {
  const { data: caseStudies, isLoading } = useCaseStudies();
  const createStudy = useCreateCaseStudy();
  const updateStudy = useUpdateCaseStudy();
  const deleteStudy = useDeleteCaseStudy();
  const reorderStudies = useReorderCaseStudies();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<any | null>(null);
  const [localItems, setLocalItems] = useState<any[]>(caseStudies || []);
  const prevCaseStudiesRef = useRef(caseStudies);
  if (caseStudies && caseStudies !== prevCaseStudiesRef.current) {
    prevCaseStudiesRef.current = caseStudies;
    setLocalItems(caseStudies);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openCreateDialog = () => {
    setEditingStudy(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (study: any) => {
    setEditingStudy(study);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingStudy) {
        await updateStudy.mutateAsync({ id: editingStudy.id, studyData: formData });
        toast.success("Case study updated successfully!");
      } else {
        await createStudy.mutateAsync(formData);
        toast.success("Case study created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    try {
      await deleteStudy.mutateAsync(id);
      toast.success("Case study deleted successfully!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localItems.findIndex((item) => item.id === active.id);
    const newIndex = localItems.findIndex((item) => item.id === over.id);

    const reorderedList = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(reorderedList);

    const reorderPayload = reorderedList.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    try {
      await reorderStudies.mutateAsync(reorderPayload);
      toast.success("Case study order updated!");
    } catch (err: any) {
      toast.error("Failed to persist order in database.");
      if (caseStudies) {
        setLocalItems(caseStudies);
      }
    }
  };

  const filteredStudies = search
    ? localItems.filter((s: any) => s.title.toLowerCase().includes(search.toLowerCase()))
    : localItems;

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Case Studies</CardTitle>
            <CardDescription className="text-slate-400">Manage case studies, reorder dynamically.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search case studies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl max-w-xs border-slate-200"
            />
            <Button onClick={openCreateDialog} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add Case Study
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
            </div>
          ) : filteredStudies.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <span>No case studies found.</span>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Visit Link</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filteredStudies.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredStudies.map((study) => (
                      <SortableCaseStudyRow
                        key={study.id}
                        study={study}
                        onEdit={openEditDialog}
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
        <DialogContent className="max-w-2xl rounded-3xl p-6 bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display text-slate-900">
              {editingStudy ? "Edit Case Study" : "Add Case Study"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CaseStudyForm
              initialData={editingStudy}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createStudy.isPending || updateStudy.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
