import { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  Flame,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Trophy,
} from 'lucide-react';
import { ActiveWorkout, Exercise } from '../types/fitness';
import { EXERCISE_LIBRARY } from '../data/fitnessData';
import { RestTimer } from './RestTimer';

interface ActiveWorkoutTrackerProps {
  activeWorkout: ActiveWorkout | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleSet: (exerciseIdx: number, setIdx: number) => void;
  onUpdateSet: (exerciseIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) => void;
  onAddSet: (exerciseIdx: number) => void;
  onRemoveSet: (exerciseIdx: number, setIdx: number) => void;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise: (exerciseIdx: number) => void;
  onFinishWorkout: () => void;
  onCancelWorkout: () => void;
  onGoToRoutines: () => void;
  onStartBlank: () => void;
}

export function ActiveWorkoutTracker({
  activeWorkout,
  soundEnabled,
  onToggleSound,
  onToggleSet,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onAddExercise,
  onRemoveExercise,
  onFinishWorkout,
  onCancelWorkout,
  onGoToRoutines,
  onStartBlank,
}: ActiveWorkoutTrackerProps) {
  // Elapsed time state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});
  const [isAddExModalOpen, setIsAddExModalOpen] = useState(false);
  const [searchEx, setSearchEx] = useState('');

  useEffect(() => {
    if (!activeWorkout) return;

    // Calculate initial elapsed from start time
    const calc = () => Math.floor((Date.now() - activeWorkout.startTime) / 1000);
    setElapsedSeconds(calc());

    const timer = setInterval(() => {
      setElapsedSeconds(calc());
    }, 1000);

    return () => clearInterval(timer);
  }, [activeWorkout]);

  if (!activeWorkout) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-[#ccff00]">
          <Dumbbell className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">진행 중인 운동이 없습니다</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            루틴 탭에서 원하는 분할 운동을 선택하거나, 지금 바로 자유 세션을 시작하여 운동 기록을 쌓아보세요!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGoToRoutines}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ccff00] text-slate-950 font-bold text-xs sm:text-sm hover:bg-[#b8e600] active:scale-95 transition-all shadow-md"
          >
            루틴 목록에서 선택하기
          </button>
          <button
            onClick={onStartBlank}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold text-xs sm:text-sm hover:bg-slate-700 active:scale-95 transition-all border border-slate-700"
          >
            자유 운동 즉시 시작
          </button>
        </div>
      </div>
    );
  }

  // Calculate live workout volume & completed sets
  let liveVolume = 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;

  activeWorkout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      totalSetsCount += 1;
      if (set.completed) {
        completedSetsCount += 1;
        liveVolume += set.weightKg * set.reps;
      }
    });
  });

  const elapsedMin = Math.floor(elapsedSeconds / 60);
  const elapsedSec = elapsedSeconds % 60;
  const formattedDuration = `${String(elapsedMin).padStart(2, '0')}:${String(elapsedSec).padStart(2, '0')}`;

  const toggleTip = (exId: string) => {
    setExpandedTips((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const filteredExLibrary = EXERCISE_LIBRARY.filter(
    (e) =>
      e.name.toLowerCase().includes(searchEx.toLowerCase()) ||
      e.targetMuscle.includes(searchEx) ||
      e.equipment.includes(searchEx)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Routine Info & Live Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
              <span className="text-xs font-mono uppercase text-[#ccff00] tracking-wider font-semibold">
                운동 진행 중 (Active Workout)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">{activeWorkout.routineName}</h2>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00f0ff]" /> 경과 시간
              </div>
              <div className="font-mono text-base font-bold text-white tabular-nums">{formattedDuration}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-[#ccff00]" /> 완료 세트
              </div>
              <div className="font-mono text-base font-bold text-white tabular-nums">
                <span className="text-[#ccff00]">{completedSetsCount}</span> / {totalSetsCount}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> 총 볼륨
              </div>
              <div className="font-mono text-base font-bold text-white tabular-nums">
                {liveVolume.toLocaleString()} <span className="text-xs text-slate-400">kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest Timer Panel */}
      <RestTimer soundEnabled={soundEnabled} onToggleSound={onToggleSound} />

      {/* Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            운동 종목별 세트 기록 ({activeWorkout.exercises.length}종목)
          </h3>
          <button
            onClick={() => setIsAddExModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#ccff00]" /> 종목 추가
          </button>
        </div>

        {activeWorkout.exercises.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <p className="text-xs text-slate-400">운동 종목이 비어 있습니다. 위 '종목 추가' 버튼을 눌러 운동을 추가하세요.</p>
            <button
              onClick={() => setIsAddExModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#ccff00] text-slate-950 font-bold text-xs"
            >
              운동 종목 선택하기
            </button>
          </div>
        ) : (
          activeWorkout.exercises.map((ex, exIdx) => {
            const exDef = EXERCISE_LIBRARY.find((e) => e.id === ex.exerciseId);
            const isTipOpen = expandedTips[ex.exerciseId];

            return (
              <div
                key={ex.exerciseId + '_' + exIdx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md"
              >
                {/* Exercise Header */}
                <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-[#ccff00] font-mono text-xs font-bold flex items-center justify-center">
                      {exIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                        <span className="text-[11px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                          {ex.targetMuscle}
                        </span>
                      </div>
                      {exDef && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{exDef.equipment}</span>
                          <button
                            type="button"
                            onClick={() => toggleTip(ex.exerciseId)}
                            className="text-[#00f0ff] hover:underline flex items-center gap-0.5"
                          >
                            <Info className="w-3 h-3" />
                            {isTipOpen ? '운동 팁 닫기' : '운동 팁 보기'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveExercise(exIdx)}
                    className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                    title="종목 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Exercise Tip Accordion */}
                {isTipOpen && exDef && (
                  <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                    <div className="text-[#00f0ff] mt-0.5 shrink-0">💡</div>
                    <div>{exDef.guideTip}</div>
                  </div>
                )}

                {/* Sets Table */}
                <div className="p-3 sm:p-4">
                  {/* Table Headers */}
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 text-center">
                    <div className="col-span-2 text-left">세트</div>
                    <div className="col-span-4">무게 (kg)</div>
                    <div className="col-span-4">횟수 (Reps)</div>
                    <div className="col-span-2">완료</div>
                  </div>

                  {/* Set Rows */}
                  <div className="space-y-2">
                    {ex.sets.map((set, setIdx) => (
                      <div
                        key={setIdx}
                        className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-all border ${
                          set.completed
                            ? 'bg-[#ccff00]/5 border-[#ccff00]/30 text-white'
                            : 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                        }`}
                      >
                        {/* Set Number */}
                        <div className="col-span-2 flex items-center gap-1 font-mono text-xs font-bold pl-1">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              set.completed ? 'bg-[#ccff00] text-slate-950 font-extrabold' : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {set.setNumber}
                          </span>
                        </div>

                        {/* Weight input */}
                        <div className="col-span-4 flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weightKg}
                            onChange={(e) =>
                              onUpdateSet(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)
                            }
                            className="w-16 bg-slate-900 border border-slate-700 focus:border-[#ccff00] rounded-lg py-1.5 px-2 text-center font-mono text-sm font-bold text-white focus:outline-none"
                          />
                        </div>

                        {/* Reps input */}
                        <div className="col-span-4 flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={set.reps}
                            onChange={(e) =>
                              onUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                            }
                            className="w-16 bg-slate-900 border border-slate-700 focus:border-[#ccff00] rounded-lg py-1.5 px-2 text-center font-mono text-sm font-bold text-white focus:outline-none"
                          />
                        </div>

                        {/* Completed Checkbox & Set Delete */}
                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onToggleSet(exIdx, setIdx)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                              set.completed
                                ? 'bg-[#ccff00] text-slate-950 ring-2 ring-[#ccff00]/30'
                                : 'bg-slate-700/60 hover:bg-slate-700 text-slate-400 border border-slate-600'
                            }`}
                          >
                            <Check className="w-5 h-5 stroke-[3]" />
                          </button>

                          {ex.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onRemoveSet(exIdx, setIdx)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                              title="세트 제거"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add set button */}
                  <div className="mt-3 pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onAddSet(exIdx)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#ccff00]" /> 세트 추가
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-xs text-slate-400">
            완료된 세트: <span className="font-bold text-[#ccff00]">{completedSetsCount}</span> / {totalSetsCount}
            <span className="mx-2">·</span>
            총 운동량: <span className="font-mono font-bold text-white">{liveVolume.toLocaleString()}kg</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onCancelWorkout}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            운동 종료 (취소)
          </button>
          <button
            onClick={onFinishWorkout}
            disabled={completedSetsCount === 0}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#ccff00] text-slate-950 font-extrabold text-xs sm:text-sm hover:bg-[#b8e600] active:scale-95 transition-all shadow-lg shadow-[#ccff00]/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trophy className="w-4 h-4" /> 운동 완료 & 저장
          </button>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {isAddExModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#ccff00]" /> 운동 종목 추가
              </h3>
              <button
                onClick={() => setIsAddExModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchEx}
                  onChange={(e) => setSearchEx(e.target.value)}
                  placeholder="운동 종목 이름 또는 부위 검색..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ccff00]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredExLibrary.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => {
                    onAddExercise(ex);
                    setIsAddExModalOpen(false);
                  }}
                  className="p-3 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-[#ccff00]/40 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <div className="font-bold text-sm text-white">{ex.name}</div>
                    <div className="text-xs text-slate-400">
                      {ex.targetMuscle} · {ex.equipment}
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[#ccff00]/10 text-[#ccff00] text-xs font-bold hover:bg-[#ccff00] hover:text-slate-950 transition-colors">
                    선택
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
