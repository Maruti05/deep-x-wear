"use client";
import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export function ResponsiveCarouselWithDots({ items }: { items: string[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const length = items.length;

  // Track current slide
  useEffect(() => {
    if (!api) return;

    const update = () => setCurrent(api.selectedScrollSnap());
    update();
    api.on("select", update);

    return () => {
      api.off("select", update);
    };
  }, [api]);

  // Autoplay every 3s
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  const scrollTo = (idx: number) => api?.scrollTo(idx);

  return (
    <div className="w-full mx-auto relative">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((src, idx) => (
            <CarouselItem
              key={idx}
              className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
            >
              <img
                src={src}
                alt={`Slide ${idx + 1}`}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious />
        <CarouselNext /> */}
      </Carousel>

      {/* Dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`h-3 w-3 rounded-full transition-colors ${
              current === idx ? "bg-primary" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
