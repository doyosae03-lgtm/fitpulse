import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Routine,
  ActiveWorkout,
  CompletedWorkoutLog,
  DayDietLog,
  UserGoal,
  BodyWeightLog,
  MealEntry,
  MealType,
  Exercise,
} from '../types/fitness';
import {
  EXERCISE_LIBRARY,
  PRESET_ROUTINES,
  DEFAULT_USER_GOAL,
  PRESET_FOODS,
} from '../data/fitnessData';
import { playSetCheckSound, playWorkoutCompleteFanfare } from '../utils/audio';

const STORAGE_KEYS = {
  ROUTINES: 'fitpulse_routines_v1',
  ACTIVE_WORKOUT: 'fitpulse_active_workout_v1',
  WORKOUT_LOGS: 'fitpulse_workout_logs_v1',
  DIET_LOGS: 'fitpulse_diet_logs_v1',
  USER_GOAL: 'fitpulse_user_goal_v1',
  WEIGHT_LOGS: 'fitpulse_weight_logs_v1',
  SOUND_ENABLED: 'fitpulse_sound_enabled_v1',
};

// Formats YYYY-MM-DD in local time
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useFitnessStore() {
  // 1. Routines
  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PRESET_ROUTINES;
  });

  // 2. Active Workout
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // 3. Completed Workout Logs
  const [workoutLogs, setWorkoutLogs] = useState<CompletedWorkoutLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // 4. Diet Logs (Array of DayDietLog)
  const [dietLogs, setDietLogs] = useState<DayDietLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DIET_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // 5. User Goal
  const [userGoal, setUserGoal] = useState<UserGoal>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_GOAL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USER_GOAL;
  });

  // 6. Weight Logs
  const [weightLogs, setWeightLogs] = useState<BodyWeightLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { date: '2026-10-25', weightKg: 74.2 },
      { date: '2026-10-27', weightKg: 73.9 },
      { date: '2026-10-29', weightKg: 73.7 },
      { date: '2026-10-31', weightKg: 73.5 },
    ];
  });

  // 7. Sound enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return true;
  });

  // Selected date for viewing / editing diet & workouts
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Auto-save on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    }
  }, [activeWorkout]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIET_LOGS, JSON.stringify(dietLogs));
  }, [dietLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_GOAL, JSON.stringify(userGoal));
  }, [userGoal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(weightLogs));
  }, [weightLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // First-time visit auto-seed check: if no logs exist, seed initial realistic data so app looks great!
  useEffect(() => {
    if (workoutLogs.length === 0 && dietLogs.length === 0) {
      seedDemoData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- WORKOUT ACTIONS ---

  const startWorkoutFromRoutine = useCallback((routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const exercises = routine.exercises.map((rc) => {
      const exDef = EXERCISE_LIBRARY.find((e) => e.id === rc.exerciseId);
      const sets = Array.from({ length: rc.targetSets }, (_, idx) => ({
        setNumber: idx + 1,
        weightKg: rc.targetWeightKg,
        reps: rc.targetReps,
        completed: false,
      }));

      return {
        exerciseId: rc.exerciseId,
        name: exDef ? exDef.name : '운동 종목',
        targetMuscle: exDef ? exDef.targetMuscle : '가슴',
        sets,
      };
    });

    const newActive: ActiveWorkout = {
      id: 'act_' + Date.now(),
      routineId: routine.id,
      routineName: routine.name,
      startTime: Date.now(),
      exercises,
    };

    setActiveWorkout(newActive);
  }, [routines]);

  const startBlankWorkout = useCallback((title: string = '자유 운동 세션') => {
    const newActive: ActiveWorkout = {
      id: 'act_' + Date.now(),
      routineName: title,
      startTime: Date.now(),
      exercises: [],
    };
    setActiveWorkout(newActive);
  }, []);

  const toggleSetCompleted = useCallback((exerciseIdx: number, setIdx: number) => {
    if (soundEnabled) {
      playSetCheckSound();
    }
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const nextExercises = [...prev.exercises];
      const targetEx = { ...nextExercises[exerciseIdx] };
      const nextSets = [...targetEx.sets];
      nextSets[setIdx] = {
        ...nextSets[setIdx],
        completed: !nextSets[setIdx].completed,
      };
      targetEx.sets = nextSets;
      nextExercises[exerciseIdx] = targetEx;
      return { ...prev, exercises: nextExercises };
    });
  }, [soundEnabled]);

  const updateSetValues = useCallback(
    (exerciseIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) => {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        const nextExercises = [...prev.exercises];
        const targetEx = { ...nextExercises[exerciseIdx] };
        const nextSets = [...targetEx.sets];
        nextSets[setIdx] = {
          ...nextSets[setIdx],
          [field]: Math.max(0, value),
        };
        targetEx.sets = nextSets;
        nextExercises[exerciseIdx] = targetEx;
        return { ...prev, exercises: nextExercises };
      });
    },
    []
  );

  const addSetToExercise = useCallback((exerciseIdx: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const nextExercises = [...prev.exercises];
      const targetEx = { ...nextExercises[exerciseIdx] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSet = {
        setNumber: targetEx.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      };
      targetEx.sets = [...targetEx.sets, newSet];
      nextExercises[exerciseIdx] = targetEx;
      return { ...prev, exercises: nextExercises };
    });
  }, []);

  const removeSetFromExercise = useCallback((exerciseIdx: number, setIdx: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const nextExercises = [...prev.exercises];
      const targetEx = { ...nextExercises[exerciseIdx] };
      const nextSets = targetEx.sets
        .filter((_, idx) => idx !== setIdx)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      targetEx.sets = nextSets;
      nextExercises[exerciseIdx] = targetEx;
      return { ...prev, exercises: nextExercises };
    });
  }, []);

  const addExerciseToActiveWorkout = useCallback((exercise: Exercise) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newEx = {
        exerciseId: exercise.id,
        name: exercise.name,
        targetMuscle: exercise.targetMuscle,
        sets: [
          { setNumber: 1, weightKg: exercise.defaultWeightKg, reps: exercise.defaultReps, completed: false },
          { setNumber: 2, weightKg: exercise.defaultWeightKg, reps: exercise.defaultReps, completed: false },
          { setNumber: 3, weightKg: exercise.defaultWeightKg, reps: exercise.defaultReps, completed: false },
        ],
      };
      return {
        ...prev,
        exercises: [...prev.exercises, newEx],
      };
    });
  }, []);

  const removeExerciseFromActiveWorkout = useCallback((exerciseIdx: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter((_, idx) => idx !== exerciseIdx),
      };
    });
  }, []);

  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return;

    const durationMin = Math.max(1, Math.round((Date.now() - activeWorkout.startTime) / 60000));
    let totalVolume = 0;
    let completedSetsCount = 0;

    const completedExercises = activeWorkout.exercises.map((ex) => {
      let topWeight = 0;
      let exSets = 0;
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalVolume += set.weightKg * set.reps;
          completedSetsCount += 1;
          exSets += 1;
          if (set.weightKg > topWeight) topWeight = set.weightKg;
        }
      });
      return {
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        completedSets: exSets,
        topWeightKg: topWeight,
      };
    });

    const newLog: CompletedWorkoutLog = {
      id: 'log_' + Date.now(),
      date: getTodayString(),
      routineName: activeWorkout.routineName,
      durationMinutes: durationMin,
      totalVolumeKg: totalVolume,
      completedSetsCount,
      exercises: completedExercises,
    };

    setWorkoutLogs((prev) => [newLog, ...prev]);
    setActiveWorkout(null);

    // Audio & Confetti celebration
    if (soundEnabled) {
      playWorkoutCompleteFanfare();
    }
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ccff00', '#00f0ff', '#38bdf8', '#ffffff'],
      });
    } catch {
      // Ignore
    }
  }, [activeWorkout, soundEnabled]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  // --- CUSTOM ROUTINE ACTIONS ---

  const addCustomRoutine = useCallback((newRoutine: Routine) => {
    setRoutines((prev) => [newRoutine, ...prev]);
  }, []);

  const deleteRoutine = useCallback((routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  }, []);

  // --- DIET ACTIONS ---

  const getCurrentDayDiet = useCallback(
    (date: string): DayDietLog => {
      const found = dietLogs.find((d) => d.date === date);
      if (found) return found;
      return {
        date,
        meals: [],
        waterCups: 0,
      };
    },
    [dietLogs]
  );

  const addMealItem = useCallback(
    (date: string, mealType: MealType, food: { name: string; calories: number; carbs: number; protein: number; fat: number; serving: string }) => {
      const newEntry: MealEntry = {
        id: 'meal_' + Date.now() + Math.random().toString(36).substring(2, 6),
        name: food.name,
        mealType,
        calories: Math.round(food.calories),
        carbs: Math.round(food.carbs),
        protein: Math.round(food.protein),
        fat: Math.round(food.fat),
        serving: food.serving,
      };

      setDietLogs((prev) => {
        const index = prev.findIndex((d) => d.date === date);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            meals: [...updated[index].meals, newEntry],
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              date,
              meals: [newEntry],
              waterCups: 0,
            },
          ];
        }
      });
    },
    []
  );

  const removeMealItem = useCallback((date: string, mealId: string) => {
    setDietLogs((prev) => {
      return prev.map((d) => {
        if (d.date !== date) return d;
        return {
          ...d,
          meals: d.meals.filter((m) => m.id !== mealId),
        };
      });
    });
  }, []);

  const setWaterCups = useCallback((date: string, count: number) => {
    setDietLogs((prev) => {
      const index = prev.findIndex((d) => d.date === date);
      const safeCount = Math.max(0, Math.min(20, count));
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], waterCups: safeCount };
        return updated;
      } else {
        return [...prev, { date, meals: [], waterCups: safeCount }];
      }
    });
  }, []);

  // --- WEIGHT LOGGING ---

  const logBodyWeight = useCallback((weight: number, date: string = getTodayString()) => {
    setWeightLogs((prev) => {
      const filtered = prev.filter((w) => w.date !== date);
      const updated = [...filtered, { date, weightKg: Number(weight.toFixed(1)) }].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      return updated;
    });
    setUserGoal((prev) => ({ ...prev, currentWeightKg: Number(weight.toFixed(1)) }));
  }, []);

  // --- DEMO DATA SEEDER ---

  const seedDemoData = useCallback(() => {
    const today = getTodayString();
    const d = new Date();
    
    // Yesterday
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split('T')[0];

    // 2 days ago
    d.setDate(d.getDate() - 1);
    const twoDaysAgo = d.toISOString().split('T')[0];

    // 4 days ago
    d.setDate(d.getDate() - 2);
    const fourDaysAgo = d.toISOString().split('T')[0];

    // Sample workout logs
    const sampleWorkouts: CompletedWorkoutLog[] = [
      {
        id: 'log_seed_1',
        date: yesterday,
        routineName: '3분할 루틴 - 당기기 (Pull Day)',
        durationMinutes: 52,
        totalVolumeKg: 7850,
        completedSetsCount: 16,
        exercises: [
          { name: '컨벤셔널 데드리프트', targetMuscle: '등', completedSets: 3, topWeightKg: 100 },
          { name: '랫 풀다운', targetMuscle: '등', completedSets: 4, topWeightKg: 55 },
          { name: '시티드 케이블 로우', targetMuscle: '등', completedSets: 4, topWeightKg: 45 },
          { name: '페이스 풀', targetMuscle: '어깨', completedSets: 3, topWeightKg: 20 },
          { name: '이지바 바벨 컬', targetMuscle: '팔', completedSets: 2, topWeightKg: 25 },
        ],
      },
      {
        id: 'log_seed_2',
        date: twoDaysAgo,
        routineName: '3분할 루틴 - 밀기 (Push Day)',
        durationMinutes: 48,
        totalVolumeKg: 6420,
        completedSetsCount: 14,
        exercises: [
          { name: '바벨 벤치프레스', targetMuscle: '가슴', completedSets: 4, topWeightKg: 65 },
          { name: '인클라인 덤벨 프레스', targetMuscle: '가슴', completedSets: 4, topWeightKg: 22 },
          { name: '사이드 레터럴 레이즈', targetMuscle: '어깨', completedSets: 3, topWeightKg: 8 },
          { name: '트라이셉스 케이블 푸시다운', targetMuscle: '팔', completedSets: 3, topWeightKg: 25 },
        ],
      },
      {
        id: 'log_seed_3',
        date: fourDaysAgo,
        routineName: '3분할 루틴 - 하체 & 코어 (Legs Day)',
        durationMinutes: 58,
        totalVolumeKg: 9100,
        completedSetsCount: 17,
        exercises: [
          { name: '바벨 백 스쿼트', targetMuscle: '하체', completedSets: 4, topWeightKg: 85 },
          { name: '파워 레그 프레스', targetMuscle: '하체', completedSets: 4, topWeightKg: 160 },
          { name: '레그 익스텐션', targetMuscle: '하체', completedSets: 3, topWeightKg: 45 },
          { name: '코어 플랭크', targetMuscle: '복근', completedSets: 3, topWeightKg: 0 },
        ],
      },
    ];

    // Sample Diet logs for today & yesterday
    const sampleDiet: DayDietLog[] = [
      {
        date: today,
        waterCups: 6,
        meals: [
          {
            id: 'm_today_1',
            name: '무가당 그릭 요거트 + 바나나',
            mealType: 'breakfast',
            calories: 200,
            carbs: 31,
            protein: 11,
            fat: 3.3,
            serving: '1그릇',
          },
          {
            id: 'm_today_2',
            name: '소고기 야채 비빔밥',
            mealType: 'lunch',
            calories: 520,
            carbs: 75,
            protein: 22,
            fat: 13,
            serving: '1그릇 (350g)',
          },
          {
            id: 'm_today_3',
            name: 'WPI 단백질 쉐이크',
            mealType: 'snack',
            calories: 120,
            carbs: 2,
            protein: 24,
            fat: 1,
            serving: '1스쿱',
          },
          {
            id: 'm_today_4',
            name: '닭가슴살 + 즉석 흰쌀밥',
            mealType: 'dinner',
            calories: 425,
            carbs: 68,
            protein: 28.5,
            fat: 2.3,
            serving: '1세트',
          },
        ],
      },
      {
        date: yesterday,
        waterCups: 8,
        meals: [
          {
            id: 'm_yest_1',
            name: '삶은 계란 (2개) + 사과',
            mealType: 'breakfast',
            calories: 245,
            carbs: 26,
            protein: 13,
            fat: 10.3,
            serving: '1접시',
          },
          {
            id: 'm_yest_2',
            name: '다이어트 도시락 (닭가슴살 볶음밥)',
            mealType: 'lunch',
            calories: 360,
            carbs: 54,
            protein: 21,
            fat: 5,
            serving: '1팩',
          },
          {
            id: 'm_yest_3',
            name: '생연어 구이 + 현미밥',
            mealType: 'dinner',
            calories: 355,
            carbs: 42,
            protein: 24.5,
            fat: 10,
            serving: '1접시',
          },
        ],
      },
    ];

    setWorkoutLogs(sampleWorkouts);
    setDietLogs(sampleDiet);
    setRoutines(PRESET_ROUTINES);
    setUserGoal(DEFAULT_USER_GOAL);
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.DIET_LOGS);
    localStorage.removeItem(STORAGE_KEYS.USER_GOAL);
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_LOGS);

    setRoutines(PRESET_ROUTINES);
    setActiveWorkout(null);
    setWorkoutLogs([]);
    setDietLogs([]);
    setUserGoal(DEFAULT_USER_GOAL);
  }, []);

  return {
    routines,
    activeWorkout,
    workoutLogs,
    dietLogs,
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
  };
}
