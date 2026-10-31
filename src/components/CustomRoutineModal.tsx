import { useState } from 'react';
import { X, Plus, Trash2, Search, Dumbbell, Clock } from 'lucide-react';
import { Routine, RoutineExerciseConfig, SplitType, MuscleGroup, Exercise } from '../types/fitness';
import { EXERCISE_LIBRARY } from '../data/fitnessData';

interface CustomRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: Routine) => void;
}

export function CustomRoutineModal({ isOpen, onClose, onSave }: CustomRoutineModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('custom');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [configuredExercises, setConfiguredExercises] = useState<RoutineExerciseConfig[]>([]);

  if (!isOpen) return null;

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'all' || ex.targetMuscle === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscle.includes(searchQuery) ||
      ex.equipment.includes(searchQuery);
    return matchesMuscle && matchesSearch;
  });

  const handleAddExercise = (exercise: Exercise) => {
    // If not already in configured list, add it
    if (configuredExercises.some((e) => e.exerciseId === exercise.id)) return;

    setConfiguredExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        targetSets: exercise.defaultSets,
        targetReps: exercise.defaultReps,
        targetWeightKg: exercise.defaultWeightKg,
      },
    ]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setConfiguredExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
  };

  const handleUpdateConfig = (
    exerciseId: string,
    field: 'targetSets' | 'targetReps' | 'targetWeightKg',
    val: number
  ) => {
    setConfiguredExercises((prev) =>
      prev.map((item) => (item.exerciseId === exerciseId ? { ...item, [field]: Math.max(0, val) } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Collect distinct muscle tags
    const muscleTags = Array.from(
      new Set(
        configuredExercises
          .map((ce) => EXERCISE_LIBRARY.find((e) => e.id === ce.exerciseId)?.targetMuscle)
          .filter(Boolean) as MuscleGroup[]
      )
    );

    const newRoutine: Routine = {
      id: 'routine_custom_' + Date.now(),
      name: name.trim(),
      description: description.trim() || '사용자 직접 제작 맞춤 루틴',
      splitType,
      targetMuscleTags: muscleTags.length > 0 ? muscleTags : ['가슴'],
      estimatedMinutes: Math.max(20, configuredExercises.length * 12),
      exercises: configuredExercises,
      isCustom: true,
    };

    onSave(newRoutine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">새 운동 루틴 만들기</h2>
              <p className="text-xs text-slate-400">원하는 부위와 종목을 조합하여 나만의 커스텀 루틴을 설계하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Routine Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                루틴 이름 <span className="text-[#ccff00]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 월요 하체 파괴 루틴, 전신 서킷"
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ccff00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">분할 유형</label>
              <select
                value={splitType}
                onChange={(e) => setSplitType(e.target.value as SplitType)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#ccff00]"
              >
                <option value="custom">맞춤형 자유 분할</option>
                <option value="ppl">3분할 (밀기/당기기/하체)</option>
                <option value="4split">4분할 전문 루틴</option>
                <option value="2split">2분할 상하체</option>
                <option value="bodyweight">맨몸/홈트레이닝</option>
                <option value="cardio">유산소/체지방 집중</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">루틴 설명 (선택)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="루틴의 목표, 집중 포인트 등을 간단히 적어보세요."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ccff00]"
              />
            </div>
          </div>

          {/* Added Exercises Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                선택된 운동 목록
                <span className="text-xs font-mono text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded-full">
                  {configuredExercises.length}개
                </span>
              </h3>
            </div>

            {configuredExercises.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400">
                아래 라이브러리에서 운동을 클릭하여 추가해 보세요.
              </div>
            ) : (
              <div className="space-y-2">
                {configuredExercises.map((item, idx) => {
                  const ex = EXERCISE_LIBRARY.find((e) => e.id === item.exerciseId);
                  if (!ex) return null;
                  return (
                    <div
                      key={item.exerciseId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-sm text-white">{ex.name}</div>
                          <div className="text-xs text-slate-400">
                            {ex.targetMuscle} · {ex.equipment}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex items-center gap-1 text-xs text-slate-300">
                          <span>세트:</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.targetSets}
                            onChange={(e) =>
                              handleUpdateConfig(item.exerciseId, 'targetSets', parseInt(e.target.value) || 1)
                            }
                            className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-300">
                          <span>회수:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={item.targetReps}
                            onChange={(e) =>
                              handleUpdateConfig(item.exerciseId, 'targetReps', parseInt(e.target.value) || 1)
                            }
                            className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-300">
                          <span>무게:</span>
                          <input
                            type="number"
                            min="0"
                            max="500"
                            value={item.targetWeightKg}
                            onChange={(e) =>
                              handleUpdateConfig(item.exerciseId, 'targetWeightKg', parseInt(e.target.value) || 0)
                            }
                            className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white text-xs"
                          />
                          <span className="text-[11px] text-slate-400">kg</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(item.exerciseId)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exercise Library Selection */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">운동 라이브러리에서 선택</h3>

            {/* Filter tags & search bar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="운동 이름 검색 (예: 벤치, 스쿼트, 풀다운)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              {/* Muscle group filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {['all', '가슴', '등', '하체', '어깨', '팔', '복근', '유산소'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMuscle(m)}
                    className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                      selectedMuscle === m
                        ? 'bg-[#ccff00] text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m === 'all' ? '전체' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise list grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredExercises.map((ex) => {
                const isAdded = configuredExercises.some((e) => e.exerciseId === ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => !isAdded && handleAddExercise(ex)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isAdded
                        ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-slate-800/60 border-slate-700/70 hover:border-[#ccff00]/50 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">{ex.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {ex.targetMuscle} · 기본 {ex.defaultSets}세트 x {ex.defaultReps}회
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isAdded}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                        isAdded
                          ? 'text-slate-500'
                          : 'bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00] hover:text-slate-950'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> {isAdded ? '추가됨' : '추가'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 예상 소요 시간: 약 {Math.max(20, configuredExercises.length * 12)}분
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || configuredExercises.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ccff00] text-slate-950 hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              루틴 저장 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
