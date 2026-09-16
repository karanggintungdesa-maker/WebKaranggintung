import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-4 sm:mb-8 md:mb-10 space-y-1.5 sm:space-y-3", className)}>
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1 sm:w-1.5 h-6 sm:h-9 bg-accent rounded-full shrink-0" />
          <h1 className="text-xl min-[380px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight text-slate-900 uppercase leading-snug">
            {title}
          </h1>
        </div>
      </div>
      {description && (
        <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium pl-2.5 sm:pl-4 leading-relaxed max-w-3xl border-l-2 border-slate-200">
          {description}
        </p>
      )}
    </div>
  );
}
