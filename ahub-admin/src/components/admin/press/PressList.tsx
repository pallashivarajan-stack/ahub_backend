import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

interface PressItem {
  id: number;
  title: string;
  date: string;
  source: string;
  tag: string;
  url?: string;
  display_order: number;
}

interface SortableRowProps {
  pressItem: PressItem;
  onEdit: (item: PressItem) => void;
  onDelete: (id: number) => void;
}

export function SortablePressRow({ pressItem, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pressItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[50px] text-center">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-bold text-slate-900 max-w-[300px] truncate">
        {pressItem.title}
      </TableCell>
      <TableCell className="text-slate-600 whitespace-nowrap">
        {pressItem.date}
      </TableCell>
      <TableCell className="text-slate-600">
        {pressItem.source}
      </TableCell>
      <TableCell>
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {pressItem.tag}
        </span>
      </TableCell>
      <TableCell>
        {pressItem.url ? (
          <a
            href={pressItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-[#0A66C2] hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        )}
      </TableCell>
      <TableCell className="text-center font-semibold text-slate-700">{pressItem.display_order}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(pressItem)} className="cursor-pointer">
            <Edit2 className="h-4 w-4 text-slate-500 hover:text-[#FF6B00]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(pressItem.id)} className="cursor-pointer">
            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
