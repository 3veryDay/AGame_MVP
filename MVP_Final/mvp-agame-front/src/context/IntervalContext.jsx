
// src/context/IntervalContext.jsx
import { createContext, useContext, useState } from 'react';

const IntervalContext = createContext();

export const useInterval = () => useContext(IntervalContext);

export const IntervalProvider = ({ children }) => {
  const [pattern, setPattern] = useState([]); // [{ duration: 2 }, { duration: 3 }, ...]
  const [repeatCount, setRepeatCount] = useState(1);
  const [details, setDetails] = useState([]); // [ { duration: 2, speed: 6, type: "WALK", music: "soft_pop" }, ... ]

  return (
    <IntervalContext.Provider
      value={{ pattern, setPattern, repeatCount, setRepeatCount, details, setDetails }}
    >
      {children}
    </IntervalContext.Provider>
  );
};
