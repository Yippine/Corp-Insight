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
    <div className="bg-white py-12 rounded-lg shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          {title}{' '}
          {highlightText && (
            <span className={highlightColor}>{highlightText}</span>
          )}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}