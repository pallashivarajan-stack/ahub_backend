import { useState, useRef } from "react";
import { Plus, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useMentors,
  useCreateMentor,
  useUpdateMentor,
  useDeleteMentor,
  useReorderMentors,
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

import { SortableMentorRow } from "./MentorList";
import { MentorForm } from "./MentorForm";

export function MentorTab() {
  const { data: mentors, isLoading } = useMentors();
  const createMentor = useCreateMentor();
  const updateMentor = useUpdateMentor();
  const deleteMentor = useDeleteMentor();
  const reorderMentors = useReorderMentors();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [localItems, setLocalItems] = useState<any[]>(mentors || []);
  const prevMentorsRef = useRef(mentors);
  if (mentors && mentors !== prevMentorsRef.current) {
    prevMentorsRef.current = mentors;
    setLocalItems(mentors);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openCreateDialog = () => {
    setEditingMentor(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (mentor: any) => {
    setEditingMentor(mentor);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingMentor) {
        await updateMentor.mutateAsync({ id: editingMentor.id, mentorData: formData });
        toast.success("Mentor updated successfully!");
      } else {
        await createMentor.mutateAsync(formData);
        toast.success("Mentor created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;
    try {
      await deleteMentor.mutateAsync(id);
      toast.success("Mentor deleted successfully!");
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
      await reorderMentors.mutateAsync(reorderPayload);
      toast.success("Mentor order updated!");
    } catch (err: any) {
      toast.error("Failed to persist order in database.");
      if (mentors) {
        setLocalItems(mentors);
      }
    }
  };

  const filteredMentors = search
    ? localItems.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()))
    : localItems;

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Mentors</CardTitle>
            <CardDescription className="text-slate-400">Manage mentor showcase and reorder dynamically.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search mentors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl max-w-xs border-slate-200"
            />
            <Button onClick={openCreateDialog} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add Mentor
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <GraduationCap className="h-10 w-10 text-slate-300" />
              <span>No mentors found.</span>
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
                    <TableHead className="w-[80px]">Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Title / Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filteredMentors.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredMentors.map((mentor) => (
                      <SortableMentorRow
                        key={mentor.id}
                        mentor={mentor}
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
              {editingMentor ? "Edit Mentor" : "Add Mentor"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <MentorForm
              initialData={editingMentor}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createMentor.isPending || updateMentor.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
