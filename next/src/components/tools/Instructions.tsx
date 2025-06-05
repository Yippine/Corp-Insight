interface InstructionsProps {
  what: string;
  why: string;
  how: string;
}

export default function Instructions({ what, why, how }: InstructionsProps) {
  return (
    <div className="mb-6 space-y-3 rounded-lg bg-blue-50 p-4">
      <div>
        <h3 className="text-base font-medium text-blue-800">這是什麼？</h3>
        <p className="text-base text-blue-600">{what}</p>
      </div>
      <div>
        <h3 className="text-base font-medium text-blue-800">為什麼需要？</h3>
        <p className="text-base text-blue-600">{why}</p>
      </div>
      <div>
        <h3 className="text-base font-medium text-blue-800">如何使用？</h3>
        <p className="text-base text-blue-600">{how}</p>
      </div>
    </div>
  );
}
