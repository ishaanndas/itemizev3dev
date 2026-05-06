import TopBar from "./TopBar";
import ReturnedTable from "./ReturnedTable";

export default function ReturnedContent() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Returned</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Documents returned for corrections — review notes, fix, and resubmit
              </p>
            </div>
          </div>

          <ReturnedTable />
        </div>
      </div>
    </div>
  );
}
