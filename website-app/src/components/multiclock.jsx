import React, { useEffect, useState } from "react";
import "../styles/main.css";

const timezones = [
  { name: "Manila", zone: "Asia/Manila" },
  { name: "Paris", zone: "Europe/Paris" },
  { name: "New York", zone: "America/New_York" },
  { name: "Tokyo", zone: "Asia/Tokyo" },
  { name: "Seoul", zone: "Asia/Seoul" },
  { name: "Hong Kong", zone: "Asia/Hong_Kong" },
];

function MultiClock() {
  const [times, setTimes] = useState({});

  useEffect(() => {
    const updateClocks = () => {
      const newTimes = {};
      const now = new Date();

      timezones.forEach(({ name, zone }) => {
        const localTime = new Date(
          now.toLocaleString("en-US", { timeZone: zone })
        );
        newTimes[name] = localTime;
      });

      setTimes(newTimes);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (num) => num.toString().padStart(2, "0");

  return (
    <section className="clock-section">
      <h2 className="clock-title">World Time</h2>
      <div className="clock-grid">
        {timezones.map(({ name }) => {
          const time = times[name] || new Date();
          let hours = time.getHours();
          const minutes = time.getMinutes();
          const ampm = hours >= 12 ? "PM" : "AM";

          hours = hours % 12;
          if (hours === 0) hours = 12; // 12-hour format

          const hourDeg = (time.getHours() % 12) * 30 + minutes * 0.5;
          const minuteDeg = minutes * 6;
          const secondDeg = time.getSeconds() * 6;

          return (
            <div key={name} className="analog-clock-box">
              <div className="clock-label">{name}</div>
              <div className="analog-clock">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="number"
                    style={{ transform: `rotate(${(i + 1) * 30}deg)` }}
                  >
                    <span style={{ transform: `rotate(-${(i + 1) * 30}deg)` }}>
                      {i + 1}
                    </span>
                  </div>
                ))}

                <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
                <div className="hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
                <div className="hand second" style={{ transform: `rotate(${secondDeg}deg)` }} />
                <div className="center-dot"></div>
              </div>

              {/* Digital Clock */}
              <div className="digital-clock">
                {pad(hours)}:{pad(minutes)} {ampm}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MultiClock;
