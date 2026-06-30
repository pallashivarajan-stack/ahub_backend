import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { resolveBackendMediaUrl } from "@/lib/media";

interface Partner {
  id: number;
  name: string;
  description: string;
  logo_url?: string;
  website_url?: string;
  show_in_ticker: boolean;
  display_order: number;
}

interface SortableRowProps {
  partner: Partner;
  onEdit: (partner: Partner) => void;
  onDelete: (id: number) => void;
}

export function SortablePartnerRow({ partner, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: partner.id });

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
          {partner.logo_url ? (
            <img
              src={resolveBackendMediaUrl(partner.logo_url)}
              alt={partner.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-orange-100 flex items-center justify-center text-xs font-bold text-[#FF6B00]">
              {partner.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-bold text-slate-900">{partner.name}</TableCell>
      <TableCell className="text-slate-500 max-w-[250px] truncate">
        {partner.description}
      </TableCell>
      <TableCell>
        {partner.show_in_ticker ? (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Ticker
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-slate-200">
            No Ticker
          </span>
        )}
      </TableCell>
      <TableCell>
        {partner.website_url ? (
          <a
            href={partner.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        )}
      </TableCell>
      <TableCell className="text-center font-semibold text-slate-700">{partner.display_order}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(partner)} className="cursor-pointer">
            <Edit2 className="h-4 w-4 text-slate-500 hover:text-[#FF6B00]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(partner.id)} className="cursor-pointer">
            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
