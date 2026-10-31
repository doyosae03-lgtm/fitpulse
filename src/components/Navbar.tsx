import { Dumbbell, Play, Utensils, BarChart3, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';

export type ActiveTab = 'routines' | 'workout' | 'diet' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasActiveWorkout: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSeedDemo: () => void;
  onReset: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  hasActiveWorkout,
  soundEnabled,
  onToggleSound,
  onSeedDemo,
  onReset,
}: NavbarProps) {
  const tabs: { id: ActiveTab; label: string; icon: typeof Dumbbell; hasBadge?: boolean }[] = [
    { id: 'routines', label: '운동 루틴', icon: Dumbbell },
    { id: 'workout', label: '실시간 기록', icon: Play, hasBadge: hasActiveWorkout },
    { id: 'diet', label: '식단 & 매크로', icon: Utensils },
    { id: 'analytics', label: '통계 & 분석', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Bar */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ccff00] to-[#00f0ff] p-[1.5px] shadow-lg shadow-[#ccff00]/10">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center text-[#ccff00]">
                <Dumbbell className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                Fit<span className="text-[#ccff00]">Pulse</span>
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800/80 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#ccff00] text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.hasBadge && (
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#ccff00]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onSeedDemo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              title="발표 시연용 샘플 데이터 채우기"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" /> 데모 데이터 채우기
            </button>

            <button
              onClick={() => {
                if (window.confirm('모든 기록을 초기화하시겠습니까?')) {
                  onReset();
                }
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
              title="데이터 전체 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1">
        <div className="grid grid-cols-4 items-center h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 relative min-h-[44px] transition-colors ${
                  isActive ? 'text-[#ccff00]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
                  {tab.label}
                </span>
                {tab.hasBadge && (
                  <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
