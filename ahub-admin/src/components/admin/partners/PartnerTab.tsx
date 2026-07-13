import { useState, useRef } from "react";
import { Plus, Loader2, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  useReorderPartners,
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

import { SortablePartnerRow } from "./PartnerList";
import { PartnerForm } from "./PartnerForm";

export function PartnerTab() {
  const { data: partners, isLoading } = usePartners();
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const deletePartner = useDeletePartner();
  const reorderPartners = useReorderPartners();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any | null>(null);
  const [localItems, setLocalItems] = useState<any[]>(partners || []);
  const prevPartnersRef = useRef(partners);
  if (partners && partners !== prevPartnersRef.current) {
    prevPartnersRef.current = partners;
    setLocalItems(partners);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openCreateDialog = () => {
    setEditingPartner(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (partner: any) => {
    setEditingPartner(partner);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingPartner) {
        await updatePartner.mutateAsync({ id: editingPartner.id, partnerData: formData });
        toast.success("Partner updated successfully!");
      } else {
        await createPartner.mutateAsync(formData);
        toast.success("Partner created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      await deletePartner.mutateAsync(id);
      toast.success("Partner deleted successfully!");
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
      await reorderPartners.mutateAsync(reorderPayload);
      toast.success("Partner order updated!");
    } catch (err: any) {
      toast.error("Failed to persist order in database.");
      if (partners) {
        setLocalItems(partners);
      }
    }
  };

  const filteredPartners = search
    ? localItems.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
    : localItems;

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Partners</CardTitle>
            <CardDescription className="text-slate-400">Manage partners showcase and reorder dynamically.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl max-w-xs border-slate-200"
            />
            <Button onClick={openCreateDialog} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add Partner
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Handshake className="h-10 w-10 text-slate-300" />
              <span>No partners found.</span>
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
                    <TableHead className="w-[80px]">Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filteredPartners.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredPartners.map((partner) => (
                      <SortablePartnerRow
                        key={partner.id}
                        partner={partner}
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
              {editingPartner ? "Edit Partner" : "Add Partner"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <PartnerForm
              initialData={editingPartner}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createPartner.isPending || updatePartner.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
