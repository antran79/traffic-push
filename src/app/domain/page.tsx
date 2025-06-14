"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileUp, FileDown, FileCode, Users2 } from "lucide-react";
import React, { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// MOCK DATA NHIỀU DOMAIN
const MOCK_DOMAINS = Array.from({ length: 16 }, (_, i) => ({
  name: `domain${i + 1}.com`,
  createdAt: new Date(Date.now() - 1000*60*60*24*i).toISOString(),
  groups: [
    {
      groupName: `AI Group 1-${i+1}`,
      scenarios: [
        { name: "Kịch bản 1", data: { url: "http://a.com", actions: ["click", "input"] } },
        { name: "Kịch bản 2", data: { url: "http://b.com", actions: ["wait", "submit"] } }
      ]
    },
    {
      groupName: `AI Group 2-${i+1}`,
      scenarios: [
        { name: "Scenario A", data: { url: "http://c.com", actions: ["scroll"] } },
        { name: "Scenario B", data: { url: "http://d.com", actions: ["hover", "select"] } }
      ]
    }
  ]
}));

const totalDomains = MOCK_DOMAINS.length;
const totalScenarios = MOCK_DOMAINS.reduce(
  (acc, dom) =>
    acc + dom.groups.reduce((gacc, g) => gacc + g.scenarios.length, 0),
  0
);

// PHÂN TRANG
const PER_PAGE = 5;
function paginate<T>(array: T[], page: number, perPage: number) {
  return array.slice((page - 1) * perPage, page * perPage);
}

const PROCESSING_PER_PAGE = 5;
function paginateProc<T>(array: T[], page: number, perPage: number) {
  return array.slice((page - 1) * perPage, page * perPage);
}

export default function DomainPage() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const lastPage = Math.ceil(MOCK_DOMAINS.length / PER_PAGE);
  const [showDialog, setShowDialog] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [addErrors, setAddErrors] = useState([]);
  const [fullDomains, setFullDomains] = useState([...MOCK_DOMAINS]);
  const sortedDomains = [...fullDomains].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const domainsPage = paginate(sortedDomains, currentPage, PER_PAGE);

  // Regex tên miền chuẩn: ký tự, số, dấu -, dấu chấm giữa các phần, không http/https.
  const DOMAIN_REGEX = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})*$/;

  const [processingDomains, setProcessingDomains] = useState<{
    name: string,
    startedAt: string,
    group: string,
    description: string
  }[]>([]);
  const [processingPage, setProcessingPage] = useState(1);
  const sortedProcessingDomains = [...processingDomains].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  const pagedProcessing = paginateProc(sortedProcessingDomains, processingPage, PROCESSING_PER_PAGE);
  const totalProcPages = Math.ceil(processingDomains.length / PROCESSING_PER_PAGE);

  const handleAddDomainSubmit = () => {
    const lines = domainInput.split(/\r?\n/).map(l => l.trim()).filter(x => x);
    let errors: string[] = [];
    let domainsToAdd: string[] = [];
    for (let line of lines) {
      if (!DOMAIN_REGEX.test(line)) {
        errors.push(`Tên miền không hợp lệ: “${line}”`);
      } else if (fullDomains.some(d => d.name.toLowerCase() === line.toLowerCase())) {
        errors.push(`Tên miền đã tồn tại: “${line}”`);
      } else {
        domainsToAdd.push(line);
      }
    }
    setAddErrors(errors);
    if (errors.length === 0 && domainsToAdd.length > 0) {
      setFullDomains(prev => [
        ...domainsToAdd.map(name => ({
          name,
          createdAt: new Date().toISOString(),
          groups: []
        })),
        ...prev
      ]);
      setShowDialog(false);
      setDomainInput("");
      toast({ title: "Thêm domain thành công", description: `${domainsToAdd.length} domain đã thêm mới!`, variant: "default" });
    }
  };

  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [groupInput, setGroupInput] = useState("");
  const [groupDomainInput, setGroupDomainInput] = useState("");
  const [groupDomainError, setGroupDomainError] = useState("");
  const [groupAddErrors, setGroupAddErrors] = useState<string[]>([]);

  const handleGroupDomainBlur = () => {
    if (!groupDomainInput.trim()) setGroupDomainError("Bạn phải nhập domain!");
    else if (!fullDomains.some(d => d.name === groupDomainInput.trim()))
      setGroupDomainError("Domain không tồn tại trong hệ thống!");
    else setGroupDomainError("");
  };

  const handleAddGroupSubmit = () => {
    const domainValue = groupDomainInput.trim();
    const groupNames = groupInput.split(/\r?\n/).map(x=>x.trim()).filter(x=>!!x);
    const err: string[] = [];
    let domainOk = false;
    if (!domainValue) {
      setGroupDomainError("Bạn phải nhập domain!");
    } else if (!fullDomains.some(d => d.name === domainValue)) {
      setGroupDomainError("Domain không tồn tại trong hệ thống!");
    } else {
      setGroupDomainError("");
      domainOk = true;
    }
    const foundDomain = fullDomains.find(d => d.name === domainValue);
    let validGroups: string[] = [];
    if (foundDomain && domainOk)
      for (let name of groupNames) {
        if (!name) err.push("Không được để trống tên group!");
        else if (foundDomain.groups.some(g => g.groupName === name)) err.push(`Group "${name}" đã tồn tại trong domain này!`);
        else validGroups.push(name);
      }
    setGroupAddErrors(err);
    if (!groupDomainError && err.length === 0 && validGroups.length && foundDomain) {
      setFullDomains(prev =>
        prev.map(d =>
          d.name === domainValue ? {
            ...d,
            groups: [...d.groups, ...validGroups.map(groupName => ({ groupName, scenarios: [] }))]
          } : d
        )
      );
      setShowGroupDialog(false);
      setGroupInput("");
      setGroupDomainInput("");
      setGroupAddErrors([]);
      setGroupDomainError("");
      toast({ title: "Thêm group thành công", description: `${validGroups.length} group đã thêm cho domain ${domainValue}.`, variant: "default" });
    }
  };

  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [scenarioDomain, setScenarioDomain] = useState("");
  const [scenarioDomainError, setScenarioDomainError] = useState("");
  const [scenarioGroup, setScenarioGroup] = useState("");
  const [scenarioGroupError, setScenarioGroupError] = useState("");
  const [scenarioDesc, setScenarioDesc] = useState("");
  const [scenarioDescError, setScenarioDescError] = useState("");
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<string | null>(null);
  const [scenarioApiError, setScenarioApiError] = useState("");

  function getGroupsForDomain(domain: string) {
    const dom = fullDomains.find(d => d.name === domain.trim());
    return dom ? dom.groups : [];
  }

  const handleScenarioSubmit = () => {
    let hasError = false;
    if (!scenarioDomain.trim() || !fullDomains.some(d => d.name === scenarioDomain.trim())) {
      setScenarioDomainError("Domain không tồn tại!");
      hasError = true;
    } else setScenarioDomainError("");

    const groups = getGroupsForDomain(scenarioDomain.trim());
    const groupObj = groups.find(g => g.groupName === scenarioGroup.trim());
    if (!scenarioGroup.trim() || !groupObj) {
      setScenarioGroupError("Bạn phải chọn group hợp lệ.");
      hasError = true;
    } else setScenarioGroupError("");

    if (!scenarioDesc.trim()) {
      setScenarioDescError("Bạn phải nhập mô tả mong muốn.");
      hasError = true;
    } else setScenarioDescError("");

    setScenarioApiError("");
    if (hasError) return;
    setScenarioLoading(true);
    // Thêm domain vào danh sách processing
    setProcessingDomains(proc => [{
      name: scenarioDomain.trim(),
      startedAt: new Date().toISOString(),
      group: scenarioGroup.trim(),
      description: scenarioDesc.trim()
    }, ...proc]);

    // Giả lập gọi API: group đã có data sẽ trả về lỗi (không được tạo kịch bản mới).
    setTimeout(() => {
      setScenarioLoading(false);
      if (groupObj && groupObj.scenarios.length > 0) {
        setScenarioApiError("Group này đã có kịch bản, không được tạo mới!");
        // Xóa khỏi processing (vì thất bại)
        setProcessingDomains(proc => proc.filter(p => !(p.name === scenarioDomain.trim() && p.group === scenarioGroup.trim())));
      } else {
        toast({ title: "Tạo kịch bản thành công", description: `${scenarioDomain}/${scenarioGroup}`, variant: "default" });
        setShowScenarioDialog(false);
        setScenarioDomain("");
        setScenarioGroup("");
        setScenarioDesc("");
        setScenarioResult(null);
        setScenarioDomainError("");
        setScenarioGroupError("");
        setScenarioDescError("");
        setScenarioApiError("");
        // Sau 5s sẽ tự xóa khỏi danh sách processing (giả lập xong socket)
        setTimeout(() => setProcessingDomains(proc => proc.filter(p => !(p.name === scenarioDomain.trim() && p.group === scenarioGroup.trim()))), 5000);
      }
    }, 1600);
  };

  const handleScenarioClose = () => {
    setShowScenarioDialog(false);
    setScenarioDomain("");
    setScenarioGroup("");
    setScenarioDesc("");
    setScenarioResult(null);
    setScenarioDomainError("");
    setScenarioGroupError("");
    setScenarioDescError("");
  };

  return (
    <main className="px-5 py-8 max-w-6xl mx-auto">
      {/* 1. Tổng quan */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8">
        <Card className="flex-1 p-6 flex flex-col items-center justify-center border border-purple-200 bg-white/95 shadow-sm rounded-xl">
          <div className="text-3xl font-bold text-purple-600 mb-1">{totalDomains}</div>
          <div className="text-gray-700 text-base text-center font-medium">Domain đang quản lý</div>
        </Card>
        <Card className="flex-1 p-6 flex flex-col items-center justify-center border border-cyan-200 bg-white/95 shadow-sm rounded-xl">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{totalScenarios}</div>
          <div className="text-gray-700 text-base text-center font-medium">Kịch bản AI đã gen</div>
        </Card>
      </div>

      {/* 2. Danh sách domain đang processing */}
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
              {pagedProcessing.map(proc => (
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
            {totalProcPages > 1 && (
              <div className="flex justify-end items-center gap-1 mt-3">
                <Button variant="outline" size="sm" onClick={()=>setProcessingPage(p=>Math.max(p-1,1))} disabled={processingPage===1}>←</Button>
                <span className="text-xs px-2">{processingPage}/{totalProcPages}</span>
                <Button variant="outline" size="sm" onClick={()=>setProcessingPage(p=>Math.min(p+1,totalProcPages))} disabled={processingPage===totalProcPages}>→</Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 3. Tìm kiếm, thêm domain, các dialog: luôn phía dưới processing! */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
        <div className="flex flex-1 gap-2">
          <Input placeholder="Tìm Domain..." className="max-w-xs" />
          <Button variant="outline" size="icon"><Search className="w-5 h-5" /></Button>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setShowDialog(true)}><Plus className="w-5 h-5" />Thêm domain</Button>
            </DialogTrigger>
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
                className="w-full border p-2 rounded bg-slate-50 text-gray-800 font-mono outline-slate-300"
                autoFocus
                placeholder={"vd:\nexample.com\ndomain2.net"}
              />
              {addErrors.length > 0 && (
                <ul className="text-red-500 text-sm mt-2 space-y-1">
                  {addErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
              <DialogFooter className="gap-2 flex-row">
                <DialogClose asChild>
                  <Button variant="secondary">Hủy</Button>
                </DialogClose>
                <Button onClick={handleAddDomainSubmit}>Thêm domain</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={() => setShowGroupDialog(true)}><Users2 className="w-5 h-5" />Tạo group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm group kịch bản</DialogTitle>
                <DialogDescription>
                  Nhập tên group, mỗi group một dòng. <br/>Nhập domain nhóm sẽ thuộc về.
                </DialogDescription>
              </DialogHeader>
              <Input
                type="text"
                value={groupDomainInput}
                onChange={e => setGroupDomainInput(e.target.value)}
                onBlur={handleGroupDomainBlur}
                className="mb-1 w-full"
                placeholder="Nhập domain..."
                autoFocus
              />
              {groupDomainError && <div className="text-red-500 text-xs mb-2">{groupDomainError}</div>}
              <textarea
                value={groupInput}
                rows={5}
                onChange={e => setGroupInput(e.target.value)}
                className="w-full border p-2 rounded bg-slate-50 text-gray-800 font-mono outline-slate-300"
                placeholder={"vd:\ngroup1\ngroup2"}
              />
              {groupAddErrors.length > 0 && (
                <ul className="text-red-500 text-sm mt-2 space-y-1">
                  {groupAddErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
              <DialogFooter className="gap-2 flex-row">
                <DialogClose asChild>
                  <Button variant="secondary">Hủy</Button>
                </DialogClose>
                <Button onClick={handleAddGroupSubmit}>Thêm group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={() => setShowScenarioDialog(true)}><FileCode className="w-5 h-5" />Tạo kịch bản</Button>
            </DialogTrigger>
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
                onChange={e => {
                  setScenarioDomain(e.target.value);
                  setScenarioGroup(""); // clear group nếu domain đổi
                }}
                className="mb-1"
                autoFocus
              />
              {scenarioDomainError && <div className="text-red-500 text-xs mb-2">{scenarioDomainError}</div>}
              <select
                disabled={!scenarioDomain.trim() || !fullDomains.some(d=> d.name===scenarioDomain.trim())}
                className="w-full p-2 mb-1 border rounded text-gray-900 bg-slate-50"
                value={scenarioGroup}
                onChange={e=>setScenarioGroup(e.target.value)}
              >
                <option value="">Chọn group trong domain...</option>
                {getGroupsForDomain(scenarioDomain.trim()).map(g => (
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
              {scenarioLoading && <div className="text-xs text-blue-600 my-2">Đang gửi yêu cầu...</div>}
              {scenarioResult && (
                <div className="my-2 bg-green-50 border border-green-300 rounded text-xs p-2 font-mono whitespace-pre-wrap text-green-900">
                  {scenarioResult}
                </div>
              )}
              {scenarioApiError && <div className="text-red-500 text-sm mb-2">{scenarioApiError}</div>}
              <DialogFooter className="gap-2 flex-row">
                <DialogClose asChild>
                  <Button variant="secondary" onClick={handleScenarioClose}>Đóng</Button>
                </DialogClose>
                <Button onClick={handleScenarioSubmit} disabled={scenarioLoading}>Tạo kịch bản</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2"><FileUp className="w-5 h-5" />Import CSV</Button>
          <Button variant="outline" className="gap-2"><FileDown className="w-5 h-5" />Export CSV</Button>
        </div>
      </div>

      {/* Quản lý domain + nhóm kịch bản: Accordion canh trái, màu sắc sáng đẹp */}
      <Accordion type="multiple" className="space-y-5">
        {domainsPage.map(domain => (
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
              {domain.groups.map(group => (
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
    </main>
  );
}
