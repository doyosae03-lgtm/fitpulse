import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Bell, BellOff } from 'lucide-react';
import { playCountdownTick, playTimerFinishChime } from '../utils/audio';

interface RestTimerProps {
  soundEnabled: boolean;
  onToggleSound?: () => void;
}

export function RestTimer({ soundEnabled, onToggleSound }: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState<number>(90);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setRemainingSeconds((prev) => {
          const next = prev - 1;
          if (soundEnabled && next <= 3 && next > 0) {
            playCountdownTick();
          }
          if (next === 0) {
            if (soundEnabled) {
              playTimerFinishChime();
            }
            setIsRunning(false);
          }
          return next;
        });
      }, 1000);
    } else if (remainingSeconds <= 0 && isRunning) {
      setIsRunning(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, remainingSeconds, soundEnabled]);

  const handleStartPause = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = (newTotal?: number) => {
    setIsRunning(false);
    const target = newTotal !== undefined ? newTotal : totalSeconds;
    setTotalSeconds(target);
    setRemainingSeconds(target);
  };

  const handleAddSeconds = (seconds: number) => {
    setRemainingSeconds((prev) => prev + seconds);
    setTotalSeconds((prev) => Math.max(prev, remainingSeconds + seconds));
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background progress bar glow */}
      <div
        className="absolute top-0 left-0 bottom-0 bg-[#ccff00]/10 transition-all duration-300 pointer-events-none"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            세트 간 휴식 타이머 (Rest Timer)
          </span>
          {remainingSeconds === 0 && (
            <span className="text-xs font-bold text-[#ccff00] animate-pulse">
              휴식 완료! 다음 세트 시작
            </span>
          )}
        </div>
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            {soundEnabled ? <Bell className="w-4 h-4 text-[#ccff00]" /> : <BellOff className="w-4 h-4 text-slate-500" />}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        {/* Big Digital Display */}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-mono tabular-nums text-4xl sm:text-5xl font-extrabold tracking-tight transition-colors ${
              remainingSeconds <= 5 && remainingSeconds > 0
                ? 'text-[#ff5555] animate-pulse'
                : remainingSeconds === 0
                ? 'text-[#ccff00]'
                : 'text-white'
            }`}
          >
            {formattedTime}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            / {Math.floor(totalSeconds / 60)}분 {totalSeconds % 60 ? `${totalSeconds % 60}초` : ''}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartPause}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-[#ccff00] text-slate-950 hover:bg-[#b8e600] font-bold'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> 일시정지
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> {remainingSeconds === 0 ? '다시 시작' : '휴식 시작'}
              </>
            )}
          </button>

          <button
            onClick={() => handleReset()}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            title="타이머 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddSeconds(30)}
            className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
            title="30초 추가"
          >
            <Plus className="w-3.5 h-3.5" /> 30초
          </button>
        </div>
      </div>

      {/* Preset time quick buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 relative z-10 text-xs text-slate-400">
        <span className="text-[11px] text-slate-400 mr-1">추천 간격:</span>
        {[
          { label: '45초 (짧은 휴식)', sec: 45 },
          { label: '60초 (표준)', sec: 60 },
          { label: '90초 (근비대)', sec: 90 },
          { label: '120초 (고중량)', sec: 120 },
          { label: '180초 (3분 파워)', sec: 180 },
        ].map((preset) => (
          <button
            key={preset.sec}
            onClick={() => handleReset(preset.sec)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              totalSeconds === preset.sec
                ? 'bg-slate-700 text-[#ccff00] border border-[#ccff00]/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
