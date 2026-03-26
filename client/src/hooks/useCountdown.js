import { useEffect, useState } from 'react';

const getTimeDiff = (targetDate) => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false };
};

const useCountdown = (unlockAt) => {
  const [state, setState] = useState(() => getTimeDiff(unlockAt));

  useEffect(() => {
    if (!unlockAt) return;

    const interval = setInterval(() => {
      setState(getTimeDiff(unlockAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockAt]);

  return state;
};

export default useCountdown;
