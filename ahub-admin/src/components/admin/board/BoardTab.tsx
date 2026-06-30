import { useState, useEffect } from "react";
import { Plus, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useBoardMembers,
  useCreateBoardMember,
  useUpdateBoardMember,
  useDeleteBoardMember,
  useReorderBoardMembers,
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

import { SortableBoardMemberRow } from "./BoardList";
import { BoardForm } from "./BoardForm";

export function BoardTab() {
  const { data: boardMembers, isLoading } = useBoardMembers();
  const createMember = useCreateBoardMember();
  const updateMember = useUpdateBoardMember();
  const deleteMember = useDeleteBoardMember();
  const reorderMembers = useReorderBoardMembers();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [localItems, setLocalItems] = useState<any[]>([]);

  // Keep local items synchronized with backend query result
  useEffect(() => {
    if (boardMembers) {
      setLocalItems(boardMembers);
    }
  }, [boardMembers]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openCreateDialog = () => {
    setEditingMember(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: any) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingMember) {
        await updateMember.mutateAsync({ id: editingMember.id, memberData: formData });
        toast.success("Board member updated successfully!");
      } else {
        await createMember.mutateAsync(formData);
        toast.success("Board member created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this board member?")) return;
    try {
      await deleteMember.mutateAsync(id);
      toast.success("Board member deleted successfully!");
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
    
    // Update local state immediately for smooth UI transition
    setLocalItems(reorderedList);

    // Prepare API reorder payload with new order indexes
    const reorderPayload = reorderedList.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    try {
      await reorderMembers.mutateAsync(reorderPayload);
      toast.success("Board order updated!");
    } catch (err: any) {
      toast.error("Failed to persist order in database.");
      // Rollback to original query state
      if (boardMembers) {
        setLocalItems(boardMembers);
      }
    }
  };

  const filteredMembers = search
    ? localItems.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()))
    : localItems;

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Board Members</CardTitle>
            <CardDescription className="text-slate-400">Manage Board of Governance showcase and reorder dynamically.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl max-w-xs border-slate-200"
            />
            <Button onClick={openCreateDialog} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Users className="h-10 w-10 text-slate-300" />
              <span>No board members found.</span>
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
                    <TableHead>Title</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filteredMembers.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredMembers.map((member) => (
                      <SortableBoardMemberRow
                        key={member.id}
                        member={member}
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
              {editingMember ? "Edit Board Member" : "Add Board Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <BoardForm
              initialData={editingMember}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createMember.isPending || updateMember.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
