import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { resolveBackendMediaUrl } from "@/lib/media";

interface BoardMember {
  id: number;
  name: string;
  title: string;
  bio: string;
  image_url?: string;
  linked_in?: string;
  display_order: number;
}

interface SortableRowProps {
  member: BoardMember;
  onEdit: (member: BoardMember) => void;
  onDelete: (id: number) => void;
}

export function SortableBoardMemberRow({ member, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

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
      <TableCell className="w-[80px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border overflow-hidden">
          {member.image_url ? (
            <img
              src={resolveBackendMediaUrl(member.image_url)}
              alt={member.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-orange-100 flex items-center justify-center text-xs font-bold text-[#FF6B00]">
              {member.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-bold text-slate-900">{member.name}</TableCell>
      <TableCell className="text-slate-600">{member.title}</TableCell>
      <TableCell>
        {member.linked_in ? (
          <a
            href={member.linked_in}
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
      <TableCell className="text-center font-semibold text-slate-700">{member.display_order}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(member)} className="cursor-pointer">
            <Edit2 className="h-4 w-4 text-slate-500 hover:text-[#FF6B00]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(member.id)} className="cursor-pointer">
            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
