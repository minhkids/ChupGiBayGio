import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, LoaderCircle, Upload, X } from 'lucide-react';
import { readSheet } from 'read-excel-file/browser';
import type { ServiceCategory } from '../../services/serviceHubApi';
import { bulkTemplateHeaders, parseBulkRows, type BulkParseResult, type BulkRecord } from './bulkImport';

interface Props {
  category: ServiceCategory;
  onImport: (records: BulkRecord[]) => Promise<{ imported: number; failures: { index: number; message: string }[] }>;
}

export const BulkImportPanel = ({ category, onImport }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parseResult, setParseResult] = useState<BulkParseResult | null>(null);
  const [filename, setFilename] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const downloadTemplate = () => {
    const headers = bulkTemplateHeaders(category);
    const csv = `\uFEFF${headers.join(',')}\r\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `mau-import-${category}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const readFile = async (file?: File) => {
    setParseResult(null); setStatus(''); setFilename('');
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) { setStatus('Chọn tệp Excel .xlsx. Tệp .xls cũ cần lưu lại thành .xlsx trước khi nhập.'); return; }
    if (file.size > 10 * 1024 * 1024) { setStatus('Tệp tối đa 10 MB.'); return; }
    setBusy(true);
    try {
      const sheet = await readSheet(file);
      const parsed = parseBulkRows(category, sheet as unknown as unknown[][]);
      if (parsed.records.length + parsed.errors.length > 1000) { setStatus('Mỗi lần nhập tối đa 1.000 dòng.'); return; }
      setParseResult(parsed); setFilename(file.name);
      if (parsed.records.length === 0) setStatus('Không có dòng hợp lệ để nhập. Kiểm tra tiêu đề cột và dữ liệu.');
    } catch (error) {
      setStatus(error instanceof Error ? `Không đọc được Excel: ${error.message}` : 'Không đọc được tệp Excel.');
    } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  const importRows = async () => {
    if (!parseResult?.records.length) return;
    setBusy(true); setStatus('');
    try {
      const current = parseResult;
      const result = await onImport(current.records);
      setStatus(`Đã nhập ${result.imported}/${current.records.length} dòng.${result.failures.length ? ` Còn ${result.failures.length} dòng lỗi, có thể thử lại.` : ''}`);
      if (result.failures.length) {
        const failed = new Set(result.failures.map((failure) => failure.index));
        setParseResult({ ...current, records: current.records.filter((_, index) => failed.has(index)), errors: [...current.errors, ...result.failures.slice(0, 20).map((failure) => ({ row: failure.index + 2, message: failure.message }))] });
      } else setParseResult(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nhập Excel thất bại.');
    } finally { setBusy(false); }
  };

  return <section className="mb-5 rounded-xl border border-[#D8CFBD] bg-white p-3 sm:p-4" aria-label="Nhập dữ liệu Excel">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-[#C76B3C]" /><div><h3 className="text-sm font-bold">Nhập nhiều dòng từ Excel</h3><p className="text-xs text-[#6E655B]">Tối đa 1.000 dòng, tệp .xlsx tối đa 10 MB. Danh sách dùng dấu phẩy; hotspot/gói chụp dùng JSON.</p></div></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={downloadTemplate} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#ECE4D0] px-3 text-xs font-semibold"><Download className="h-3.5 w-3.5" />Tải mẫu</button>
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#C76B3C] px-3 text-xs font-semibold text-white disabled:opacity-60">{busy && !parseResult ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}Chọn Excel</button>
        {parseResult && <button type="button" onClick={() => { setParseResult(null); setStatus(''); }} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D8CFBD] px-2 text-xs" aria-label="Đóng xem trước"><X className="h-3.5 w-3.5" /></button>}
      </div>
      <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={(event) => void readFile(event.target.files?.[0])} aria-label="Chọn tệp Excel" />
    </div>
    {status && <p role="status" className="mt-3 text-xs text-[#6E655B]">{status}</p>}
    {parseResult && <div className="mt-4 space-y-3 border-t border-[#E2DAD0] pt-3">
      <p className="text-xs text-[#6E655B]">{filename}: <strong className="text-[#2C2621]">{parseResult.records.length} dòng hợp lệ</strong>, {parseResult.errors.length} dòng bị bỏ qua.</p>
      {parseResult.records.length > 0 && <><div className="flex flex-wrap gap-1.5">{parseResult.records.slice(0, 6).map((record, index) => <span key={`${record.name}-${index}`} className="rounded-full bg-[#F7F5F0] px-2.5 py-1 text-[11px]">{record.name}</span>)}{parseResult.records.length > 6 && <span className="px-2 py-1 text-[11px] text-[#6E655B]">+{parseResult.records.length - 6} mục</span>}</div><button type="button" disabled={busy} onClick={() => void importRows()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#2C2621] px-4 text-xs font-bold text-white disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}Nhập {parseResult.records.length} dòng hợp lệ</button></>}
      {parseResult.errors.length > 0 && <details className="text-xs text-[#8A4A2C]"><summary className="cursor-pointer">Xem {parseResult.errors.length} dòng lỗi</summary><ul className="mt-2 max-h-28 list-inside list-disc overflow-y-auto">{parseResult.errors.slice(0, 20).map((error, index) => <li key={`${error.row}-${index}`}>Dòng {error.row}: {error.message}</li>)}</ul></details>}
    </div>}
  </section>;
};
