"use client";

interface GoalCoverImageProps {
    src: string;
    alt: string;
}

export function GoalCoverImage({ src, alt }: GoalCoverImageProps) {
    return (
        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}
