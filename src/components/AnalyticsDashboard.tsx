import { useState } from 'react';
import {
  Trophy,
  Dumbbell,
  Scale,
  Calendar,
  Flame,
  Clock,
  TrendingUp,
  Activity,
  Plus,
} from 'lucide-react';
import { CompletedWorkoutLog, BodyWeightLog, UserGoal, MuscleGroup } from '../types/fitness';
import { getTodayString } from '../hooks/useFitnessStore';

interface AnalyticsDashboardProps {
  workoutLogs: CompletedWorkoutLog[];
  weightLogs: BodyWeightLog[];
  userGoal: UserGoal;
  onLogWeight: (weight: number, date?: string) => void;
  onUpdateGoal: (newGoal: UserGoal) => void;
}

export function AnalyticsDashboard({
  workoutLogs,
  weightLogs,
  userGoal,
  onLogWeight,
  onUpdateGoal,
}: AnalyticsDashboardProps) {
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Editable goals state
  const [goalCalories, setGoalCalories] = useState(userGoal.dailyCalories);
  const [goalProtein, setGoalProtein] = useState(userGoal.targetProtein);
  const [goalCarbs, setGoalCarbs] = useState(userGoal.targetCarbs);
  const [goalFat, setGoalFat] = useState(userGoal.targetFat);
  const [goalTargetWeight, setGoalTargetWeight] = useState(userGoal.targetWeightKg);

  // Total volume across all logs
  const totalLifetimeVolume = workoutLogs.reduce((sum, log) => sum + log.totalVolumeKg, 0);
  const totalLifetimeWorkouts = workoutLogs.length;
  const avgDuration =
    totalLifetimeWorkouts > 0
      ? Math.round(workoutLogs.reduce((sum, log) => sum + log.durationMinutes, 0) / totalLifetimeWorkouts)
      : 0;

  // Muscle group frequency
  const muscleCounts: Record<MuscleGroup, number> = {
    가슴: 0,
    등: 0,
    하체: 0,
    어깨: 0,
    팔: 0,
    복근: 0,
    유산소: 0,
  };

  workoutLogs.forEach((log) => {
    log.exercises.forEach((ex) => {
      if (muscleCounts[ex.targetMuscle] !== undefined) {
        muscleCounts[ex.targetMuscle] += ex.completedSets;
      }
    });
  });

  const maxMuscleSets = Math.max(1, ...Object.values(muscleCounts));

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val > 0) {
      onLogWeight(val, getTodayString());
      setNewWeightInput('');
      setIsWeightModalOpen(false);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoal({
      ...userGoal,
      dailyCalories: Number(goalCalories) || 2000,
      targetProtein: Number(goalProtein) || 120,
      targetCarbs: Number(goalCarbs) || 200,
      targetFat: Number(goalFat) || 50,
      targetWeightKg: Number(goalTargetWeight) || 70,
    });
    setIsGoalModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Completed Workouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">누적 운동 세션</span>
            <Trophy className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white">
            {totalLifetimeWorkouts} <span className="text-xs font-normal text-slate-400">회 완료</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">꾸준한 운동 기록 유지 중</div>
        </div>

        {/* KPI 2: Total Lifted Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">누적 볼륨량</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-[#00f0ff]">
            {(totalLifetimeVolume / 1000).toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">톤 (Ton)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            총 {totalLifetimeVolume.toLocaleString()} kg
          </div>
        </div>

        {/* KPI 3: Body Weight & Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm relative group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">현재 체중</span>
            <button
              onClick={() => setIsWeightModalOpen(true)}
              className="text-xs font-semibold text-[#ccff00] hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> 기록
            </button>
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white">
            {userGoal.currentWeightKg}{' '}
            <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>목표: {userGoal.targetWeightKg}kg</span>
            <span className="font-mono text-[#ccff00]">
              {(userGoal.currentWeightKg - userGoal.targetWeightKg).toFixed(1)}kg 차이
            </span>
          </div>
        </div>

        {/* KPI 4: Avg Workout Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">평균 운동 시간</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white">
            {avgDuration} <span className="text-xs font-normal text-slate-400">분</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">세션당 평균 집중 시간</div>
        </div>
      </div>

      {/* Middle Section: Muscle Balance & Weight Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Muscle Group Volume Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">신체 부위별 훈련 밸런스</h3>
              <p className="text-xs text-slate-400">완료한 세트 수 기준 부위별 운동 비중</p>
            </div>
            <Activity className="w-4 h-4 text-[#ccff00]" />
          </div>

          <div className="space-y-2.5 pt-1">
            {(Object.keys(muscleCounts) as MuscleGroup[]).map((muscle) => {
              const sets = muscleCounts[muscle];
              const percent = Math.round((sets / maxMuscleSets) * 100);

              return (
                <div key={muscle} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{muscle}</span>
                    <span className="font-mono text-slate-400">
                      <strong className="text-white">{sets}</strong> 세트
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#ccff00] to-[#00f0ff] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Weight Progression Log */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white text-sm">체중 변화 추이 (Weight Tracker)</h3>
                <p className="text-xs text-slate-400">날짜별 체중 기록 및 목표 달성률</p>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                목표 수정
              </button>
            </div>

            {/* Weight list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {weightLogs.slice(-6).reverse().map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-300 font-mono">{entry.date}</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-white">
                    {entry.weightKg} <span className="text-xs text-slate-400">kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4 text-[#ccff00]" /> 오늘 체중 기록하기
          </button>
        </div>
      </div>

      {/* Workout History Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#ccff00]" />
            <h3 className="font-bold text-white text-base">완료한 운동 히스토리</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{workoutLogs.length}개의 기록</span>
        </div>

        {workoutLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            아직 완료된 운동 기록이 없습니다. 오늘 첫 운동을 완료해 보세요!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                  <div>
                    <span className="text-xs font-mono text-[#ccff00]">{log.date}</span>
                    <h4 className="font-bold text-white text-sm sm:text-base">{log.routineName}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" /> {log.durationMinutes}분
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> {log.totalVolumeKg.toLocaleString()}kg
                    </span>
                  </div>
                </div>

                {/* Exercises summary chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {log.exercises.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <span className="text-white font-medium">{item.name}</span>
                        <div className="text-[11px] text-slate-400">{item.targetMuscle}</div>
                      </div>
                      <div className="font-mono text-right shrink-0">
                        <div className="text-[#ccff00] font-bold">{item.completedSets}세트</div>
                        <div className="text-[10px] text-slate-400">{item.topWeightKg}kg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Weight Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-2">오늘 체중 기록</h3>
            <p className="text-xs text-slate-400 mb-4">현재 체중을 입력하면 변화 추이에 즉시 반영됩니다.</p>
            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  placeholder="예: 73.5"
                  autoFocus
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ccff00] text-slate-950 hover:bg-[#b8e600]"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Edit Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">목표 칼로리 & 매크로 설정</h3>
            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  일일 권장 칼로리 (kcal)
                </label>
                <input
                  type="number"
                  value={goalCalories}
                  onChange={(e) => setGoalCalories(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#00f0ff] mb-1">탄수화물 (g)</label>
                  <input
                    type="number"
                    value={goalCarbs}
                    onChange={(e) => setGoalCarbs(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#ccff00] mb-1">단백질 (g)</label>
                  <input
                    type="number"
                    value={goalProtein}
                    onChange={(e) => setGoalProtein(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-400 mb-1">지방 (g)</label>
                  <input
                    type="number"
                    value={goalFat}
                    onChange={(e) => setGoalFat(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">목표 체중 (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={goalTargetWeight}
                  onChange={(e) => setGoalTargetWeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ccff00] text-slate-950 hover:bg-[#b8e600]"
                >
                  목표 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
