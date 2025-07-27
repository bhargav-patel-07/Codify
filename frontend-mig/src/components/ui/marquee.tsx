import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export interface FeedbackItem {
  id: string;
  email?: string;
  message: string;
  created_at: string;
}

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee (alternative to feedbackItems)
   */
  children?: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
  /**
   * Array of feedback items to display in the marquee
   */
  feedbackItems?: FeedbackItem[];
  /**
   * Maximum number of characters to show for each feedback message
   * @default 100
   */
  maxMessageLength?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  feedbackItems = [],
  maxMessageLength = 100,
  ...props
}: MarqueeProps) {
  // Format feedback items if provided
  const renderContent = () => {
    if (feedbackItems && feedbackItems.length > 0) {
      return feedbackItems.map((item) => (
        <div 
          key={item.id} 
          className="flex flex-col bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 min-w-[300px] mx-2"
        >
          <p className="text-sm text-gray-300 mb-2 line-clamp-3">
            {item.message.length > maxMessageLength 
              ? `${item.message.substring(0, maxMessageLength)}...` 
              : item.message}
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>{item.email || 'Anonymous'}</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ));
    }
    return children;
  };

  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {renderContent()}
          </div>
        ))}
    </div>
  );
}
