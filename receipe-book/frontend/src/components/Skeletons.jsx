export const SkeletonCard = () => (
    <div className="card h-[400px] flex flex-col">
        <div className="skeleton h-64 w-full" />
        <div className="p-6 flex-1 space-y-4">
            <div className="skeleton h-8 w-3/4 rounded-lg" />
            <div className="flex gap-2">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
            </div>
            <div className="flex justify-between items-center pt-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
            </div>
        </div>
    </div>
);

export const SkeletonDetail = () => (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="skeleton h-96 w-full rounded-2xl mb-8" />
        <div className="space-y-6">
            <div className="skeleton h-12 w-2/3 rounded-xl" />
            <div className="flex gap-4">
                <div className="skeleton h-8 w-32 rounded-full" />
                <div className="skeleton h-8 w-32 rounded-full" />
                <div className="skeleton h-8 w-32 rounded-full" />
            </div>
            <div className="skeleton h-64 w-full rounded-2xl" />
            <div className="skeleton h-96 w-full rounded-2xl" />
        </div>
    </div>
);
