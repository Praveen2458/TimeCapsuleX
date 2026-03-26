import useCountdown from '../hooks/useCountdown.js';

const CountdownTimer = ({ unlockAt }) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(unlockAt);

  if (!unlockAt) return null;

  if (isExpired) {
    return <p className="text-green-400">Unlocked</p>;
  }

  return (
    <div className="flex gap-4 text-center text-sm">
      {[{ label: 'Days', value: days }, { label: 'Hours', value: hours }, { label: 'Minutes', value: minutes }, { label: 'Seconds', value: seconds }].map((item) => (
        <div key={item.label} className="rounded-md bg-slate-900 px-3 py-2 shadow-sm shadow-slate-900/80">
          <div className="text-xl font-semibold tabular-nums">{item.value.toString().padStart(2, '0')}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
