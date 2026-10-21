import type { AppProps } from "next/app";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
export default function BrandStory() {
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const scrollReviews = (direction: "left" | "right") => {
    if (reviewsRef.current) {
      const scrollAmount = 320;
      const newScrollLeft =
        reviewsRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);

      reviewsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleVideoPlay = (index: number) => {
    setActiveVideo(index);
    setActiveStep(index);
    // Pause other videos when one plays
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  const handleVideoClick = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  };

  // Video lazy loading and intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.setAttribute("data-visible", "true");
            // Load video when it comes into view
            video.load();
          } else {
            // Pause and reset video when out of view
            if (!video.paused) {
              video.pause();
            }
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.3 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  const processSteps = [
    {
      title: "Warehouse",
      description: "Where every pair finds its purpose",
      video: "warehouse.mp4", // Use absolute paths
      poster: "/images/warehouse-poster.jpg",
      icon: "🏭",
    },
    {
      title: "Careful Packing",
      description: "Prepared with attention to detail",
      video: "packing.mp4",
      poster: "/images/packing-poster.jpg",
      icon: "📦",
    },
    {
      title: "On Its Way",
      description: "Beginning the journey to you",
      video: "dispatching.mp4",
      poster: "/images/dispatching-poster.jpg",
      icon: "🚚",
    },
  ];
  return (
    <div className="container mx-auto px-4 pt-2 flex-1">
      {/* Story Section */}
      <section className="my-16 md:my-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-1 bg-gradient-to-r from-gray-300 to-gray-100 mx-auto mb-8 rounded-full"></div>
          <h2 className="text-lg md:text-4xl font-bold text-primary  text-gray-900">
            Footex 
          </h2>
          <div className="space-y-4 text-gray-600">
            
            <div className="flex justify-center items-center gap-6 pt-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span> Style</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span> Quality</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Comfort</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="my-16 md:my-24">
        {/* Desktop Connecting Line */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4/5 max-w-4xl">
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(activeStep + 1) * 33.33}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-500 shadow-lg"></div>
            </div>

            {/* Step markers */}
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  activeStep >= index
                    ? "bg-blue-500 text-white border-blue-500 scale-110 shadow-lg"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
                style={{
                  left: `${(index + 1) * 33.33}%`,
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto relative z-10 pt-8 md:pt-0">
          {processSteps.map((item, index) => (
            <div
              key={index}
              className="text-center space-y-6 group cursor-pointer"
              onClick={() => handleVideoClick(index)}
              onMouseEnter={() => setActiveStep(index)}
            >
              {/* Step Header */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    activeStep >= index
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
                      : "bg-gray-100 text-gray-400 shadow-md"
                  }`}
                >
                  {item.icon}
                </div>

                <div className="space-y-2">
                  <h3
                    className={`text-xl font-semibold transition-colors duration-300 ${
                      activeStep >= index ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Video Container */}
              <div className="relative aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-200">
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  onPlay={() => handleVideoPlay(index)}
                  onPause={() =>
                    setActiveVideo(activeVideo === index ? null : activeVideo)
                  }
                >
                  <source src={item.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Play/Pause Overlay */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black transition-all duration-300 ${
                    activeVideo === index ? "bg-opacity-0" : "bg-opacity-20"
                  } group-hover:bg-opacity-10`}
                >
                  <div
                    className={`flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-2xl transition-all duration-300 ${
                      activeVideo === index
                        ? "opacity-0 scale-0"
                        : "opacity-100 scale-100"
                    } group-hover:scale-110`}
                  >
                    {activeVideo === index ? (
                      <span className="text-2xl">⏸️</span>
                    ) : (
                      <span className="text-2xl ml-1">▶️</span>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 opacity-0 transition-opacity duration-300">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Progress */}
        {/* <div className="md:hidden flex justify-center gap-3 mt-8">
          {processSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-8 h-2 rounded-full transition-all duration-300 ${
                activeStep === index ? "bg-blue-500 w-12" : "bg-gray-300"
              }`}
            />
          ))}
        </div> */}
      </section>

      {/* Reviews Section */}
      <section className="my-16 md:my-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
            Loved by Thousands
          </h2>
          <p className="text-gray-600">Join our community of happy walkers</p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollReviews("left")}
              className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white shadow-lg border border-gray-200 rounded-full transition-all duration-300 opacity-100 md:opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
              aria-label="Scroll reviews left"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Reviews Container */}
            <div
              ref={reviewsRef}
              className="flex gap-4 md:gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <div key={num} className="flex-shrink-0 snap-start">
                  <div className="w-64 md:w-80 aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <img
                      src={`${num}.jpg`}
                      alt={`Customer review ${num}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `${num}.jpg`;
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollReviews("right")}
              className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white shadow-lg border border-gray-200 rounded-full transition-all duration-300 opacity-100 md:opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
              aria-label="Scroll reviews right"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3,4,5,6,7,8,9,10,11,12,13].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 rounded-full bg-gray-300 transition-all duration-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="my-16 md:my-24 text-center">
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl md:text-3xl font-light text-gray-900">Ready to Walk Better?</h2>
      <p className="text-gray-600">
        Experience the Footex difference - quality, comfort, and style in every step.
      </p>
      <Link href="/offer" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
        View Offer
      </Link>
    </div>
  </section> */}
    </div>
  );
}
