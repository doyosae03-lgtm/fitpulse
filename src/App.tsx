/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useFitnessStore } from './hooks/useFitnessStore';
import { Navbar, ActiveTab } from './components/Navbar';
import { RoutinePlanner } from './components/RoutinePlanner';
import { ActiveWorkoutTracker } from './components/ActiveWorkoutTracker';
import { DietTracker } from './components/DietTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('routines');

  const {
    routines,
    activeWorkout,
    workoutLogs,
    userGoal,
    weightLogs,
    soundEnabled,
    selectedDate,
    setSelectedDate,
    setSoundEnabled,
    setUserGoal,
    startWorkoutFromRoutine,
    startBlankWorkout,
    toggleSetCompleted,
    updateSetValues,
    addSetToExercise,
    removeSetFromExercise,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    finishWorkout,
    cancelWorkout,
    addCustomRoutine,
    deleteRoutine,
    getCurrentDayDiet,
    addMealItem,
    removeMealItem,
    setWaterCups,
    logBodyWeight,
    seedDemoData,
    resetAllData,
  } = useFitnessStore();

  const handleStartRoutine = (routineId: string) => {
    startWorkoutFromRoutine(routineId);
    setActiveTab('workout');
  };

  const handleStartBlank = () => {
    startBlankWorkout();
    setActiveTab('workout');
  };

  const handleFinishWorkout = () => {
    finishWorkout();
    setActiveTab('analytics');
  };

  const currentDayDiet = getCurrentDayDiet(selectedDate);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-[#ccff00] selection:text-slate-950 pb-20 md:pb-12">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveWorkout={Boolean(activeWorkout)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onSeedDemo={seedDemoData}
        onReset={resetAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'routines' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                운동 루틴 플래너
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                목표에 맞는 과학적인 분할 루틴을 선택하거나 나만의 루틴을 직접 설계해 보세요.
              </p>
            </div>
            <RoutinePlanner
              routines={routines}
              onStartRoutine={handleStartRoutine}
              onStartBlank={handleStartBlank}
              onAddRoutine={addCustomRoutine}
              onDeleteRoutine={deleteRoutine}
            />
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                실시간 운동 & 타이머
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                세트별 중량과 반복 횟수를 체크하고, 세트 간 자동 휴식 타이머로 최적의 펌핑을 유지하세요.
              </p>
            </div>
            <ActiveWorkoutTracker
              activeWorkout={activeWorkout}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onToggleSet={toggleSetCompleted}
              onUpdateSet={updateSetValues}
              onAddSet={addSetToExercise}
              onRemoveSet={removeSetFromExercise}
              onAddExercise={addExerciseToActiveWorkout}
              onRemoveExercise={removeExerciseFromActiveWorkout}
              onFinishWorkout={handleFinishWorkout}
              onCancelWorkout={cancelWorkout}
              onGoToRoutines={() => setActiveTab('routines')}
              onStartBlank={handleStartBlank}
            />
          </div>
        )}

        {activeTab === 'diet' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                식단 & 매크로 영양소
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                칼로리와 3대 영양소(탄·단·지), 일일 수분 섭취량을 기록하여 목표 체중에 도달하세요.
              </p>
            </div>
            <DietTracker
              currentDayDiet={currentDayDiet}
              userGoal={userGoal}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onAddMealItem={addMealItem}
              onRemoveMealItem={removeMealItem}
              onSetWaterCups={setWaterCups}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                운동 통계 & 신체 분석
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                누적 볼륨, 근육 부위별 훈련 밸런스, 체중 변화 및 완료한 운동 히스토리를 확인하세요.
              </p>
            </div>
            <AnalyticsDashboard
              workoutLogs={workoutLogs}
              weightLogs={weightLogs}
              userGoal={userGoal}
              onLogWeight={logBodyWeight}
              onUpdateGoal={setUserGoal}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-12 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">FitPulse</span>
            <span>·</span>
            <span>오프라인 독립형 운동 & 식단 트래커</span>
          </div>
          <div className="text-[11px] text-slate-400">
            외부 API 없이 LocalStorage로 100% 동작 · GitHub Pages & Vercel 배포 최적화
          </div>
        </div>
      </footer>
    </div>
  );
}
