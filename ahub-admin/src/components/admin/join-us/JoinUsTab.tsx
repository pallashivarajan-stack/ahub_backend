import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useJoinUsConfig, useUpdateJoinUsConfig, useJoinUsSubmissions, useDeleteJoinUsSubmission } from "@/hooks/useCMS";
import { Plus, Trash2, GripVertical, Save, Download, Search, Eye, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensors, useSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const FORM_TYPES = [
  { value: "join_us", label: "Join Us Form" },
  { value: "incubation", label: "Incubation Registration" },
  { value: "pitch_to_us", label: "Pitch to Us" },
];

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select Dropdown" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
  { value: "file", label: "File Upload" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const EMPTY_FIELD = () => ({
  id: uid(),
  type: "text",
  label: "",
  placeholder: "",
  required: false,
  options: [] as string[],
  order: 0,
  accept: null as string | null,
});

export function JoinUsTab() {
  const location = useLocation();
  const routeFormType = useMemo(() => {
    if (location.pathname.includes("pitch-to-us")) return "pitch_to_us";
    return "join_us";
  }, [location.pathname]);
  const [activeFormType, setActiveFormType] = useState<string>(routeFormType);
  const [activeTab, setActiveTab] = useState<"builder" | "submissions">("builder");
  const { data: config, isLoading } = useJoinUsConfig(activeFormType);
  const updateConfig = useUpdateJoinUsConfig();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fields, setFields] = useState<any[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setActiveFormType(routeFormType);
    setDirty(false);
  }, [routeFormType]);

  useEffect(() => {
    if (config) {
      setTitle(config.title || "");
      setSubtitle(config.subtitle || "");
      setSubmitButtonText(config.submit_button_text || "Submit");
      setSuccessMessage(config.success_message || "");
      setFields(config.fields || []);
      setDirty(false);
    }
  }, [config]);

  const markDirty = useCallback(() => setDirty(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setFields(reordered.map((f, i) => ({ ...f, order: i })));
    markDirty();
  };

  const addField = () => {
    const newField = { ...EMPTY_FIELD(), id: uid(), order: fields.length };
    setFields([...fields, newField]);
    markDirty();
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i })));
    markDirty();
  };

  const updateField = (id: string, updates: Partial<any>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    markDirty();
  };

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        formType: activeFormType,
        configData: {
          title,
          subtitle,
          submit_button_text: submitButtonText,
          success_message: successMessage,
          fields: fields.map((f, i) => ({ ...f, order: i })),
        },
      });
      setDirty(false);
      toast.success("Form config saved");
    } catch {
      toast.error("Failed to save form config");
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-0">
        {FORM_TYPES.map((ft) => (
          <button
            key={ft.value}
            onClick={() => { setActiveFormType(ft.value); setDirty(false); }}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeFormType === ft.value
                ? "border-[#e75710] text-[#e75710]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {ft.label}
          </button>
        ))}
        <div className="flex-1" />
        {/* Sub-section tabs */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { key: "builder", label: "Form Builder" },
            { key: "submissions", label: "Submissions" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* LEFT: Field Builder */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Form Fields</h3>
              <button
                onClick={addField}
                className="flex items-center gap-1.5 rounded-lg bg-[#e75710] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#d04f0e] transition-colors"
              >
                <Plus size={14} /> Add Field
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-sm text-slate-400">
                <Plus size={32} className="mb-2 opacity-40" />
                No fields yet. Click "Add Field" to start building your form.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <SortableFieldRow
                        key={field.id}
                        field={field}
                        index={index}
                        onUpdate={(updates) => updateField(field.id, updates)}
                        onDelete={() => deleteField(field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {dirty && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={updateConfig.isPending}
                  className="flex items-center gap-2 rounded-lg bg-[#e75710] px-5 py-2 text-sm font-medium text-white hover:bg-[#d04f0e] transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  {updateConfig.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Form Settings */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-bold text-slate-900">Form Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); markDirty(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#e75710]/50 focus:ring-2 focus:ring-[#e75710]/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Subtitle</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => { setSubtitle(e.target.value); markDirty(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#e75710]/50 focus:ring-2 focus:ring-[#e75710]/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Submit Button Text</label>
                  <input
                    type="text"
                    value={submitButtonText}
                    onChange={(e) => { setSubmitButtonText(e.target.value); markDirty(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#e75710]/50 focus:ring-2 focus:ring-[#e75710]/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Success Message</label>
                  <input
                    type="text"
                    value={successMessage}
                    onChange={(e) => { setSuccessMessage(e.target.value); markDirty(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#e75710]/50 focus:ring-2 focus:ring-[#e75710]/10"
                  />
                </div>
              </div>
              {dirty && (
                <button
                  onClick={handleSave}
                  disabled={updateConfig.isPending}
                  className="mt-4 w-full rounded-lg bg-[#e75710] py-2 text-sm font-medium text-white hover:bg-[#d04f0e] transition-colors disabled:opacity-50"
                >
                  {updateConfig.isPending ? "Saving..." : "Save Settings"}
                </button>
              )}
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-bold text-slate-900">Preview</h3>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4">
                <div className="mb-3 text-center">
                  <div className="text-sm font-bold text-slate-900">{title || "Form Title"}</div>
                  {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
                </div>
                <div className="space-y-3">
                  {fields.slice(0, 4).map((f) => (
                    <div key={f.id}>
                      <label className="text-xs font-medium text-slate-700">
                        {f.label || "Field Label"}
                        {f.required && <span className="ml-0.5 text-red-500">*</span>}
                      </label>
                      <div className="mt-1 h-9 rounded-lg border border-slate-200 bg-white px-3 flex items-center text-xs text-slate-400">
                        {f.placeholder || "Placeholder"}
                      </div>
                    </div>
                  ))}
                  {fields.length > 4 && (
                    <div className="text-center text-xs text-slate-400">+{fields.length - 4} more fields</div>
                  )}
                </div>
                <div className="mt-4 w-full rounded-lg bg-[#e75710] py-2.5 text-center text-xs font-medium text-white">
                  {submitButtonText || "Submit"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <SubmissionsPanel formType={activeFormType} />
      )}
    </div>
  );
}

/* ── Sortable Field Row ─────────────────────────────────────── */

function SortableFieldRow({ field, index, onUpdate, onDelete }: {
  field: any;
  index: number;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const [expanded, setExpanded] = useState(false);
  const [optionsText, setOptionsText] = useState((field.options || []).join("\n"));

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const hasOptions = ["select", "radio", "checkbox"].includes(field.type);

  useEffect(() => {
    if (!expanded) {
      setOptionsText((field.options || []).join("\n"));
    }
  }, [expanded, field.options]);

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-300 hover:text-slate-500">
          <GripVertical size={16} />
        </button>
        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-500">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">{field.label || "Untitled Field"}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 uppercase">{field.type}</span>
            {field.required && <span className="text-[10px] font-medium text-red-500">Required</span>}
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-slate-400 hover:text-slate-600">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        <button onClick={onDelete} className="p-1 text-red-300 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-slate-500 uppercase">Field ID</label>
              <div className="mt-0.5 text-xs text-slate-700 font-mono">{field.id}</div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 uppercase">Type</label>
              <select
                value={field.type}
                onChange={(e) => onUpdate({ type: e.target.value, options: ["select", "radio", "checkbox"].includes(e.target.value) ? field.options || [] : undefined })}
                className="mt-0.5 w-full rounded-md border border-slate-200 px-2 py-1 text-xs outline-none"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="mt-0.5 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#e75710]/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase">Placeholder</label>
            <input
              type="text"
              value={field.placeholder}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="mt-0.5 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#e75710]/50"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-xs font-medium text-slate-600">Required field</span>
          </label>
          {hasOptions && (
            <div>
              <label className="text-[10px] font-medium text-slate-500 uppercase">Options (one per line)</label>
              <textarea
                rows={4}
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                onBlur={() => onUpdate({ options: optionsText.split("\n").filter((o) => o.trim()) })}
                className="mt-0.5 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none resize-none focus:border-[#e75710]/50"
              />
            </div>
          )}
          {field.type === "file" && (
            <div>
              <label className="text-[10px] font-medium text-slate-500 uppercase">Accept (MIME types)</label>
              <input
                type="text"
                value={field.accept || "image/*"}
                onChange={(e) => onUpdate({ accept: e.target.value })}
                placeholder="image/*"
                className="mt-0.5 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#e75710]/50"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Submissions Panel ──────────────────────────────────────── */

function SubmissionsPanel({ formType }: { formType: string }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const { data, isLoading, refetch } = useJoinUsSubmissions(formType, { search, status: statusFilter, page });
  const deleteSubmission = useDeleteJoinUsSubmission();

  const submissions = data?.submissions || [];
  const total = data?.total || 0;

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this submission?")) return;
    try {
      await deleteSubmission.mutateAsync(id);
      toast.success("Submission deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const exportCSV = () => {
    const url = `http://localhost:8000/api/admin/join-us/submissions/export/csv?form_type=${formType}`;
    window.open(url, "_blank");
  };

  const exportExcel = () => {
    const url = `http://localhost:8000/api/admin/join-us/submissions/export/excel?form_type=${formType}`;
    window.open(url, "_blank");
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#e75710]/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <RefreshCw size={14} /> Refresh
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <Download size={14} /> CSV
        </button>
        <button onClick={exportExcel} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <Download size={14} /> Excel
        </button>
        <div className="text-xs text-slate-400">{total} total</div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Phone</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Purpose</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">Loading...</td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No submissions found</td></tr>
              ) : (
                submissions.map((s: any, i: number) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400">{(page - 1) * 50 + i + 1}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{s.data?.name || s.data?.founder_name || "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{s.data?.email || "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{s.data?.phone || s.data?.contact || "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{s.data?.purpose || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        s.status === "new" ? "bg-blue-100 text-blue-700" :
                        s.status === "read" ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedSubmission(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded-lg p-1.5 text-red-300 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Submission Details</h3>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2">Metadata</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">ID:</span> {selectedSubmission.id}</div>
                  <div><span className="text-slate-500">Status:</span> {selectedSubmission.status}</div>
                  <div className="col-span-2"><span className="text-slate-500">Date:</span> {formatDate(selectedSubmission.created_at)}</div>
                  <div className="col-span-2"><span className="text-slate-500">IP:</span> {selectedSubmission.ip_address || "-"}</div>
                  <div className="col-span-2"><span className="text-slate-500">UA:</span> <span className="break-all">{selectedSubmission.user_agent || "-"}</span></div>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2">Form Data</div>
                <div className="space-y-2">
                  {Object.entries(selectedSubmission.data || {}).filter(([k]) => !k.startsWith("_")).map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-xs">
                      <span className="w-28 shrink-0 font-medium text-slate-600 capitalize">{key.replace(/_/g, " ")}:</span>
                      {typeof val === "string" && val.startsWith("data:image/") ? (
                        <img src={val} alt={key} className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                      ) : (
                        <span className="text-slate-800 break-all">{String(val || "-")}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
