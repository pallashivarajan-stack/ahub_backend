import { useState, useEffect } from "react";
import { Plus, Loader2, Newspaper, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  usePress,
  usePressPage,
  useUpdatePressPage,
  useCreatePressItem,
  useUpdatePressItem,
  useDeletePressItem,
  useReorderPress,
} from "@/hooks/useCMS";
import { PressPageForm } from "./PressPageForm";

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

import { SortablePressRow } from "./PressList";
import { PressForm } from "./PressForm";

export function PressTab() {
  const { data: pressItems, isLoading } = usePress();
  const { data: pressPageData, isLoading: isPageLoading } = usePressPage();
  const updatePressPage = useUpdatePressPage();
  const createItem = useCreatePressItem();
  const updateItem = useUpdatePressItem();
  const deleteItem = useDeletePressItem();
  const reorderItems = useReorderPress();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPageOpen, setIsPageOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [localItems, setLocalItems] = useState<any[]>([]);

  useEffect(() => {
    if (pressItems) {
      setLocalItems(pressItems);
    }
  }, [pressItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openCreateDialog = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, itemData: formData });
        toast.success("Press item updated successfully!");
      } else {
        await createItem.mutateAsync(formData);
        toast.success("Press item created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this press item?")) return;
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Press item deleted successfully!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePressPageSubmit = async (formData: any) => {
    try {
      await updatePressPage.mutateAsync(formData);
      toast.success("Press page settings updated successfully!");
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
      await reorderItems.mutateAsync(reorderPayload);
      toast.success("Press order updated!");
    } catch (err: any) {
      toast.error("Failed to persist order in database.");
      if (pressItems) {
        setLocalItems(pressItems);
      }
    }
  };

  const filteredItems = search
    ? localItems.filter((item: any) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    : localItems;

  return (
    <div className="space-y-6">
      <Collapsible open={isPageOpen} onOpenChange={setIsPageOpen}>
        <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#FF6B00]" />
                Press Page Settings
              </CardTitle>
              <CardDescription className="text-slate-400">Heading and subheading for the press page.</CardDescription>
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
                <PressPageForm
                  initialData={pressPageData}
                  onSubmit={handlePressPageSubmit}
                  isSubmitting={updatePressPage.isPending}
                />
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900">Press Items</CardTitle>
            <CardDescription className="text-slate-400">Manage press coverage and reorder dynamically.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search press..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl max-w-xs border-slate-200"
            />
            <Button onClick={openCreateDialog} className="bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-xl cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add Press
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Newspaper className="h-10 w-10 text-slate-300" />
              <span>No press items found.</span>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filteredItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredItems.map((item) => (
                      <SortablePressRow
                        key={item.id}
                        pressItem={item}
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
              {editingItem ? "Edit Press Item" : "Add Press Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <PressForm
              initialData={editingItem}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createItem.isPending || updateItem.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
