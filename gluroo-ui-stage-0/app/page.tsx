"use client";

import { useMemo, useState } from "react";
import { Activity, Bell, Camera, HeartPulse, Home, PlusCircle, Salad, Users, Waves, X } from "lucide-react";

type Tab = "home" | "log" | "crew";

type EventItem = {
  id: string;
  time: string;
  type: "meal" | "insulin" | "exercise" | "alert";
  title: string;
  detail: string;
};

const events: EventItem[] = [
  { id: "e1", time: "08:30", type: "meal", title: "早餐", detail: "碳水估算 42g（AI 拍照）" },
  { id: "e2", time: "08:45", type: "insulin", title: "胰岛素", detail: "快速胰岛素 4U" },
  { id: "e3", time: "10:10", type: "exercise", title: "运动", detail: "步行 18 分钟（Apple Health）" },
  { id: "e4", time: "11:05", type: "alert", title: "提醒", detail: "血糖偏低预警，建议补充 15g 碳水" },
];

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [showCarbModal, setShowCarbModal] = useState(false);
  const glucose = 132;
  const delta = +7;

  const statusColor = useMemo(() => {
    if (glucose < 80) return "text-amber-600";
    if (glucose > 180) return "text-rose-600";
    return "text-emerald-600";
  }, [glucose]);

  return (
    <main className="min-h-screen bg-[#eef6ff] p-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h1 className="text-3xl font-bold text-slate-900">Gluroo 风格高保真原型</h1>
          <p className="mt-2 text-slate-600">移动端糖尿病管理 UI（Dashboard / 日志 / 协作）</p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">界面说明</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>首页：实时血糖卡片 + 趋势 + 快速操作</li>
              <li>日志：餐食/胰岛素/运动/提醒时间线</li>
              <li>协作：GluCrew 成员与共享状态</li>
              <li>视觉风格：圆角卡片 + 清晰层级 + 医疗蓝绿色系</li>
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-sm rounded-[2.2rem] border-8 border-slate-900 bg-slate-900 p-2 shadow-2xl">
          <div className="overflow-hidden rounded-[1.6rem] bg-[#f8fbff]">
            <header className="flex items-center justify-between bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-white">
              <div>
                <p className="text-xs opacity-90">Good morning</p>
                <p className="text-lg font-semibold">Henry</p>
              </div>
              <Bell className="h-5 w-5" />
            </header>

            <div className="px-4 pb-24 pt-4">
              {tab === "home" && (
                <>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">当前血糖 (mg/dL)</p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className={`text-4xl font-extrabold ${statusColor}`}>{glucose}</span>
                      <span className="pb-1 text-sm text-slate-500">{delta >= 0 ? `+${delta}` : delta} / 5min</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                      <Waves className="h-4 w-4" />
                      趋势：稳中略升
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <QuickCard
                      icon={<Camera className="h-5 w-5" />}
                      title="拍照估碳"
                      desc="识别食物碳水"
                      onClick={() => setShowCarbModal(true)}
                    />
                    <QuickCard icon={<PlusCircle className="h-5 w-5" />} title="记录胰岛素" desc="快速录入剂量" />
                    <QuickCard icon={<Salad className="h-5 w-5" />} title="添加餐食" desc="早餐/午餐/晚餐" />
                    <QuickCard icon={<Activity className="h-5 w-5" />} title="同步运动" desc="读取 Health 数据" />
                  </div>
                </>
              )}

              {tab === "log" && (
                <div className="space-y-3">
                  {events.map((e) => (
                    <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{e.time}</span>
                        <Tag type={e.type} />
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{e.title}</p>
                      <p className="text-sm text-slate-600">{e.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "crew" && (
                <div className="space-y-3">
                  <CrewItem name="Henry（本人）" role="PWD" status="在线" />
                  <CrewItem name="Mom" role="Caregiver" status="已接收提醒" />
                  <CrewItem name="Dr. Lee" role="Endocrinologist" status="本周查看日志" />

                  <div className="mt-3 rounded-xl border border-dashed border-cyan-300 bg-cyan-50 p-3 text-sm text-cyan-700">
                    数据共享状态：已同步到 GluCrew（最近更新 2 分钟前）
                  </div>
                </div>
              )}
            </div>

            <nav className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-sm items-center justify-around border-t border-slate-200 bg-white py-3">
              <NavBtn active={tab === "home"} onClick={() => setTab("home")} icon={<Home className="h-5 w-5" />} label="首页" />
              <NavBtn active={tab === "log"} onClick={() => setTab("log")} icon={<HeartPulse className="h-5 w-5" />} label="日志" />
              <NavBtn active={tab === "crew"} onClick={() => setTab("crew")} icon={<Users className="h-5 w-5" />} label="GluCrew" />
            </nav>
          </div>
        </section>
      </div>

      {showCarbModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">拍照估碳</h3>
              <button onClick={() => setShowCarbModal(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-4 text-center">
              <Camera className="mx-auto h-8 w-8 text-cyan-600" />
              <p className="mt-2 text-sm font-medium text-slate-800">上传/拍摄餐食照片</p>
              <p className="text-xs text-slate-500">示例：米饭 + 鸡胸肉 + 西兰花</p>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">AI 识别结果（示例）</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>米饭（约 120g）→ 碳水 33g</li>
                <li>西兰花（约 80g）→ 碳水 5g</li>
                <li>鸡胸肉（约 100g）→ 碳水 0g</li>
              </ul>
              <p className="mt-3 text-base font-bold text-cyan-700">总估算碳水：38g</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">重拍</button>
              <button className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">保存到日志</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function QuickCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="rounded-xl bg-white p-3 text-left shadow-sm transition hover:shadow">
      <div className="text-cyan-600">{icon}</div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </button>
  );
}

function Tag({ type }: { type: EventItem["type"] }) {
  const map = {
    meal: "bg-amber-100 text-amber-700",
    insulin: "bg-blue-100 text-blue-700",
    exercise: "bg-emerald-100 text-emerald-700",
    alert: "bg-rose-100 text-rose-700",
  };
  const label = { meal: "餐食", insulin: "胰岛素", exercise: "运动", alert: "提醒" }[type];

  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[type]}`}>{label}</span>;
}

function CrewItem({ name, role, status }: { name: string; role: string; status: string }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <p className="font-semibold text-slate-900">{name}</p>
      <p className="text-xs text-slate-500">{role}</p>
      <p className="mt-1 text-sm text-cyan-700">{status}</p>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 text-xs ${active ? "text-cyan-600" : "text-slate-500"}`}>
      {icon}
      {label}
    </button>
  );
}
