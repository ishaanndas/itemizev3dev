import { Check, ChevronDown, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  align?: "start" | "end" | "center";
}

export default function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon,
  align = "end",
}: FilterDropdownProps) {
  const isDefault = value === options[0];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-1.5 text-sm border rounded-lg px-3 py-1.5 transition-colors ${
            isDefault
              ? "border-border bg-card hover:bg-secondary text-foreground"
              : "border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10"
          }`}
        >
          {icon ?? <Filter className="h-3.5 w-3.5" />}
          <span>
            {label}
            {!isDefault && <span className="text-muted-foreground">: </span>}
            {!isDefault && <span className="font-medium">{value}</span>}
          </span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} sideOffset={6} className="w-[220px] p-1.5">
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onChange(o)}
              className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-secondary text-left text-sm text-foreground/90"
            >
              <span className="truncate">{o}</span>
              {o === value && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
