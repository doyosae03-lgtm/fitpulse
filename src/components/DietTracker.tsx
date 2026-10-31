import { useState } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Droplet,
  Flame,
  Search,
  X,
  Apple,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { DayDietLog, MealType, MealEntry, UserGoal, FoodItem } from '../types/fitness';
import { PRESET_FOODS } from '../data/fitnessData';

interface DietTrackerProps {
  currentDayDiet: DayDietLog;
  userGoal: UserGoal;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAddMealItem: (
    date: string,
    mealType: MealType,
    item: { name: string; calories: number; carbs: number; protein: number; fat: number; serving: string }
  ) => void;
  onRemoveMealItem: (date: string, mealId: string) => void;
  onSetWaterCups: (date: string, cups: number) => void;
}

const MEAL_SECTIONS: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: '아침 (Breakfast)', icon: '☀️' },
  { id: 'lunch', label: '점심 (Lunch)', icon: '🍱' },
  { id: 'dinner', label: '저녁 (Dinner)', icon: '🌙' },
  { id: 'snack', label: '간식 & 보충제 (Snack)', icon: '⚡' },
];

export function DietTracker({
  currentDayDiet,
  userGoal,
  selectedDate,
  onSelectDate,
  onAddMealItem,
  onRemoveMealItem,
  onSetWaterCups,
}: DietTrackerProps) {
  const [activeModalMealType, setActiveModalMealType] = useState<MealType | null>(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Custom food input state
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customServing, setCustomServing] = useState('1인분');

  // Calculate totals for the selected day
  const meals = currentDayDiet.meals || [];
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const calPercent = Math.min(100, Math.round((totalCalories / userGoal.dailyCalories) * 100));
  const remainingCalories = userGoal.dailyCalories - totalCalories;

  // Change date helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleAddPreset = (food: FoodItem) => {
    if (!activeModalMealType) return;
    onAddMealItem(selectedDate, activeModalMealType, {
      name: food.name,
      calories: food.calories,
      carbs: food.carbs,
      protein: food.protein,
      fat: food.fat,
      serving: food.servingSize,
    });
    setActiveModalMealType(null);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalMealType || !customName.trim()) return;

    onAddMealItem(selectedDate, activeModalMealType, {
      name: customName.trim(),
      calories: Number(customCalories) || 0,
      carbs: Number(customCarbs) || 0,
      protein: Number(customProtein) || 0,
      fat: Number(customFat) || 0,
      serving: customServing.trim() || '1인분',
    });

    setCustomName('');
    setCustomCalories('');
    setCustomCarbs('');
    setCustomProtein('');
    setCustomFat('');
    setIsCustomMode(false);
    setActiveModalMealType(null);
  };

  const filteredFoods = PRESET_FOODS.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = f.name.toLowerCase().includes(foodSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:px-5">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="이전 날짜"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#ccff00]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="bg-transparent text-white font-mono font-bold text-sm sm:text-base border-none focus:outline-none cursor-pointer"
          />
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="다음 날짜"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calories & Macro Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Calories Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">일일 섭취 칼로리</span>
              <span className="font-mono text-[#ccff00] font-bold">{calPercent}% 달성</span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-mono tabular-nums text-3xl sm:text-4xl font-extrabold text-white">
                {totalCalories.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {userGoal.dailyCalories} kcal</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  totalCalories > userGoal.dailyCalories
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-[#ccff00] to-[#00f0ff]'
                }`}
                style={{ width: `${Math.min(100, (totalCalories / userGoal.dailyCalories) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>목표 대비 잔여량:</span>
            <span
              className={`font-mono font-bold ${
                remainingCalories < 0 ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {remainingCalories >= 0 ? `${remainingCalories} kcal 남음` : `${Math.abs(remainingCalories)} kcal 초과`}
            </span>
          </div>
        </div>

        {/* 3 Macros Card (Carbs / Protein / Fat) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold uppercase tracking-wider">3대 영양소 (탄·단·지 매크로)</span>
            <span className="text-[11px] text-slate-400">목표 기준 실시간 섭취량</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Carbs */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#00f0ff]">탄수화물</span>
                <span className="font-mono text-xs text-slate-400">
                  {Math.round((totalCarbs / userGoal.targetCarbs) * 100)}%
                </span>
              </div>
              <div className="font-mono tabular-nums text-xl font-extrabold text-white">
                {totalCarbs} <span className="text-xs text-slate-400 font-normal">/ {userGoal.targetCarbs}g</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#00f0ff] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalCarbs / userGoal.targetCarbs) * 100)}%` }}
                />
              </div>
            </div>

            {/* Protein */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#ccff00]">단백질 (Protein)</span>
                <span className="font-mono text-xs text-slate-400">
                  {Math.round((totalProtein / userGoal.targetProtein) * 100)}%
                </span>
              </div>
              <div className="font-mono tabular-nums text-xl font-extrabold text-white">
                {totalProtein} <span className="text-xs text-slate-400 font-normal">/ {userGoal.targetProtein}g</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#ccff00] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalProtein / userGoal.targetProtein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">지방 (Fat)</span>
                <span className="font-mono text-xs text-slate-400">
                  {Math.round((totalFat / userGoal.targetFat) * 100)}%
                </span>
              </div>
              <div className="font-mono tabular-nums text-xl font-extrabold text-white">
                {totalFat} <span className="text-xs text-slate-400 font-normal">/ {userGoal.targetFat}g</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalFat / userGoal.targetFat) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Water Intake Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">수분 섭취 트래커</div>
            <div className="font-bold text-white text-sm">
              오늘 마신 물: <span className="font-mono text-sky-400 text-base">{currentDayDiet.waterCups || 0}</span> /{' '}
              {userGoal.dailyWaterCups} 잔 (약 {( (currentDayDiet.waterCups || 0) * 250) / 1000}L)
            </div>
          </div>
        </div>

        {/* 8 Water Glasses interactive row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: 8 }, (_, idx) => {
            const isFilled = idx < (currentDayDiet.waterCups || 0);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSetWaterCups(selectedDate, isFilled && idx === (currentDayDiet.waterCups || 0) - 1 ? idx : idx + 1)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                  isFilled
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                }`}
                title={`${idx + 1}번째 물 한잔`}
              >
                <Droplet className="w-4 h-4 fill-current" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Meals by Category */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Utensils className="w-4 h-4 text-[#ccff00]" /> 끼니별 식단 기록
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEAL_SECTIONS.map((sec) => {
            const sectionMeals = meals.filter((m) => m.mealType === sec.id);
            const secCalories = sectionMeals.reduce((sum, m) => sum + m.calories, 0);

            return (
              <div
                key={sec.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sec.icon}</span>
                      <h4 className="font-bold text-sm text-white">{sec.label}</h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {secCalories} <span className="text-slate-400 font-normal">kcal</span>
                    </span>
                  </div>

                  {sectionMeals.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      기록된 식단이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {sectionMeals.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl"
                        >
                          <div>
                            <div className="font-semibold text-xs text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {item.serving} · 탄 {item.carbs}g · 단 {item.protein}g · 지 {item.fat}g
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#ccff00]">
                              {item.calories} <span className="text-[10px] text-slate-400">kcal</span>
                            </span>
                            <button
                              onClick={() => onRemoveMealItem(selectedDate, item.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalMealType(sec.id)}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/80 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ccff00]" /> 음식 추가하기
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Food Modal */}
      {activeModalMealType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-[#ccff00]" />
                <h3 className="font-bold text-white text-base">
                  {MEAL_SECTIONS.find((s) => s.id === activeModalMealType)?.label} 음식 추가
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModalMealType(null);
                  setIsCustomMode(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switch: Presets vs Custom */}
            <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                  !isCustomMode ? 'bg-[#ccff00] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                추천 음식 데이터베이스
              </button>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                  isCustomMode ? 'bg-[#ccff00] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                직접 영양성분 입력
              </button>
            </div>

            {/* Presets Mode */}
            {!isCustomMode ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Category filter */}
                <div className="p-3 border-b border-slate-800 space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      placeholder="음식 이름 검색 (예: 닭가슴살, 현미밥, 샐러드)..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
                    {['all', '단백질', '탄수화물', '식사', '야채/과일', '간식/음료'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCategory(c)}
                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap text-xs transition-colors ${
                          selectedCategory === c
                            ? 'bg-[#00f0ff] text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {c === 'all' ? '전체' : c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => handleAddPreset(food)}
                      className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-[#ccff00]/40 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          {food.name}
                          <span className="text-[10px] text-slate-400 font-normal">({food.servingSize})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          탄 {food.carbs}g · 단 {food.protein}g · 지 {food.fat}g
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#ccff00]">
                          {food.calories} kcal
                        </span>
                        <button className="px-2.5 py-1 rounded-lg bg-[#ccff00]/10 text-[#ccff00] text-xs font-bold">
                          추가
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Food Form */
              <form onSubmit={handleAddCustom} className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    음식 명칭 <span className="text-[#ccff00]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="예: 구운 삼겹살, 프로틴 팬케이크"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      칼로리 (kcal) <span className="text-[#ccff00]">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      placeholder="예: 350"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">제공량 단위</label>
                    <input
                      type="text"
                      value={customServing}
                      onChange={(e) => setCustomServing(e.target.value)}
                      placeholder="예: 1그릇, 150g"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#00f0ff] mb-1">탄수화물 (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#ccff00] mb-1">단백질 (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-400 mb-1">지방 (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    목록으로 돌아가기
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ccff00] text-slate-950 hover:bg-[#b8e600] active:scale-95"
                  >
                    이 음식 등록
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
