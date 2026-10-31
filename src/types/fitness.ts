export type MuscleGroup = '가슴' | '등' | '하체' | '어깨' | '팔' | '복근' | '유산소';

export type SplitType = 'ppl' | '4split' | '2split' | 'bodyweight' | 'cardio' | 'custom';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  category: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'cardio';
  equipment: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
  guideTip: string;
}

export interface RoutineExerciseConfig {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg: number;
}

export interface Routine {
  id: string;
  name: string;
  splitType: SplitType;
  description: string;
  targetMuscleTags: MuscleGroup[];
  estimatedMinutes: number;
  exercises: RoutineExerciseConfig[];
  isCustom?: boolean;
}

export interface WorkoutSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ActiveExerciseSession {
  exerciseId: string;
  name: string;
  targetMuscle: MuscleGroup;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  id: string;
  routineId?: string;
  routineName: string;
  startTime: number;
  exercises: ActiveExerciseSession[];
}

export interface CompletedWorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  routineName: string;
  durationMinutes: number;
  totalVolumeKg: number;
  completedSetsCount: number;
  exercises: {
    name: string;
    targetMuscle: MuscleGroup;
    completedSets: number;
    topWeightKg: number;
  }[];
}

export interface FoodItem {
  id: string;
  name: string;
  category: '단백질' | '탄수화물' | '야채/과일' | '간식/음료' | '식사';
  servingSize: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  foodId?: string;
  name: string;
  mealType: MealType;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  serving: string;
}

export interface DayDietLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  waterCups: number;
}

export interface UserGoal {
  dailyCalories: number;
  targetCarbs: number;
  targetProtein: number;
  targetFat: number;
  dailyWaterCups: number;
  currentWeightKg: number;
  targetWeightKg: number;
}

export interface BodyWeightLog {
  date: string;
  weightKg: number;
}
