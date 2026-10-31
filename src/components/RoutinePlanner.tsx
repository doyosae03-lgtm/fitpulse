import { useState } from 'react';
import { Plus, Play, Dumbbell, Clock, Flame, Trash2, Sparkles, ChevronRight } from 'lucide-react';
import { Routine, SplitType } from '../types/fitness';
import { EXERCISE_LIBRARY } from '../data/fitnessData';
import { CustomRoutineModal } from './CustomRoutineModal';

interface RoutinePlannerProps {
  routines: Routine[];
  onStartRoutine: (routineId: string) => void;
  onStartBlank: () => void;
  onAddRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export function RoutinePlanner({
  routines,
  onStartRoutine,
  onStartBlank,
  onAddRoutine,
  onDeleteRoutine,
}: RoutinePlannerProps) {
  const [selectedSplit, setSelectedSplit] = useState<SplitType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRoutines = routines.filter((r) => {
    if (selectedSplit === 'all') return true;
    return r.splitType === selectedSplit;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Filter & Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: '전체' },
            { id: 'ppl', label: '3분할 PPL' },
            { id: '4split', label: '4분할' },
            { id: '2split', label: '2분할 상하체' },
            { id: 'bodyweight', label: '홈트 맨몸' },
            { id: 'cardio', label: '유산소' },
            { id: 'custom', label: '내 맞춤 루틴' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSplit(tab.id as SplitType | 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSplit === tab.id
                  ? 'bg-[#ccff00] text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#ccff00]" /> 루틴 직접 만들기
          </button>
          <button
            onClick={onStartBlank}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> 자유 운동 시작
          </button>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutines.map((routine) => {
          return (
            <div
              key={routine.id}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-black/40"
            >
              <div>
                {/* Routine Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded-md">
                      {routine.splitType.toUpperCase()}
                    </span>
                    {routine.isCustom && (
                      <span className="text-[11px] font-medium text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded-md">
                        커스텀
                      </span>
                    )}
                  </div>

                  {routine.isCustom && (
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="루틴 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#ccff00] transition-colors mb-1">
                  {routine.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {routine.description}
                </p>

                {/* Target Muscle tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {routine.targetMuscleTags.map((muscle) => (
                    <span
                      key={muscle}
                      className="text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md"
                    >
                      #{muscle}
                    </span>
                  ))}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3" /> {routine.estimatedMinutes}분
                  </span>
                </div>

                {/* Exercises list preview */}
                <div className="bg-slate-950/60 rounded-xl p-3 mb-5 border border-slate-800/50 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>포함된 운동 종목</span>
                    <span>{routine.exercises.length}종목</span>
                  </div>
                  {routine.exercises.slice(0, 4).map((item, idx) => {
                    const ex = EXERCISE_LIBRARY.find((e) => e.id === item.exerciseId);
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate pr-2">• {ex ? ex.name : '운동 종목'}</span>
                        <span className="font-mono text-slate-400 text-[11px] shrink-0">
                          {item.targetSets}세트 x {item.targetReps}회
                        </span>
                      </div>
                    );
                  })}
                  {routine.exercises.length > 4 && (
                    <div className="text-[11px] text-slate-400 pt-0.5">
                      외 {routine.exercises.length - 4}개 운동 추가...
                    </div>
                  )}
                </div>
              </div>

              {/* Start Workout Button */}
              <button
                onClick={() => onStartRoutine(routine.id)}
                className="w-full py-2.5 rounded-xl bg-[#ccff00] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b8e600] active:scale-[0.98] transition-all shadow-md"
              >
                <Play className="w-4 h-4 fill-current" /> 오늘 이 루틴 시작하기
              </button>
            </div>
          );
        })}
      </div>

      {/* Routine Helper Tip Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">스마트 분할 루틴 추천 팁</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            주 3~5회 운동이 가능한 경우 <strong className="text-slate-200">3분할 PPL (밀기/당기기/하체)</strong> 루틴이 가장 근비대와 회복 주기에 적합합니다.
            바쁜 날에는 <strong className="text-slate-200">상하체 2분할</strong>이나 <strong className="text-slate-200">맨몸 홈트</strong>로 유연하게 전환해 보세요!
          </p>
        </div>
      </div>

      {/* Modal */}
      <CustomRoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddRoutine}
      />
    </div>
  );
}
