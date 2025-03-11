import { InlineLoading } from '@/components/common/loading/LoadingTypes';

export default function SearchLoading() {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center">
      <InlineLoading />
    </div>
  );
}