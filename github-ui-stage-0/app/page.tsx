import { Search, Bell, Plus, GitBranch, Star, Eye, GitFork, Folder, FileText, Settings } from "lucide-react";

const files = [
  { name: "chinese-chess-stage-0", message: "Move existing project into chinese-chess-stage-0 folder", time: "1 hour ago", type: "folder" },
  { name: "data/diabetes_analysis", message: "Add SVM model analysis with feature importance", time: "4 minutes ago", type: "folder" },
  { name: "todo-reminder-stage-0", message: "Add energetic todo reminder web app", time: "1 hour ago", type: "folder" },
  { name: ".gitignore", message: "Remove transient .next artifacts", time: "1 hour ago", type: "file" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f8fa] text-[#1f2328]">
      <header className="border-b border-[#d0d7de] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-black" />
            <div className="text-sm text-[#57606a]">World-Worst-Detector / <span className="font-semibold text-[#1f2328]">openclawProject</span></div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-sm text-[#57606a]">
              <Search size={14} /> Type / to search
            </div>
            <Bell size={18} className="text-[#57606a]" />
            <Plus size={18} className="text-[#57606a]" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-semibold">openclawProject <span className="ml-2 rounded-full border border-[#d0d7de] px-2 py-0.5 text-xs text-[#57606a]">Public</span></h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <button className="rounded-md border border-[#d0d7de] bg-white px-3 py-1.5">main</button>
              <button className="rounded-md border border-[#d0d7de] bg-white px-3 py-1.5">1 Branch</button>
              <button className="rounded-md border border-[#d0d7de] bg-white px-3 py-1.5">0 Tags</button>
              <div className="ml-auto flex gap-2">
                <button className="rounded-md border border-[#d0d7de] bg-white px-3 py-1.5">Go to file</button>
                <button className="rounded-md border border-[#d0d7de] bg-[#2da44e] px-3 py-1.5 text-white">Code</button>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-[#d0d7de] bg-white">
              <div className="flex items-center gap-2 border-b border-[#d0d7de] px-4 py-3 text-sm">
                <GitBranch size={15} className="text-[#57606a]" />
                <span className="font-medium">World-Worst-Detector</span>
                <span className="text-[#57606a]">Add SVM model analysis with feature importance...</span>
                <span className="ml-auto text-[#57606a]">7 Commits</span>
              </div>

              <ul>
                {files.map((f) => (
                  <li key={f.name} className="grid grid-cols-12 items-center border-b border-[#d8dee4] px-4 py-3 text-sm last:border-0">
                    <div className="col-span-5 flex items-center gap-2 font-medium text-[#0969da]">
                      {f.type === "folder" ? <Folder size={16} /> : <FileText size={16} />}
                      {f.name}
                    </div>
                    <div className="col-span-5 text-[#57606a]">{f.message}</div>
                    <div className="col-span-2 text-right text-[#57606a]">{f.time}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-md border border-[#d0d7de] bg-white p-8 text-center">
              <h2 className="mb-2 text-xl font-semibold">Add a README</h2>
              <p className="mb-4 text-sm text-[#57606a]">Help people interested in this repository understand your project.</p>
              <button className="rounded-md bg-[#2da44e] px-4 py-2 text-sm font-medium text-white">Add a README</button>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="mb-3 flex flex-wrap gap-2 text-sm">
              <button className="flex items-center gap-1 rounded-md border border-[#d0d7de] bg-white px-3 py-1.5"><Eye size={14} /> Watch 0</button>
              <button className="flex items-center gap-1 rounded-md border border-[#d0d7de] bg-white px-3 py-1.5"><GitFork size={14} /> Fork 0</button>
              <button className="flex items-center gap-1 rounded-md border border-[#d0d7de] bg-white px-3 py-1.5"><Star size={14} /> Star 0</button>
            </div>

            <div className="rounded-md border border-[#d0d7de] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">About</h3>
                <Settings size={15} className="text-[#57606a]" />
              </div>
              <p className="mb-4 text-sm text-[#57606a]">No description, website, or topics provided.</p>

              <div className="space-y-2 text-sm text-[#57606a]">
                <p>⭐ 0 stars</p>
                <p>👀 0 watching</p>
                <p>🍴 0 forks</p>
              </div>

              <hr className="my-4 border-[#d8dee4]" />
              <h4 className="mb-2 font-medium">Releases</h4>
              <p className="mb-3 text-sm text-[#57606a]">No releases published</p>
              <h4 className="mb-2 font-medium">Packages</h4>
              <p className="text-sm text-[#57606a]">No packages published</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
