interface SelectionSummaryBarProps {
  selectionDescription: string;
  loading: boolean;
  onGenerate: () => Promise<void> | void;
}

export const SelectionSummaryBar = ({
  selectionDescription,
  loading,
  onGenerate,
}: SelectionSummaryBarProps) => {
  return (
    <div className="mt-6 card p-4 bg-slate-800/50 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300 mb-1">Selected for card generation:</p>
          <p className="text-lg font-semibold text-sky-300">{selectionDescription}</p> {/* how many cards are selected from which sources */}
        </div>
        <button
          type="button"
          className="btn btn-primary w-full sm:w-auto"
          disabled={loading}
          onClick={onGenerate}
        >
          Generate Cards
        </button>
      </div>
    </div>
  );
};
