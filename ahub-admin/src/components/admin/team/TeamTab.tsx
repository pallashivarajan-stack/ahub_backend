import { useState, useRef } from "react";
import { Plus, Loader2, Users, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useTeamMembers,
  useTeamPage,
  useUpdateTeamPage,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useReorderTeamMembers,
} from "@/hooks/useCMS";
import { TeamPageForm } from "./TeamPageForm";

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

import { SortableTeamMemberRow } from "./TeamList";
import { TeamForm } from "./TeamForm";

export function TeamTab() {
  const { data: teamMembers, isLoading } = useTeamMembers();
  const { data: teamPageData, isLoading: isPageLoading } = useTeamPage();
  const updateTeamPage = useUpdateTeamPage();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();
  const reorderMembers = useReorderTeamMembers();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPageOpen, setIsPageOpen] = useState(true);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [localItems, setLocalItems] = useState<any[]>(teamMembers || []);
  const prevTeamMembersRef = useRef(teamMembers);
  if (teamMembers && teamMembers !== prevTeamMembersRef.current) {
    prevTeamMembersRef.current = teamMembers;
    setLocalItems(teamMembers);
  }

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
        toast.success("Team member updated successfully!");
      } else {
        await createMember.mutateAsync(formData);
        toast.success("Team member created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      await deleteMember.mutateAsync(id);
      toast.success("Team member deleted successfully!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleTeamPageSubmit = async (formData: any) => {
    try {
      await updateTeamPage.mutateAsync(formData);
      toast.success("Team page settings updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
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
      await reorderMembers.mutateAsync(reorderPayload);
      toast.success("Team order updated!");
    } catch (err: any) {
      toast.error("Failed to persist order in database.");
      if (teamMembers) {
        setLocalItems(teamMembers);
      }
    }
  };

  const filteredMembers = search
    ? localItems.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()))
    : localItems;

  return (
    <div className="space-y-6">
      <Collapsible open={isPageOpen} onOpenChange={setIsPageOpen}>
        <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#FF6B00]" />
                Team Page Settings
              </CardTitle>
              <CardDescription className="text-slate-400">Group photo, title, subtitle, and description for the team page.</CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl cursor-pointer">
                {isPageOpen ? "Collapse" : "Expand"}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-6">
              {isPageLoading ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="animate-spin text-slate-400 h-6 w-6" />
                </div>
              ) : (
                <TeamPageForm
                  initialData={teamPageData}
                  onSubmit={handleTeamPageSubmit}
                  isSubmitting={updateTeamPage.isPending}
                />
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Team Members</CardTitle>
            <CardDescription className="text-slate-400">Manage team showcase and reorder dynamically.</CardDescription>
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
              <span>No team members found.</span>
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
                    <TableHead>Tagline</TableHead>
                    <TableHead>Link</TableHead>
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
                      <SortableTeamMemberRow
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
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <TeamForm
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
