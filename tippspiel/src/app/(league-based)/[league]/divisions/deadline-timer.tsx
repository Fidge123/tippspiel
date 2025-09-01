"use client";

import { useEffect, useState } from "react";

export default function DeadlineTimer({ deadline }: DeadlineTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const calculateTimeLeft = () => {
      const deadlineTime = deadline.getTime();
      const difference = deadlineTime - Date.now();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadline, isClient]);

  // Prevent hydration mismatch by not rendering timer on server
  if (!isClient) {
    return (
      <div>
        <p className="text-sm">Lade Countdown...</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[...Array(4)]
            .map((_, i) => i)
            .map((i) => (
              <div key={i} className="rounded px-2">
                <div className="font-bold">--</div>
                <div className="text-xs">
                  {["Tage", "Std", "Min", "Sek"][i]}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <p className="font-semibold text-red-700 text-sm">Deadline verstrichen</p>
    );
  }

  const formatDeadline = () => {
    const deadlineDate = new Date(deadline);
    return `${deadlineDate.toLocaleString("de-DE", {
      month: "2-digit",
      day: "2-digit",
    })} um ${deadlineDate.toLocaleString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div>
      <p className="text-sm">
        Deadline: <span className="text-yellow-700">{formatDeadline()}</span>
      </p>
      <div className="grid grid-cols-4 gap-2 text-center *:rounded *:px-2">
        <div>
          <div className="font-bold">{timeLeft.days}</div>
          <div className="text-xs">Tage</div>
        </div>
        <div>
          <div className="font-bold">{timeLeft.hours}</div>
          <div className="text-xs">Std</div>
        </div>
        <div>
          <div className="font-bold">{timeLeft.minutes}</div>
          <div className="text-xs">Min</div>
        </div>
        <div>
          <div className="font-bold">{timeLeft.seconds}</div>
          <div className="text-xs">Sek</div>
        </div>
      </div>
    </div>
  );
}

interface DeadlineTimerProps {
  deadline: Date;
}
