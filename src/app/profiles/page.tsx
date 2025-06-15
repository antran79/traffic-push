"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Loader2, Plus, UserPlus2, Users2, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Cấu trúc dữ liệu mock FE
type Profile = {
  id: string;
  name: string;
  browser: string;
  os: string;
  proxy: string;
  createdAt: string;
  userAgent?: string;
  languages?: string | string[];
  timezone?: string;
  latitude?: number | string;
  longitude?: number | string;
  geoAccuracy?: number | string;
  width?: number | string;
  height?: number | string;
  // Add other optional fingerprint fields as needed
};
type ProfileGroup = {
  id: string;
  groupName: string;
  profiles: Profile[];
  createdAt: string;
};

const INIT_GROUPS: ProfileGroup[] = [
  {
    id: "g1",
    groupName: "Google Accounts",
    createdAt: new Date(Date.now() - 1000e3).toISOString(),
    profiles: [
      { id: "p1", name: "Nguyen Van A", browser: "Chrome", os: "Windows", proxy: "", createdAt: new Date().toISOString() },
      { id: "p2", name: "Le Van B", browser: "Firefox", os: "MacOS", proxy: "proxy1:123", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "g2",
    groupName: "Ads Projects",
    createdAt: new Date(Date.now() - 2000e3).toISOString(),
    profiles: []
  }
];

const PAGE_SIZE = 5;

// Mapping phổ biến cho locale/geo/timezone
const LOCALE_MAP = [
  {
    label: "🇻🇳 Việt Nam",
    language: "vi-VN",
    timezone: "Asia/Ho_Chi_Minh",
    latitude: 21.0285,
    longitude: 105.8542,
    accuracy: 80,
    userAgents: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Linux; Android 10; Mi 9T Pro) AppleWebKit/537.36 Chrome/121.0.0.0 Mobile",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0"
    ]
  },
  {
    label: "🇺🇸 Mỹ",
    language: "en-US",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 150,
    userAgents: [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:115.0) Gecko/20100101 Firefox/115.0"
    ]
  },
  {
    label: "🇫🇷 Pháp",
    language: "fr-FR",
    timezone: "Europe/Paris",
    latitude: 48.864716,
    longitude: 2.349014,
    accuracy: 140,
    userAgents: [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 Version/16.0 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 12; Pixel 6 XL) AppleWebKit/537.36 Chrome/123.0.0.0 Mobile"
    ]
  },
  {
    label: "🇯🇵 Nhật Bản",
    language: "ja-JP",
    timezone: "Asia/Tokyo",
    latitude: 35.6895,
    longitude: 139.6917,
    accuracy: 180,
    userAgents: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 Version/16.1 Mobile/15E148 Safari/604.1"
    ]
  },
  {
    label: "🇨🇳 Trung Quốc",
    language: "zh-CN",
    timezone: "Asia/Shanghai",
    latitude: 31.2304,
    longitude: 121.4737,
    accuracy: 160,
    userAgents: [
      "Mozilla/5.0 (Linux; Android 11; M2012K11AC Build/RKQ1.200826.002) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36"
    ]
  },
  {
    label: "Random",
    language: "Random",
    timezone: "Random",
    latitude: "Random",
    longitude: "Random",
    accuracy: "Random",
    userAgents: ["Random"]
  }
];

// Các constant cho các trường fingerprint
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Random"
];
const APP_VERSIONS = [
  "5.0 (Windows)",
  "5.0 (Macintosh)",
  "5.0 (Linux)",
  "5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)",
  "5.0 (Linux; Android 13; SM-S918B)",
  "Random"
];
const PLATFORMS = [
  "Win32",
  "MacIntel",
  "Linux x86_64",
  "iPhone",
  "Android",
  "Random"
];
const VENDORS = [
  "Google Inc.",
  "Apple Computer, Inc.",
  "Mozilla",
  "Random"
];
const PRODUCT_SUBS = [
  "20030107",
  "20100101",
  "Random"
];
const MEMORY_LIST = [4, 8, 16, 32, "Random"];
const CPU_LIST = [2, 4, 8, 16, "Random"];
const WIDTHS = [1366, 1920, 1440, 375, 414, "Random"];
const HEIGHTS = [768, 1080, 900, 667, 896, "Random"];
const DEVICE_SCALE = [1, 2, 3, "Random"];
const LANG_LIST = [
  "en-US,vi-VN",
  "vi-VN,en-US",
  "en-US",
  "fr-FR",
  "ja-JP",
  "zh-CN",
  "Random"
];
const TIMEZONES_RAW = [
  "Asia/Ho_Chi_Minh",
  "America/New_York",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Random"
];
const TZ_LAT = [21.03, 40.71, 48.86, 35.68, 31.23, "Random"];
const TZ_LON = [105.85, -74.00, 2.35, 139.69, 121.47, "Random"];
const ACCURACY = [100, 150, 140, 180, 160, "Random"];
const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge", "Random"];
const OS_LIST = ["Windows", "MacOS", "Linux", "Android", "iOS", "Random"];
const WEBGL_VENDORS = [
  "Google Inc.",
  "Apple Inc.",
  "Intel Inc.",
  "ATI Technologies Inc.",
  "NVIDIA Corporation",
  "Random"
];
const WEBGL_RENDERERS = [
  "ANGLE (Intel, Intel(R) HD Graphics, D3D11)",
  "Apple GPU",
  "AMD Radeon Pro",
  "NVIDIA GeForce",
  "Random"
];
const FONT_PRESETS = [
  "Arial\nTimes New Roman\nTahoma",
  "Roboto\nOpen Sans\nLato",
  "Segoe UI\nCalibri\nConsolas",
  "Helvetica Neue\nCourier New\nVerdana",
  "Random"
];

// Helper hiển thị viewport value
function getViewportString(p: any): string {
  if (typeof p.width === "number" && typeof p.height === "number") return `${p.width} x ${p.height}`;
  if (Number(p.width) && Number(p.height)) return `${p.width} x ${p.height}`;
  return "";
}

// Helper hiển thị quốc gia từ languages
function getCountry(languages: any): string {
  let langArr: string[] = [];
  if (typeof languages === 'string') {
    langArr = languages.split(',').map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(languages)) {
    langArr = languages.map(s => typeof s === 'string' ? s.trim() : '').filter(Boolean);
  }
  for (const l of langArr) {
    if (COUNTRY_BY_LANG[l]) return `${COUNTRY_BY_LANG[l].flag} ${COUNTRY_BY_LANG[l].label}`;
  }
  return "🌏";
}

// Bổ sung state mapping cho locale
export default function ProfilesPage() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<ProfileGroup[]>(INIT_GROUPS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [localeIdx, setLocaleIdx] = useState(0);
  const [uaIdx, setUaIdx] = useState(0);
  const [viewportIdx, setViewportIdx] = useState(0);

  // Dialog Thêm group
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupInput, setGroupInput] = useState("");
  const [addGroupError, setAddGroupError] = useState("");

  // Dialog Thêm profiles
  const [showAddProfileGroupId, setShowAddProfileGroupId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [browser, setBrowser] = useState("Chrome");
  const [os, setOs] = useState("Windows");
  const [proxy, setProxy] = useState("");
  const [profileCount, setProfileCount] = useState(1);

  // Các state còn thiếu cho Dialog Thêm profiles
  const [userAgent, setUserAgent] = useState(USER_AGENTS[0]);
  const [appVersion, setAppVersion] = useState(APP_VERSIONS[0]);
  const [platformValue, setPlatformValue] = useState(PLATFORMS[0]);
  const [vendorValue, setVendorValue] = useState(VENDORS[0]);
  const [productSub, setProductSub] = useState(PRODUCT_SUBS[0]);
  const [deviceMemory, setDeviceMemory] = useState(MEMORY_LIST[0]);
  const [hardwareConcurrency, setHardwareConcurrency] = useState(CPU_LIST[0]);
  const [dnt, setDnt] = useState(false);
  const [languages, setLanguages] = useState(LOCALE_MAP[0].language);
  const [timezone, setTimezone] = useState(LOCALE_MAP[0].timezone);
  const [latitude, setLatitude] = useState(LOCALE_MAP[0].latitude);
  const [longitude, setLongitude] = useState(LOCALE_MAP[0].longitude);
  const [geoAccuracy, setGeoAccuracy] = useState(LOCALE_MAP[0].accuracy);
  const [isMobile, setIsMobile] = useState(false);
  const [hasTouch, setHasTouch] = useState(false);
  const [spoofCanvas, setSpoofCanvas] = useState(false);
  const [spoofWebGL, setSpoofWebGL] = useState(false);
  const [webglVendor, setWebglVendor] = useState(WEBGL_VENDORS[0]);
  const [webglRenderer, setWebglRenderer] = useState(WEBGL_RENDERERS[0]);
  const [canvasNoise, setCanvasNoise] = useState(false);
  const [spoofAudioContext, setSpoofAudioContext] = useState(false);
  const [audioNoise, setAudioNoise] = useState(0);
  const [fonts, setFonts] = useState(FONT_PRESETS[0]);
  const [spoofMediaDevices, setSpoofMediaDevices] = useState(false);

  // State for WebRTC/IP fields
  const [spoofWebRTC, setSpoofWebRTC] = useState(false);
  const [localIp, setLocalIp] = useState("");
  const [publicIp, setPublicIp] = useState("");

  // Dialog Thêm group
  function handleAddGroup() {
    setAddGroupError("");
    const names = groupInput.split(/\r?\n/).map(x => x.trim()).filter(x => x);
    if (!names.length) {
      setAddGroupError("Nhập ít nhất 1 tên group, mỗi dòng là 1 group!");
      return;
    }
    // Kiểm tra đã tồn tại và nhóm hợp lệ mới
    const existed = new Set(groups.map(g => g.groupName.toLowerCase()));
    let added: string[] = [];
    let errors: string[] = [];
    let uniqueInForm: Set<string> = new Set();
    for (const name of names) {
      if (!name) continue;
      if (uniqueInForm.has(name.toLowerCase())) { errors.push(`"${name}" bị trùng trong danh sách.`); continue; }
      uniqueInForm.add(name.toLowerCase());
      if (existed.has(name.toLowerCase())) {
        errors.push(`"${name}" đã có trong danh sách.`); continue;
      }
      added.push(name);
    }
    if (added.length) {
      setGroups(g => [
        ...added.map(groupName => ({
          id: Math.random().toString(36).slice(2),
          groupName,
          createdAt: new Date().toISOString(),
          profiles: []
        })),
        ...g
      ]);
      toast({
        title: `Đã thêm ${added.length} group`,
        description: added.join(", "),
      });
      setShowAddGroup(false); setGroupInput(""); setAddGroupError("");
    }
    if (added.length === 0 && errors.length) setAddGroupError(errors.join(" \n"));
    else if (added.length > 0 && errors.length) toast({title: "Có lỗi với một số group", description: errors.join(" | "), variant: "destructive" });
  }

  // Dialog Thêm profiles
  function handleAddProfile(groupId: string) {
    const baseName = profileName.trim() || "Profile";
    if (profileCount < 1 || profileCount > 50) {
      toast({title: "Giới hạn số lượng profile từ 1-50", variant: "destructive"});
      return;
    }
    setGroups(gs => gs.map(g => g.id===groupId ? {
      ...g,
      profiles: [
        ...Array.from({length: profileCount}, (_, i) => {
          // Xác định locale và userAgent
          let useLocaleIdx = localeIdx;
          if (localeIdx === LOCALE_MAP.length-1) { // Nếu chọn random
            useLocaleIdx = Math.floor(Math.random() * (LOCALE_MAP.length-1));
          }
          const locale = LOCALE_MAP[useLocaleIdx];
          // Random UA trong preset nếu chọn random UA
          let useUaIdx = uaIdx;
          if (uaIdx === 0 || locale.userAgents.length === 1) {
            useUaIdx = Math.floor(Math.random() * locale.userAgents.length);
          }
          const ua = locale.userAgents[useUaIdx];
          // ... viewport như trước ...
          let w = null, h = null;
          if(viewportIdx === 0) {
            const pair = VIEWPORTS[Math.floor(Math.random() * (VIEWPORTS.length - 1)) + 1];
            w = pair.width; h = pair.height; }
          else {
            w = VIEWPORTS[viewportIdx].width;
            h = VIEWPORTS[viewportIdx].height;
          }
          // Các field khác
          // ... dùng như trước, nhưng thay userAgent, languages,... theo locale ...
          return {
            id: Math.random().toString(36).slice(2),
            name: profileCount === 1 ? baseName : `${baseName} #${i + 1}`,
            browser: browser,
            os: os,
            proxy,
            createdAt: new Date().toISOString(),
            userAgent: ua,
            languages: [locale.language],
            timezone: locale.timezone,
            latitude: locale.latitude,
            longitude: locale.longitude,
            geoAccuracy: locale.accuracy,
            width: w, height: h,
            // ... giữ các field fingerprint khác như trước ...
          };
        }), ...g.profiles]
    } : g));
    // Reset form ...
    setShowAddProfileGroupId(null); // <-- Thêm dòng này để đóng Dialog
  }

  // Tìm kiếm
  let filteredGroups = groups;
  const s = search.trim().toLowerCase();
  if (s) {
    filteredGroups = groups
      .map(g => ({ ...g, profiles: g.profiles.filter(p => p.name.toLowerCase().includes(s)) }))
      .filter(g => g.groupName.toLowerCase().includes(s) || g.profiles.length > 0);
  }

  // Phân trang nhóm
  const totalPages = Math.ceil(filteredGroups.length / PAGE_SIZE)||1;
  const pagedGroups = filteredGroups.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="px-5 py-8 max-w-6xl mx-auto">
      {/* Card tổng quan profile & group */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8">
        <Card className="flex-1 p-6 flex flex-col items-center justify-center border border-purple-200 bg-white/95 shadow-sm rounded-xl">
          <div className="text-3xl font-bold text-purple-600 mb-1">{groups.reduce((acc,g)=>acc+g.profiles.length,0)}</div>
          <div className="text-gray-700 text-base text-center font-medium">Profile đang quản lý</div>
        </Card>
        <Card className="flex-1 p-6 flex flex-col items-center justify-center border border-cyan-200 bg-white/95 shadow-sm rounded-xl">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{groups.length}</div>
          <div className="text-gray-700 text-base text-center font-medium">Nhóm (group) profile</div>
        </Card>
      </div>
      {/* Thanh tìm kiếm + button */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex flex-1 gap-2">
          <Input placeholder="Tìm group hoặc profile..." value={search} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button className="gap-2" onClick={()=>setShowAddGroup(true)}><Plus className="w-5 h-5"/>Thêm group</Button>
        </div>
      </div>
      {/* Danh sách group+profile dạng Accordion giống domain */}
      <Accordion type="multiple" className="space-y-5">
        {pagedGroups.map(group => (
          <AccordionItem value={group.id} key={group.id} className="border border-purple-100 bg-white rounded-2xl shadow-md px-0">
            <AccordionTrigger className="font-bold text-base md:text-lg text-purple-800 px-7 py-4 rounded-2xl transition-colors justify-between text-left no-underline hover:bg-purple-50 focus:bg-purple-100 group-data-[state=open]:bg-purple-50">
              <span className="mr-auto">{group.groupName}</span>
              <div className="text-xs text-gray-500 pl-1 flex items-center gap-2">
                <span>{group.profiles.length} profiles</span>
                {/* Đổi Button thành span, hoặc đưa Button ra ngoài AccordionTrigger */}
                <span
                  className="inline-flex items-center gap-1 py-1 px-2 border rounded cursor-pointer hover:bg-cyan-50"
                  onClick={e => {
                    e.stopPropagation();
                    setShowAddProfileGroupId(group.id);
                  }}
                  style={{ userSelect: "none" }}
                >
                  <UserPlus2 className="w-4 h-4" /> Thêm profiles
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-purple-50/30 rounded-b-2xl px-8 pb-5 pt-2">
              {group.profiles.length === 0 ? (
                <div className="bg-slate-50 border border-cyan-200 rounded-lg p-3 text-base text-slate-600 text-center mb-3">Chưa có profile nào.</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="block w-full" style={{maxHeight:240, overflowY:'auto', overflowX:'auto', borderRadius:"10px"}}>
                    <table className="min-w-[600px] w-full border bg-white rounded shadow-sm">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
                        <tr>
                          <th className="p-2">STT</th>
                          <th className="p-2 text-left">User Agent</th>
                          <th className="p-2 text-center">Viewport</th>
                          <th className="p-2 text-center">Quốc gia</th>
                          <th className="p-2 text-center">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.profiles.map((p, i) => {
                          let country = "🌏";
                          if (typeof p.languages === "string" && COUNTRY_BY_LANG[p.languages]) {
                            country = `${COUNTRY_BY_LANG[p.languages].flag} ${COUNTRY_BY_LANG[p.languages].label}`;
                          } else if (Array.isArray(p.languages) && p.languages.length > 0 && COUNTRY_BY_LANG[p.languages[0]]) {
                            country = `${COUNTRY_BY_LANG[p.languages[0]].flag} ${COUNTRY_BY_LANG[p.languages[0]].label}`;
                          }
                          const viewportString = getViewportString(p);
                          return (
                            <tr className="border-b last:border-0 align-middle" key={p.id}>
                              <td className="p-2 text-center align-middle">{i + 1}</td>
                              <td className="p-2 max-w-[240px] truncate align-middle text-left">{p.userAgent || ""}</td>
                              <td className="p-2 text-center align-middle">{viewportString}</td>
                              <td className="p-2 text-center align-middle">{getCountry(p.languages)}</td>
                              <td className="p-2 text-sm text-center align-middle">{new Date(p.createdAt).toLocaleString("vi-VN")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
        {filteredGroups.length === 0 && <div className="my-8 text-center text-muted-foreground">Không có group/profile nào phù hợp.</div>}
      </Accordion>
      {/* Pagination dưới */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-5 gap-2">
          <Button size="sm" variant="outline" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>←</Button>
          <span className="text-sm">Trang {currentPage}/{totalPages}</span>
          <Button size="sm" variant="outline" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>→</Button>
        </div>
      )}
      {/* Dialog Thêm group */}
      <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm group profile mới</DialogTitle>
            <DialogDescription>Nhập tên các group, mỗi dòng là 1 tên group. Không được để trống hoặc trùng lặp.</DialogDescription>
          </DialogHeader>
          <textarea
            autoFocus
            value={groupInput}
            onChange={e=>setGroupInput(e.target.value)}
            className="w-full border p-2 rounded bg-slate-50 text-gray-800 font-mono outline-slate-300"
            rows={6}
            placeholder={`Nhập tên các group, mỗi group 1 dòng\nVí dụ:\nTeam A\nKhách mô phỏng\nDự án Ads`}
          />
          {addGroupError && <div className="text-red-500 text-xs mt-1 whitespace-pre-line">{addGroupError}</div>}
          <DialogFooter className="gap-2 flex-row">
            <DialogClose asChild>
              <Button variant="secondary">Hủy</Button>
            </DialogClose>
            <Button onClick={handleAddGroup}>Thêm group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog Thêm profiles */}
      <Dialog open={!!showAddProfileGroupId} onOpenChange={v=>{if(!v)setShowAddProfileGroupId(null);}}>
        <DialogContent className="max-h-[92vh] overflow-y-auto max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Thêm profile vào group</DialogTitle>
            <DialogDescription>Nhập thông tin fingerprint, các trường hệ locale (Ngôn ngữ/Timezone/Vị trí) luôn đồng bộ. Chọn Random sẽ random đồng bộ cả 3.</DialogDescription>
          </DialogHeader>
          <form onSubmit={e=>{e.preventDefault();if(showAddProfileGroupId)handleAddProfile(showAddProfileGroupId);}}>
            {/* Tên, trình duyệt, os, proxy */}
            <div className="mb-3 mt-1 flex flex-wrap gap-3">
              <Input autoFocus placeholder="Tên profile..." value={profileName} onChange={e=>setProfileName(e.target.value)} className="w-full md:w-96" />

            </div>

            {/* Thông tin Navigator */}
            <div className="bg-blue-50 p-3 rounded border mb-4">
              <div className="font-semibold mb-2">Trình duyệt & Navigator</div>
              <div className="flex flex-wrap gap-3 mb-1 items-center">
                <label className="font-light">User Agent
                  <select className="ml-2 w-56 p-1 border rounded" value={userAgent} onChange={e=>setUserAgent(e.target.value)}>{USER_AGENTS.map(v=><option key={v} value={v}>{v.slice(0,60)}</option>)}</select>
                </label>
                <label className="font-light">appVersion
                  <select className="ml-2 w-32 p-1 border rounded" value={appVersion} onChange={e=>setAppVersion(e.target.value)}>{APP_VERSIONS.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="font-light">platform
                  <select className="ml-2 w-24 p-1 border rounded" value={platformValue} onChange={e=>setPlatformValue(e.target.value)}>{PLATFORMS.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="font-light">vendor
                  <select className="ml-2 w-28 p-1 border rounded" value={vendorValue} onChange={e=>setVendorValue(e.target.value)}>{VENDORS.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="font-light">productSub
                  <select className="ml-2 w-20 p-1 border rounded" value={productSub} onChange={e=>setProductSub(e.target.value)}>{PRODUCT_SUBS.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="font-light">Memory
                  <select className="ml-2 w-14 p-1 border rounded" value={deviceMemory} onChange={e=>setDeviceMemory(isNaN(+e.target.value)?e.target.value:+e.target.value)}>{MEMORY_LIST.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="font-light">Cores
                  <select className="ml-2 w-14 p-1 border rounded" value={hardwareConcurrency} onChange={e=>setHardwareConcurrency(isNaN(+e.target.value)?e.target.value:+e.target.value)}>{CPU_LIST.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="flex gap-1 font-light items-center"><input type="checkbox" checked={dnt} onChange={e=>setDnt(e.target.checked)}/>Do Not Track</label>
              </div>
            </div>

            {/* Viewport & màn hình */}
            <div className="bg-blue-50 p-3 rounded border mb-4">
              <div className="font-semibold mb-2">Màn hình thiết bị</div>
              <div className="flex flex-wrap gap-3 mb-1 items-center">
                <label className="font-light block">Kích thước/loại thiết bị
                  <select className="w-full mt-1 p-1 border rounded" value={viewportIdx} onChange={e=>setViewportIdx(+e.target.value)}>
                    {VIEWPORTS.map((v, idx) => (
                      <option key={v.label} value={idx}>{v.width !== "Random" ? `${v.width} x ${v.height}` : "Random"} {v.label !== "Random" ? `- ${v.label}` : ""}</option>
                    ))}
                  </select>
                </label>
                <label className="flex gap-1 items-center font-light"><input type="checkbox" checked={isMobile} onChange={e=>setIsMobile(e.target.checked)} />Là mobile</label>
                <label className="flex gap-1 items-center font-light"><input type="checkbox" checked={hasTouch} onChange={e=>setHasTouch(e.target.checked)} />Cảm ứng</label>
              </div>
            </div>

            {/* Ngôn ngữ / Timezone / Vị trí ĐỒNG BỘ mapping */}
            <div className="bg-blue-50 p-3 rounded border mb-4">
              <div className="font-semibold mb-2">Địa lý, múi giờ, ngôn ngữ (mapping tự động)</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <label className="font-light block">Quốc gia/Khu vực
                  <select
                    className="mt-1 w-full p-1 border rounded"
                    value={localeIdx}
                    onChange={e => {
                      setLocaleIdx(+e.target.value);
                      // Sync 3 trường liên quan
                      setLanguages(LOCALE_MAP[+e.target.value].language);
                      setTimezone(LOCALE_MAP[+e.target.value].timezone);
                      setLatitude(LOCALE_MAP[+e.target.value].latitude);
                      setLongitude(LOCALE_MAP[+e.target.value].longitude);
                      setGeoAccuracy(LOCALE_MAP[+e.target.value].accuracy);
                    }}>
                    {LOCALE_MAP.map((row, idx) => <option value={idx} key={row.label}>{row.label}</option>)}
                  </select>
                </label>
                <label className="font-light block">Ngôn ngữ (đồng bộ)
                  <Input className="w-full" value={languages} readOnly />
                </label>
                <label className="font-light block">Timezone (đồng bộ)
                  <Input className="w-full" value={timezone} readOnly />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="font-light block">Latitude
                  <Input className="w-full" value={latitude} readOnly />
                </label>
                <label className="font-light block">Longitude
                  <Input className="w-full" value={longitude} readOnly />
                </label>
                <label className="font-light block">Geo accuracy
                  <Input className="w-full" value={geoAccuracy} readOnly />
                </label>
              </div>
            </div>

            {/* WebRTC & IP */}
            <div className="bg-blue-50 p-3 rounded border mb-2">
              <div className="font-semibold mb-2">WebRTC giả lập & Địa chỉ IP</div>
              <div className="flex flex-wrap gap-3 mb-1 items-center">
                <label className="flex items-center gap-2 font-light"><input type="checkbox" checked={spoofWebRTC} onChange={e=>setSpoofWebRTC(e.target.checked)} />Spoof WebRTC</label>
                <label className="font-light">Local IP
                  <Input className="ml-1 w-40" value={localIp} onChange={e=>setLocalIp(e.target.value)} /></label>
                <label className="font-light">Public IP
                  <Input className="ml-1 w-40" value={publicIp} onChange={e=>setPublicIp(e.target.value)} /></label>
              </div>
            </div>

            {/* Canvas & WebGL */}
            <div className="bg-blue-50 p-3 rounded border mb-2">
              <div className="font-semibold mb-2">Canvas & WebGL giả lập</div>
              <div className="flex flex-wrap gap-3 mb-1 items-center">
                <label className="flex items-center gap-2 font-light"><input type="checkbox" checked={spoofCanvas} onChange={e=>setSpoofCanvas(e.target.checked)} />Spoof Canvas</label>
                <label className="flex items-center gap-2 font-light"><input type="checkbox" checked={spoofWebGL} onChange={e=>setSpoofWebGL(e.target.checked)} />Spoof WebGL</label>
                <label className="font-light">WebGL Vendor
                  <select className="ml-2 w-28 p-1 border rounded" value={webglVendor} onChange={e=>setWebglVendor(e.target.value)}>{WEBGL_VENDORS.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="font-light">WebGL Renderer
                  <select className="ml-2 w-40 p-1 border rounded" value={webglRenderer} onChange={e=>setWebglRenderer(e.target.value)}>{WEBGL_RENDERERS.map(v=><option key={v} value={v}>{v}</option>)}</select>
                </label>
                <label className="flex items-center gap-2 font-light"><input type="checkbox" checked={canvasNoise} onChange={e=>setCanvasNoise(e.target.checked)} />Canvas Noise</label>
              </div>
            </div>

            {/* AudioContext */}
            <div className="bg-blue-50 p-3 rounded border mb-2">
              <div className="font-semibold mb-2">AudioContext fingerprint</div>
              <div className="flex flex-wrap gap-3 mb-1 items-center">
                <label className="flex items-center gap-2 font-light"><input type="checkbox" checked={spoofAudioContext} onChange={e=>setSpoofAudioContext(e.target.checked)} />Spoof AudioContext</label>
                <label className="font-light">Audio Noise Seed
                  <Input type="number" className="ml-1 w-20" value={audioNoise} onChange={e=>setAudioNoise(+e.target.value||0)} /></label>
              </div>
            </div>

            {/* Fonts, Media Devices */}
            <div className="bg-blue-50 p-3 rounded border mb-2">
              <div className="font-semibold mb-2">Fonts & Media Devices</div>
              <div className="flex flex-wrap gap-3 mb-1 items-center">
                <label className="font-light block">Fonts (preset)
                  <select className="w-52 text-xs block mt-1 border rounded px-1 py-1" value={fonts} onChange={e=>setFonts(e.target.value)}>{FONT_PRESETS.map(v=><option key={v} value={v}>{v.split("\n").slice(0,2).join(', ')}</option>)}</select>
                </label>
                <label className="flex items-center gap-2 font-light"><input type="checkbox" checked={spoofMediaDevices} onChange={e=>setSpoofMediaDevices(e.target.checked)} />Spoof MediaDevices</label>
              </div>
            </div>

            {/* Số lượng profile */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-3 mb-3">
              <label className="font-medium text-sm">Số lượng profile muốn tạo</label>
              <Input type="number" min={1} max={50} className="w-20" value={profileCount} onChange={e=>setProfileCount(Math.max(1,Math.min(50,+e.target.value||1)))} />
            </div>
            <DialogFooter className="gap-2 flex-row mt-2">
              <DialogClose asChild>
                <Button variant="secondary">Hủy</Button>
              </DialogClose>
              <Button type="submit">Thêm profile</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

// Helper hàm random
function randomPick(arr:any[]) {
  return arr[Math.floor(Math.random()* (arr.length - 1)) + 1];
}
function randomNum(arr:any[], min:number, max:number) {
  if (arr[0]==="Random") arr=arr.slice(1);
  const pool = arr.filter(v=>typeof v==="number");
  if (pool.length) return randomPick(arr);
  return Math.floor(Math.random()*(max-min+1))+min;
}

const COUNTRY_BY_LANG: Record<string, { label: string, flag: string }> = {
  "vi-VN": { label: "Việt Nam", flag: "🇻🇳" },
  "en-US": { label: "Mỹ", flag: "🇺🇸" },
  "fr-FR": { label: "Pháp", flag: "🇫🇷" },
  "zh-CN": { label: "Trung Quốc", flag: "🇨🇳" },
  "ja-JP": { label: "Nhật Bản", flag: "🇯🇵" }
};

const VIEWPORTS = [
  { width: "Random", height: "Random", label: "Random" },
  { width: 1920, height: 1080, label: "Desktop HD (1920x1080)" },
  { width: 1366, height: 768, label: "Laptop HD (1366x768)" },
  { width: 1536, height: 864, label: "Laptop FHD (1536x864)" },
  { width: 1440, height: 900, label: "MacBook Pro (1440x900)" },
  { width: 1280, height: 800, label: "MacBook Air (1280x800)" },
  { width: 375, height: 667, label: "iPhone 8 (375x667)" },
  { width: 414, height: 896, label: "iPhone XR/11 (414x896)" },
  { width: 390, height: 844, label: "iPhone 12/13 (390x844)" },
  { width: 393, height: 851, label: "Pixel 6 (393x851)" }
];
