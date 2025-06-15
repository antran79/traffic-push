"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileUp, FileDown, FileCode, Users2, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";

const PER_PAGE = 5;
const PROCESSING_PER_PAGE = 5;

function paginate<T>(array: T[], page: number, perPage: number) {
  return array.slice((page - 1) * perPage, page * perPage);
}

export default function DomainPage() {
  const { toast } = useToast();
  // STATE DATA (từ API, không mock)
  const [domains, setDomains] = useState<any[]>([]);
  const [processingDomains, setProcessingDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [processingPage, setProcessingPage] = useState(1);

  // Search/filter
  const [search, setSearch] = useState("");

  // Dialog state (reuse last logic, will pass handlers prop)
  // ... BỎ TOÀN BỘ mockDomains, fullDomains ...

  // === THÊM DOMAIN (API) ===
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [addDomainLoading, setAddDomainLoading] = useState(false);
  async function handleAddDomainSubmit() {
    const lines = domainInput.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    if (!lines.length) {
      setAddErrors(["Vui lòng nhập ít nhất 1 domain!"]); return;
    }
    setAddDomainLoading(true);
    let errs: string[] = [];
    for (const name of lines) {
      try {
        const res = await fetch("/api/domain", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (!res.ok) errs.push(data.error||"Error");
        else toast({ title: "Thêm domain thành công", description: name });
      } catch (e:any) { errs.push(`Lỗi khi gọi API: ${e.message}`); }
    }
    setAddErrors(errs);
    setAddDomainLoading(false);
    if (errs.length === 0) {
      setShowAddDomain(false); setDomainInput("");
      fetchDomains();
    }
  }

  // === THÊM GROUP (API) ===
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupInput, setGroupInput] = useState("");
  const [groupDomainInput, setGroupDomainInput] = useState("");
  const [groupDomainError, setGroupDomainError] = useState("");
  const [groupAddErrors, setGroupAddErrors] = useState<string[]>([]);
  const [addGroupLoading, setAddGroupLoading] = useState(false);
  async function handleAddGroupSubmit() {
    setGroupDomainError(""); setGroupAddErrors([]);
    if (!groupDomainInput.trim()) {
      setGroupDomainError("Bạn phải nhập domain!"); return;
    }
    if (!domains.some(d=>d.name===groupDomainInput.trim())) {
      setGroupDomainError("Domain không tồn tại!"); return;
    }
    const groupNames = groupInput.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    if (!groupNames.length) {
      setGroupAddErrors(["Vui lòng nhập ít nhất 1 tên group!"]); return;
    }
    setAddGroupLoading(true);
    try {
      const res = await fetch("/api/domain/group", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: groupDomainInput.trim(), groupNames })
      });
      const data = await res.json();
      if (!res.ok) setGroupAddErrors([data.error||"Error"]);
      else {
        toast({ title: "Thêm group thành công", description: `Cho domain ${groupDomainInput.trim()}` });
        setShowAddGroup(false); setGroupInput(""); setGroupDomainInput(""); fetchDomains();
      }
    } catch (e:any) { setGroupAddErrors([e.message]); }
    setAddGroupLoading(false);
  }

  // === TẠO KỊCH BẢN (API) ===
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [scenarioDomain, setScenarioDomain] = useState("");
  const [scenarioDomainError, setScenarioDomainError] = useState("");
  const [scenarioGroup, setScenarioGroup] = useState("");
  const [scenarioGroupError, setScenarioGroupError] = useState("");
  const [scenarioDesc, setScenarioDesc] = useState("");
  const [scenarioDescError, setScenarioDescError] = useState("");
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioApiError, setScenarioApiError] = useState("");
  function getGroupsForDomain(domain: string) {
    const dom = domains.find((d: any) => d.name === domain.trim());
    return dom ? dom.groups : [];
  }
  async function handleScenarioSubmit() {
    let hasError = false;
    if (!scenarioDomain.trim() || !domains.some(d => d.name === scenarioDomain.trim())) {
      setScenarioDomainError("Domain không tồn tại!"); hasError = true;
    } else setScenarioDomainError("");
    const groups = getGroupsForDomain(scenarioDomain.trim());
    const groupObj = groups.find((g: any) => g.groupName === scenarioGroup.trim());
    if (!scenarioGroup.trim() || !groupObj) {
      setScenarioGroupError("Bạn phải chọn group hợp lệ."); hasError = true;
    } else setScenarioGroupError("");
    if (!scenarioDesc.trim()) {
      setScenarioDescError("Bạn phải nhập mô tả mong muốn."); hasError = true;
    } else setScenarioDescError("");
    setScenarioApiError("");
    if (hasError) return;
    setScenarioLoading(true);
    try {
      const res = await fetch("/api/domain/scenario", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: scenarioDomain.trim(), groupName: scenarioGroup.trim(), description: scenarioDesc })
      });
      const data = await res.json();
      if (!res.ok) {
        setScenarioApiError(data.error||"Error");
        setScenarioLoading(false);
      } else {
        toast({ title: "Tạo kịch bản thành công", description: `${scenarioDomain}/${scenarioGroup}` });
        setShowScenarioDialog(false);
        setScenarioDomain(""); setScenarioGroup(""); setScenarioDesc(""); setScenarioApiError(""); fetchDomains(); fetchProcessing();
        setScenarioLoading(false);
      }
    } catch (e:any) { setScenarioApiError(e.message); setScenarioLoading(false); }
  }

  // ===== Fetch liên tục domains & processing =====
  async function fetchDomains() {
    setLoading(true);
    const res = await fetch("/api/domain");
    const data = await res.json();
    setDomains(Array.isArray(data.domains) ? data.domains : []);
    setLoading(false);
  }
  async function fetchProcessing() {
    try {
      const res = await fetch("/api/domain/processing");
      const data = await res.json();
      setProcessingDomains(Array.isArray(data.processing) ? data.processing : []);
    } catch { setProcessingDomains([]); }
  }
  // Reloads khi thao tác hoặc đầu trang
  useEffect(() => {
    fetchDomains();
    fetchProcessing();
    const iv = setInterval(()=> {
      fetchProcessing();
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  // PHÂN TRANG domain
  let filtered = domains;
  if (search.trim()) {
    filtered = domains.filter(d => d.name.toLowerCase().includes(search.trim().toLowerCase()));
  }
  filtered = [...filtered].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pagedDomains = paginate(filtered, currentPage, PER_PAGE);
  const lastPage = Math.ceil(filtered.length / PER_PAGE);

  // ... Sau này tất cả các thao tác add domain/group/scenario chỉ gọi handler API và reload data FE ...
  // ... UI hiện tại giữ nguyên bố cục, tất cả data chỉ dùng domains, processingDomains, loading ...
  // ...

  return (
    <main className="px-5 py-8 max-w-6xl mx-auto">
      {/* 1. Tổng quan - luôn hiện */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8">
        <Card className="flex-1 p-6 flex flex-col items-center justify-center border border-purple-200 bg-white/95 shadow-sm rounded-xl">
          <div className="text-3xl font-bold text-purple-600 mb-1">{domains.length}</div>
          <div className="text-gray-700 text-base text-center font-medium">Domain đang quản lý</div>
        </Card>
        <Card className="flex-1 p-6 flex flex-col items-center justify-center border border-cyan-200 bg-white/95 shadow-sm rounded-xl">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{domains.reduce((acc, d) => acc + (d.groups || []).reduce((gacc: number, g: any) => gacc + (g.scenarios ? g.scenarios.length : 0), 0), 0)}</div>
          <div className="text-gray-700 text-base text-center font-medium">Kịch bản AI đã gen</div>
        </Card>
      </div>

      {/* 2. Khung processing */}
      {processingDomains.length > 0 && (
        <div className="mb-7">
          <Card className="p-4 rounded-2xl border-cyan-200 bg-cyan-50/50 shadow flex flex-col">
            <div className="font-bold text-lg text-cyan-700 mb-3 flex items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                Các domain đang tạo kịch bản AI
              </span>
              <span className="text-xs uppercase tracking-widest text-cyan-700 font-extrabold">ĐANG PROCESSING</span>
            </div>
            <div className="flex flex-col gap-3">
              {paginate(processingDomains.sort((a,b)=>new Date(b.startedAt).getTime()-new Date(a.startedAt).getTime()), processingPage, PROCESSING_PER_PAGE).map(proc => (
                <div key={proc.name + proc.group + proc.startedAt} className="flex flex-col md:flex-row md:items-center md:justify-between py-2 px-3 bg-white/60 border border-cyan-100 rounded-lg shadow-xs">
                  <div>
                    <div className="font-semibold text-blue-900 text-sm">{proc.name}</div>
                    <div className="text-xs text-cyan-600">Group: <span className="font-mono">{proc.group}</span></div>
                    <div className="text-xs text-gray-500">Bắt đầu: {new Date(proc.startedAt).toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 md:mt-0">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-700" />
                    <span className="text-cyan-700 text-xs font-bold">Processing...</span>
                    <span className="hidden md:inline-block text-xs ml-2 text-cyan-500">{proc.description}</span>
                  </div>
                </div>
              ))}
            </div>
            {Math.ceil(processingDomains.length/PROCESSING_PER_PAGE)>1 && (
              <div className="flex justify-end items-center gap-1 mt-3">
                <Button variant="outline" size="sm" onClick={()=>setProcessingPage(p=>Math.max(p-1,1))} disabled={processingPage===1}>←</Button>
                <span className="text-xs px-2">{processingPage}/{Math.ceil(processingDomains.length/PROCESSING_PER_PAGE)}</span>
                <Button variant="outline" size="sm" onClick={()=>setProcessingPage(p=>Math.min(p+1,Math.ceil(processingDomains.length/PROCESSING_PER_PAGE)))} disabled={processingPage===Math.ceil(processingDomains.length/PROCESSING_PER_PAGE)}>→</Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 3. Thanh tìm kiếm, thêm domain, dialog - luôn hiện */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Tìm Domain..."
            className="max-w-xs"
            value={search}
            onChange={e=>setSearch(e.target.value)} />
          <Button variant="outline" size="icon"><Search className="w-5 h-5" /></Button>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Button Thêm domain mới */}
          <Button className="gap-2" onClick={()=>setShowAddDomain(true)}><Plus className="w-5 h-5"/>Thêm domain mới</Button>
          {/* Button Tạo group */}
          <Button variant="outline" className="gap-2" onClick={()=>setShowAddGroup(true)}><Users2 className="w-5 h-5" />Tạo group</Button>
          {/* Button Tạo kịch bản */}
          <Button variant="outline" className="gap-2" onClick={()=>setShowScenarioDialog(true)}><FileCode className="w-5 h-5" />Tạo kịch bản</Button>
          {/* Button Import/Export CSV (để không xử lý) */}
          <Button variant="outline" className="gap-2"><FileUp className="w-5 h-5" />Import CSV</Button>
          <Button variant="outline" className="gap-2"><FileDown className="w-5 h-5" />Export CSV</Button>
        </div>
      </div>

      {/* 4. List domain + group + scenario (Accordion) - loading hoặc empty-render riêng */}
      {loading ? (
        <div className="text-center py-8 text-cyan-700 flex items-center justify-center gap-2"><Loader2 className="animate-spin"/>Đang tải dữ liệu...</div>
      ) : filtered.length === 0 ? (
        <div className="my-10 text-center text-muted-foreground">Chưa có domain nào!</div>
      ) : (
        <>
          <Accordion type="multiple" className="space-y-5">
            {pagedDomains.map(domain => (
              <AccordionItem
                value={domain.name}
                key={domain.name}
                className="border border-purple-100 bg-white rounded-2xl shadow-md px-0"
              >
                <AccordionTrigger className="font-bold text-base md:text-lg text-purple-800 px-7 py-4 rounded-2xl transition-colors justify-between text-left no-underline hover:bg-purple-50 focus:bg-purple-100 group-data-[state=open]:bg-purple-50">
                  <span className="mr-auto">{domain.name}</span>
                  <div className="text-xs text-gray-500 pl-1">{new Date(domain.createdAt).toLocaleString("vi-VN")}</div>
                </AccordionTrigger>
                <AccordionContent className="bg-purple-50/30 rounded-b-2xl px-8 pb-5 pt-2">
                  {(domain.groups||[]).map((group: { groupName: string; scenarios: any[] }) => (
                    <Accordion key={group.groupName} type="single" collapsible className="mb-4">
                      <AccordionItem
                        value={group.groupName}
                        className="border-l-4 border-cyan-200 bg-gradient-to-br from-cyan-50/60 to-white rounded-r-2xl shadow group pl-1"
                      >
                        <AccordionTrigger className="font-semibold text-cyan-800 pl-5 pr-1 py-2 hover:bg-cyan-50/70 rounded text-left justify-between">
                          <span className="mr-auto">{group.groupName}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pl-6 pb-2">
                          <div className="bg-slate-100 border border-cyan-200 rounded-lg p-3 font-mono text-xs text-slate-900 overflow-x-auto select-all shadow-sm whitespace-pre">
                            {JSON.stringify(group.scenarios, null, 2)}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="flex justify-center mt-5">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} aria-disabled={currentPage===1}/>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 text-base">{currentPage}/{lastPage}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(p => Math.min(p + 1, lastPage))} aria-disabled={currentPage===lastPage}/>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}

      {/* --- Dialog Thêm domain --- */}
      <Dialog open={showAddDomain} onOpenChange={setShowAddDomain}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm domain mới</DialogTitle>
            <DialogDescription>
              Nhập 1 hoặc nhiều domain, mỗi domain trên 1 dòng.<br/>Domain hợp lệ: <span className="font-mono">sub.domain.com</span>
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={domainInput}
            rows={5}
            onChange={e => setDomainInput(e.target.value)}
            className="w-full border p-2 rounded bg-slate-50 text-gray-800 font-mono outline-slate-300" autoFocus
            placeholder={"vd:\nexample.com\ndomain2.net"}
          />
          {addErrors.length > 0 && (<ul className="text-red-500 text-sm mt-2 space-y-1">{addErrors.map((err, i) => <li key={i}>{err}</li>)}</ul>)}
          <DialogFooter className="gap-2 flex-row">
            <DialogClose asChild>
              <Button variant="secondary" disabled={addDomainLoading}>Hủy</Button>
            </DialogClose>
            <Button onClick={handleAddDomainSubmit} disabled={addDomainLoading}>{addDomainLoading ? "Đang thêm..." : "Thêm domain"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Dialog Tạo group --- */}
      <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm group kịch bản</DialogTitle>
            <DialogDescription>
              Nhập tên group, mỗi group một dòng.<br />Nhập domain nhóm sẽ thuộc về.
            </DialogDescription>
          </DialogHeader>
          <Input type="text" value={groupDomainInput} onChange={e=>setGroupDomainInput(e.target.value)} className="mb-1 w-full" placeholder="Nhập domain..." autoFocus />
          {groupDomainError && <div className="text-red-500 text-xs mb-2">{groupDomainError}</div>}
          <textarea
            value={groupInput}
            rows={5}
            onChange={e => setGroupInput(e.target.value)}
            className="w-full border p-2 rounded bg-slate-50 text-gray-800 font-mono outline-slate-300"
            placeholder={"vd:\ngroup1\ngroup2"}
          />
          {groupAddErrors.length > 0 && (<ul className="text-red-500 text-sm mt-2 space-y-1">{groupAddErrors.map((err, i) => <li key={i}>{err}</li>)}</ul>)}
          <DialogFooter className="gap-2 flex-row">
            <DialogClose asChild>
              <Button variant="secondary" disabled={addGroupLoading}>Hủy</Button>
            </DialogClose>
            <Button onClick={handleAddGroupSubmit} disabled={addGroupLoading}>{addGroupLoading ? "Đang thêm..." : "Thêm group"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Dialog Tạo kịch bản --- */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo kịch bản AI</DialogTitle>
            <DialogDescription>
              Nhập thông tin domain, group, mô tả kịch bản mong muốn.<br />Sau khi hệ thống xử lý sẽ gửi lại kết quả (giả lập socket).
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nhập domain..."
            value={scenarioDomain}
            onChange={e => { setScenarioDomain(e.target.value); setScenarioGroup(""); }}
            className="mb-1" autoFocus
          />
          {scenarioDomainError && <div className="text-red-500 text-xs mb-2">{scenarioDomainError}</div>}
          <select
            disabled={!scenarioDomain.trim() || !domains.some(d=> d.name===scenarioDomain.trim())}
            className="w-full p-2 mb-1 border rounded text-gray-900 bg-slate-50"
            value={scenarioGroup}
            onChange={e=>setScenarioGroup(e.target.value)}
          >
            <option value="">Chọn group trong domain...</option>
            {getGroupsForDomain(scenarioDomain.trim()).map((g:any) => (
              <option key={g.groupName} value={g.groupName}>{g.groupName}</option>
            ))}
          </select>
          {scenarioGroupError && <div className="text-red-500 text-xs mb-2">{scenarioGroupError}</div>}
          <textarea
            rows={4}
            value={scenarioDesc}
            onChange={e=>setScenarioDesc(e.target.value)}
            className="w-full border p-2 rounded bg-slate-50 text-gray-800 font-mono outline-slate-300 mb-1"
            placeholder="Nhập mô tả mong muốn cho kịch bản..."
          />
          {scenarioDescError && <div className="text-red-500 text-xs mb-2">{scenarioDescError}</div>}
          {scenarioApiError && <div className="text-red-500 text-sm mb-2">{scenarioApiError}</div>}
          <DialogFooter className="gap-2 flex-row">
            <DialogClose asChild>
              <Button variant="secondary" disabled={scenarioLoading}>Đóng</Button>
            </DialogClose>
            <Button onClick={handleScenarioSubmit} disabled={scenarioLoading}>{scenarioLoading ? "Đang gửi..." : "Tạo kịch bản"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  );
}
