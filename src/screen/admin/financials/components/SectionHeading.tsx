import React from "react";

export function SectionHeading({
  icon,
  title,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-3 ${accent}`}
    >
      {icon}
      {title}
    </div>
  );
}
