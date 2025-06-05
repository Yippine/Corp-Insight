import React from 'react';

interface HeroSectionProps {
  title: string;
  highlightText?: string;
  description: string;
  highlightColor?: string;
}

export default function HeroSection({
  title,
  highlightText,
  description,
  highlightColor = 'text-blue-600',
}: HeroSectionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4 py-12 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl sm:tracking-tight lg:text-6xl">
          {title}
          {highlightText && (
            <span className={highlightColor}>{highlightText}</span>
          )}
        </h1>
        <p className="mx-auto text-2xl text-gray-500">{description}</p>
      </div>
    </div>
  );
}
