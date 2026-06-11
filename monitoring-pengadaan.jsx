import { useState, useEffect, useCallback, useMemo } from "react";

// ─── Utilities ──────────────────────────────────────────────────────────────
const formatRupiah = (n) => {
  if (!n && n !== 0) return "Rp 0";
  return "Rp " + Number(n).toLocaleString("id-ID");
};
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ─── Dropdown Options ───────────────────────────────────────────────────────
const TAHUN_OPTIONS = Array.from({ length: 21 }, (_, i) => (2024 + i).toString());
const METODE_OPTIONS = ["Semua", "Pengadaan Langsung", "Tender KHS", "Tender non KHS"];
const BIDANG_OPTIONS = ["Jaringan dan Konstruksi", "Keselamatan, Kesehatan Kerja, Lingkungan dan Keamanan", "Niaga dan Pemasaran", "Pembangkitan", "Perencanaan", "Transaksi Energi Listrik", "Keuangan dan Umum"];
const RISIKO_OPTIONS = ["Rendah", "Moderat", "Tinggi", "Sangat Tinggi", "Ekstrem"];
const PERIODE_OPTIONS = ["Tahunan", "Multi Year"];
const JENIS_ANGGARAN_OPTIONS = ["Operasi", "Investasi", "Operasi & Investasi"];
const JENIS_PENGADAAN_PL = ["Barang", "Jasa Lainnya", "Jasa Konsultansi", "Jasa Konstruksi"];
const JENIS_PENGADAAN_TENDER = ["Barang", "Jasa Lainnya", "Jasa Konsultansi", "Jasa Konstruksi", "Pengadaan Khusus"];
const JENIS_KONTRAK_PL = ["Lumsum", "Turn Key"];
const JENIS_KONTRAK_TENDER = ["Lumsum", "KHS/ Kontrak Payung", "Turn Key", "Unit Price", "Gabungan (Lumsum & Unit Price)"];
const METODE_PENGADAAN_TENDER = ["Tender Terbuka/ Seleksi Umum", "Tender Terbatas/ Seleksi Terbatas", "Penunjukan Langsung", "Tender Cepat"];
const KUALIFIKASI_OPTIONS = ["Paskakualifikasi", "Prakualifikasi"];
const METODE_PENYAMPAIAN_OPTIONS = ["1 Tahap 1 Sampul", "1 Tahap 2 Sampul", "2 Tahap"];
const METODE_EVALUASI_OPTIONS = ["Sistem Gugur", "Sistem Nilai", "Sistem Kualitas", "Sistem Biaya Terendah", "Sistem Kualitas dan Biaya"];
const STATUS_OPTIONS = ["Terkontrak", "Sedang Proses", "Batal/Gagal"];
const CSMS_JENIS_OPTIONS = ["Sertifikat", "Berita Acara"];
const ADA_TIDAK_OPTIONS = ["Ada", "Tidak Ada"];
const MANKON_OPTIONS = ["Sudah", "Belum"];

// ─── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ type, size = 16 }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };
  switch (type) {
    case "edit": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "view": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "delete": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
    case "dashboard": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    case "monitor": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case "input": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>;
    case "close": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "chevron": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
    default: return null;
  }
};

// ─── Toast Notification ─────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      background: type === "success" ? "#16a34a" : "#dc2626", color: "#fff",
      padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,.18)", zIndex: 9999, animation: "fadeIn .3s"
    }}>
      {message}
    </div>
  );
};

// ─── Confirm Dialog ─────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onYes, onNo }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 9998,
    display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80
  }}>
    <div style={{
      background: "#fff", borderRadius: 14, padding: "28px 36px", minWidth: 360,
      boxShadow: "0 12px 48px rgba(0,0,0,.2)", textAlign: "center"
    }}>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 28, color: "#1e293b", lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button onClick={onNo} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Tidak</button>
        <button onClick={onYes} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Ya</button>
      </div>
    </div>
  </div>
);

// ─── Form Field Components ──────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 5 }}>
      {label} {hint && <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12 }}>({hint})</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1",
  fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff",
  transition: "border-color .2s"
};
const lockedStyle = { ...inputStyle, background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" };

const TextInput = ({ value, onChange, placeholder, disabled, type = "text" }) => (
  <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} disabled={disabled}
    style={disabled ? lockedStyle : inputStyle} />
);

const NumberInput = ({ value, onChange, placeholder, disabled }) => (
  <input type="number" value={value ?? ""} onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
    placeholder={placeholder || "Dalam Rupiah"} disabled={disabled}
    style={disabled ? lockedStyle : inputStyle} />
);

const Select = ({ value, onChange, options, placeholder, disabled }) => (
  <select value={value || ""} onChange={e => onChange(e.target.value)} disabled={disabled}
    style={{ ...inputStyle, background: disabled ? "#f1f5f9" : "#fff", cursor: disabled ? "not-allowed" : "pointer" }}>
    <option value="">{placeholder || "Pilih..."}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const SectionTitle = ({ number, title }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12, margin: "32px 0 20px",
    padding: "14px 20px", background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
    borderRadius: 10, color: "#fff"
  }}>
    <span style={{ fontWeight: 800, fontSize: 15, opacity: .8 }}>{number}.</span>
    <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: .3 }}>{title}</span>
  </div>
);

// ─── RAB/HPS/Kontrak Price Block ────────────────────────────────────────────
const PriceBlock = ({ prefix, data, setData, disabled }) => {
  const hargaBarang = Number(data[`${prefix}_harga_barang`]) || 0;
  const hargaJasa = Number(data[`${prefix}_harga_jasa`]) || 0;
  const totalTanpaPPN = hargaBarang + hargaJasa;
  const dpp = totalTanpaPPN * (11 / 12);
  const ppnPersen = Number(data[`${prefix}_ppn`]) || 0;
  const nilaiPPN = dpp * (ppnPersen / 100);
  const totalDenganPPN = dpp + nilaiPPN;

  useEffect(() => {
    const u = {};
    u[`${prefix}_total_tanpa_ppn`] = totalTanpaPPN;
    u[`${prefix}_dpp`] = dpp;
    u[`${prefix}_total_dengan_ppn`] = totalDenganPPN;
    setData(prev => ({ ...prev, ...u }));
  }, [hargaBarang, hargaJasa, ppnPersen]);

  const materialLabel = prefix.includes("hps") || prefix.includes("hpe") ? "Harga Material" : "Harga Barang";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label={materialLabel} hint="Rupiah">
        <NumberInput value={data[`${prefix}_harga_barang`]} onChange={v => setData(p => ({ ...p, [`${prefix}_harga_barang`]: v }))} disabled={disabled} />
      </Field>
      <Field label="Harga Jasa" hint="Rupiah">
        <NumberInput value={data[`${prefix}_harga_jasa`]} onChange={v => setData(p => ({ ...p, [`${prefix}_harga_jasa`]: v }))} disabled={disabled} />
      </Field>
      <Field label="Harga Total (Tanpa PPN)">
        <TextInput value={formatRupiah(totalTanpaPPN)} disabled />
      </Field>
      <Field label="DPP" hint="11/12 otomatis">
        <TextInput value={formatRupiah(dpp)} disabled />
      </Field>
      <Field label="PPN" hint="Persen">
        <NumberInput value={data[`${prefix}_ppn`]} onChange={v => setData(p => ({ ...p, [`${prefix}_ppn`]: v }))} placeholder="%" disabled={disabled} />
      </Field>
      <Field label="Harga Total (Dengan PPN)">
        <TextInput value={formatRupiah(totalDenganPPN)} disabled />
      </Field>
    </div>
  );
};

// ─── Main Form: Pengadaan Langsung ──────────────────────────────────────────
const FormPengadaanLangsung = ({ data, setData, disabled }) => (
  <>
    <SectionTitle number="I" title="DATA PENGADAAN" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="Nama Pekerjaan"><TextInput value={data.nama_pekerjaan} onChange={v => setData(p => ({ ...p, nama_pekerjaan: v }))} disabled={disabled} /></Field>
      <Field label="Lokasi Pekerjaan"><TextInput value={data.lokasi_pekerjaan} onChange={v => setData(p => ({ ...p, lokasi_pekerjaan: v }))} disabled={disabled} /></Field>
      <Field label="Tahun Pengadaan"><Select value={data.tahun_pengadaan} onChange={v => setData(p => ({ ...p, tahun_pengadaan: v }))} options={TAHUN_OPTIONS} disabled={disabled} /></Field>
      <Field label="Jangka Waktu Pelaksanaan" hint="Hari"><NumberInput value={data.jangka_waktu} onChange={v => setData(p => ({ ...p, jangka_waktu: v }))} placeholder="Berapa Hari" disabled={disabled} /></Field>
      <Field label="Bidang Pengguna"><Select value={data.bidang_pengguna} onChange={v => setData(p => ({ ...p, bidang_pengguna: v }))} options={BIDANG_OPTIONS} disabled={disabled} /></Field>
      <Field label="Level Risiko Pekerjaan"><Select value={data.level_risiko} onChange={v => setData(p => ({ ...p, level_risiko: v }))} options={RISIKO_OPTIONS} disabled={disabled} /></Field>
    </div>
    <Field label="Nota Dinas Pelaksanaan Pengadaan">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextInput value={data.nd_pelaksanaan_no} onChange={v => setData(p => ({ ...p, nd_pelaksanaan_no: v }))} placeholder="Nomor" disabled={disabled} />
        <TextInput type="date" value={data.nd_pelaksanaan_tgl} onChange={v => setData(p => ({ ...p, nd_pelaksanaan_tgl: v }))} disabled={disabled} />
      </div>
    </Field>

    <SectionTitle number="II" title="DOKUMEN PENGADAAN" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="Tanggal Terima Dokumen Pengadaan"><TextInput type="date" value={data.tgl_terima_dokumen} onChange={v => setData(p => ({ ...p, tgl_terima_dokumen: v }))} disabled={disabled} /></Field>
      <div />
    </div>
    <Field label="Dokumen Rencana Pengadaan (DRP)">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextInput value={data.drp_no} onChange={v => setData(p => ({ ...p, drp_no: v }))} placeholder="Nomor" disabled={disabled} />
        <TextInput type="date" value={data.drp_tgl} onChange={v => setData(p => ({ ...p, drp_tgl: v }))} disabled={disabled} />
      </div>
    </Field>

    <SectionTitle number="III" title="RENCANA ANGGARAN BIAYA (RAB)" />
    <PriceBlock prefix="rab" data={data} setData={setData} disabled={disabled} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="Periode Anggaran"><Select value={data.periode_anggaran} onChange={v => setData(p => ({ ...p, periode_anggaran: v }))} options={PERIODE_OPTIONS} disabled={disabled} /></Field>
      <Field label="No. PRK"><TextInput value={data.no_prk} onChange={v => setData(p => ({ ...p, no_prk: v }))} disabled={disabled} /></Field>
    </div>
    <Field label="Anggaran">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextInput value={data.anggaran_no} onChange={v => setData(p => ({ ...p, anggaran_no: v }))} placeholder="Nomor" disabled={disabled} />
        <TextInput type="date" value={data.anggaran_tgl} onChange={v => setData(p => ({ ...p, anggaran_tgl: v }))} disabled={disabled} />
      </div>
    </Field>
    <Field label="Jenis Anggaran"><Select value={data.jenis_anggaran} onChange={v => setData(p => ({ ...p, jenis_anggaran: v }))} options={JENIS_ANGGARAN_OPTIONS} disabled={disabled} /></Field>

    <SectionTitle number="IV" title="KRITERIA PENGADAAN" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="Jenis Pengadaan"><Select value={data.jenis_pengadaan} onChange={v => setData(p => ({ ...p, jenis_pengadaan: v }))} options={JENIS_PENGADAAN_PL} disabled={disabled} /></Field>
      <Field label="Jenis Perjanjian/Kontrak"><Select value={data.jenis_kontrak} onChange={v => setData(p => ({ ...p, jenis_kontrak: v }))} options={JENIS_KONTRAK_PL} disabled={disabled} /></Field>
    </div>

    <SectionTitle number="V" title="DOKUMEN HPS" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="No. Dokumen"><TextInput value={data.hps_no_dokumen} onChange={v => setData(p => ({ ...p, hps_no_dokumen: v }))} disabled={disabled} /></Field>
      <Field label="Tanggal Dokumen"><TextInput type="date" value={data.hps_tgl_dokumen} onChange={v => setData(p => ({ ...p, hps_tgl_dokumen: v }))} disabled={disabled} /></Field>
    </div>
    <PriceBlock prefix="hps" data={data} setData={setData} disabled={disabled} />

    <SectionTitle number="VI" title="PROSES PENGADAAN" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="No. Paket Pekerjaan"><TextInput value={data.no_paket} onChange={v => setData(p => ({ ...p, no_paket: v }))} disabled={disabled} /></Field>
      <Field label="Tanggal Pengumuman"><TextInput type="date" value={data.tgl_pengumuman} onChange={v => setData(p => ({ ...p, tgl_pengumuman: v }))} disabled={disabled} /></Field>
    </div>
    {["BA Pembukaan Penawaran", "BA Evaluasi Penawaran", "BA Klarifikasi dan Negosiasi"].map((lbl, i) => {
      const key = ["ba_pembukaan", "ba_evaluasi", "ba_klarifikasi"][i];
      return (
        <Field key={key} label={lbl}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput value={data[`${key}_no`]} onChange={v => setData(p => ({ ...p, [`${key}_no`]: v }))} placeholder="No. BA" disabled={disabled} />
            <TextInput type="date" value={data[`${key}_tgl`]} onChange={v => setData(p => ({ ...p, [`${key}_tgl`]: v }))} disabled={disabled} />
          </div>
        </Field>
      );
    })}

    <SectionTitle number="VII" title="DOKUMEN PENAWARAN" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="No. Penawaran"><TextInput value={data.penawaran_no} onChange={v => setData(p => ({ ...p, penawaran_no: v }))} disabled={disabled} /></Field>
      <Field label="Tanggal"><TextInput type="date" value={data.penawaran_tgl} onChange={v => setData(p => ({ ...p, penawaran_tgl: v }))} disabled={disabled} /></Field>
      <Field label="Waktu Pelaksanaan"><TextInput value={data.penawaran_waktu} onChange={v => setData(p => ({ ...p, penawaran_waktu: v }))} disabled={disabled} /></Field>
    </div>
    <PriceBlock prefix="penawaran" data={data} setData={setData} disabled={disabled} />

    <SectionTitle number="VIII" title="SURAT PERINTAH KERJA" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="No. SPK"><TextInput value={data.spk_no} onChange={v => setData(p => ({ ...p, spk_no: v }))} disabled={disabled} /></Field>
      <div />
      <Field label="Tanggal Awal"><TextInput type="date" value={data.spk_tgl_awal} onChange={v => setData(p => ({ ...p, spk_tgl_awal: v }))} disabled={disabled} /></Field>
      <Field label="Tanggal Akhir"><TextInput type="date" value={data.spk_tgl_akhir} onChange={v => setData(p => ({ ...p, spk_tgl_akhir: v }))} disabled={disabled} /></Field>
    </div>
    <PriceBlock prefix="spk" data={data} setData={setData} disabled={disabled} />

    <SectionTitle number="IX" title="PENGENDALI PEKERJAAN" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="Direksi Pekerjaan"><TextInput value={data.direksi} onChange={v => setData(p => ({ ...p, direksi: v }))} disabled={disabled} /></Field>
      <Field label="Pengawas Pekerjaan"><TextInput value={data.pengawas} onChange={v => setData(p => ({ ...p, pengawas: v }))} disabled={disabled} /></Field>
      <Field label="Pengawas Lapangan" hint="Jika tidak ada beri tanda -"><TextInput value={data.pengawas_lapangan} onChange={v => setData(p => ({ ...p, pengawas_lapangan: v }))} disabled={disabled} /></Field>
    </div>

    <SectionTitle number="X" title="DATA PENYEDIA BARANG/JASA" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="Nama Penyedia"><TextInput value={data.nama_penyedia} onChange={v => setData(p => ({ ...p, nama_penyedia: v }))} disabled={disabled} /></Field>
      <Field label="Alamat Perusahaan"><TextInput value={data.alamat_perusahaan} onChange={v => setData(p => ({ ...p, alamat_perusahaan: v }))} disabled={disabled} /></Field>
      <Field label="Nama PIC Pengadaan"><TextInput value={data.pic_nama} onChange={v => setData(p => ({ ...p, pic_nama: v }))} disabled={disabled} /></Field>
      <Field label="No. Telp PIC"><TextInput value={data.pic_telp} onChange={v => setData(p => ({ ...p, pic_telp: v }))} disabled={disabled} /></Field>
      <Field label="No. NPWP Perusahaan"><TextInput value={data.npwp} onChange={v => setData(p => ({ ...p, npwp: v }))} disabled={disabled} /></Field>
      <Field label="Email Perusahaan"><TextInput value={data.email} onChange={v => setData(p => ({ ...p, email: v }))} disabled={disabled} /></Field>
      <Field label="Pimpinan"><TextInput value={data.pimpinan} onChange={v => setData(p => ({ ...p, pimpinan: v }))} disabled={disabled} /></Field>
      <Field label="Jabatan"><TextInput value={data.jabatan} onChange={v => setData(p => ({ ...p, jabatan: v }))} disabled={disabled} /></Field>
    </div>
    <Field label="Informasi Bank">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <TextInput value={data.bank_nama} onChange={v => setData(p => ({ ...p, bank_nama: v }))} placeholder="Nama Bank" disabled={disabled} />
        <TextInput value={data.bank_rekening} onChange={v => setData(p => ({ ...p, bank_rekening: v }))} placeholder="Nomor Rekening" disabled={disabled} />
        <TextInput value={data.bank_pemilik} onChange={v => setData(p => ({ ...p, bank_pemilik: v }))} placeholder="Pemilik Rekening" disabled={disabled} />
      </div>
    </Field>
    <Field label="CSMS">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Select value={data.csms_jenis} onChange={v => setData(p => ({ ...p, csms_jenis: v }))} options={CSMS_JENIS_OPTIONS} placeholder="Jenis Dokumen" disabled={disabled} />
        <Select value={data.csms_risiko} onChange={v => setData(p => ({ ...p, csms_risiko: v }))} options={RISIKO_OPTIONS} placeholder="Level Risiko" disabled={disabled} />
        <TextInput type="date" value={data.csms_terbit} onChange={v => setData(p => ({ ...p, csms_terbit: v }))} disabled={disabled} />
        <TextInput type="date" value={data.csms_berakhir} onChange={v => setData(p => ({ ...p, csms_berakhir: v }))} disabled={disabled} />
      </div>
    </Field>

    <SectionTitle number="XI" title="DATA LAINNYA" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
      <Field label="NORM. SISTEM EPROC"><TextInput value={data.norm_eproc} onChange={v => setData(p => ({ ...p, norm_eproc: v }))} disabled={disabled} /></Field>
      <Field label="Nama Material/Jasa"><TextInput value={data.nama_material} onChange={v => setData(p => ({ ...p, nama_material: v }))} disabled={disabled} /></Field>
      <Field label="NOMOR PR"><TextInput value={data.nomor_pr} onChange={v => setData(p => ({ ...p, nomor_pr: v }))} disabled={disabled} /></Field>
      <Field label="MANAJEMEN KONTRAK"><Select value={data.mankon} onChange={v => setData(p => ({ ...p, mankon: v }))} options={MANKON_OPTIONS} disabled={disabled} /></Field>
    </div>

    <Field label="Status Pengadaan">
      <Select value={data.status} onChange={v => setData(p => ({ ...p, status: v }))} options={STATUS_OPTIONS} disabled={disabled} />
    </Field>
  </>
);

// ─── Main Form: Tender (KHS & non KHS) ─────────────────────────────────────
const FormTender = ({ data, setData, disabled, isTenderKHS }) => {
  const isPaskakualifikasi = data.kualifikasi === "Paskakualifikasi";
  const is1Tahap1Sampul = data.metode_penyampaian === "1 Tahap 1 Sampul";
  const isTenderTerbatas = data.metode_pengadaan_tender === "Tender Terbatas/ Seleksi Terbatas";

  return (
    <>
      <SectionTitle number="I" title="DATA PENGADAAN" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Nama Pekerjaan"><TextInput value={data.nama_pekerjaan} onChange={v => setData(p => ({ ...p, nama_pekerjaan: v }))} disabled={disabled} /></Field>
        <Field label="Lokasi Pekerjaan"><TextInput value={data.lokasi_pekerjaan} onChange={v => setData(p => ({ ...p, lokasi_pekerjaan: v }))} disabled={disabled} /></Field>
        <Field label="Tahun Pengadaan"><Select value={data.tahun_pengadaan} onChange={v => setData(p => ({ ...p, tahun_pengadaan: v }))} options={TAHUN_OPTIONS} disabled={disabled} /></Field>
        <Field label="Jangka Waktu Pelaksanaan" hint="Hari"><NumberInput value={data.jangka_waktu} onChange={v => setData(p => ({ ...p, jangka_waktu: v }))} placeholder="Berapa Hari" disabled={disabled} /></Field>
        <Field label="Bidang Pengguna"><Select value={data.bidang_pengguna} onChange={v => setData(p => ({ ...p, bidang_pengguna: v }))} options={BIDANG_OPTIONS} disabled={disabled} /></Field>
        <Field label="Level Risiko Pekerjaan"><Select value={data.level_risiko} onChange={v => setData(p => ({ ...p, level_risiko: v }))} options={RISIKO_OPTIONS} disabled={disabled} /></Field>
      </div>
      <Field label="Nota Dinas Perencana Pengadaan">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.nd_perencana_no} onChange={v => setData(p => ({ ...p, nd_perencana_no: v }))} placeholder="Nomor" disabled={disabled} />
          <TextInput type="date" value={data.nd_perencana_tgl} onChange={v => setData(p => ({ ...p, nd_perencana_tgl: v }))} disabled={disabled} />
        </div>
      </Field>
      <Field label="Nota Dinas Pelaksanaan Pengadaan">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.nd_pelaksanaan_no} onChange={v => setData(p => ({ ...p, nd_pelaksanaan_no: v }))} placeholder="Nomor" disabled={disabled} />
          <TextInput type="date" value={data.nd_pelaksanaan_tgl} onChange={v => setData(p => ({ ...p, nd_pelaksanaan_tgl: v }))} disabled={disabled} />
        </div>
      </Field>

      <SectionTitle number="II" title="DOKUMEN PERENCANAAN PENGADAAN" />
      <Field label="Tanggal Terima Dokumen Pengadaan"><TextInput type="date" value={data.tgl_terima_dokumen} onChange={v => setData(p => ({ ...p, tgl_terima_dokumen: v }))} disabled={disabled} /></Field>
      <Field label="Dokumen Rencana Pengadaan (DRP)">
        <Select value={data.drp_status} onChange={v => setData(p => ({ ...p, drp_status: v }))} options={ADA_TIDAK_OPTIONS} disabled={disabled} />
        {data.drp_status === "Ada" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <TextInput value={data.drp_no} onChange={v => setData(p => ({ ...p, drp_no: v }))} placeholder="Nomor" disabled={disabled} />
            <TextInput type="date" value={data.drp_tgl} onChange={v => setData(p => ({ ...p, drp_tgl: v }))} disabled={disabled} />
          </div>
        )}
      </Field>
      <Field label="Dokumen RKS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.rks_no} onChange={v => setData(p => ({ ...p, rks_no: v }))} placeholder="Nomor" disabled={disabled} />
          <TextInput type="date" value={data.rks_tgl} onChange={v => setData(p => ({ ...p, rks_tgl: v }))} disabled={disabled} />
        </div>
      </Field>
      <Field label="Addendum RKS">
        <Select value={data.addendum_rks_status} onChange={v => setData(p => ({ ...p, addendum_rks_status: v }))} options={ADA_TIDAK_OPTIONS} disabled={disabled} />
        {data.addendum_rks_status === "Ada" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <TextInput value={data.addendum_rks_no} onChange={v => setData(p => ({ ...p, addendum_rks_no: v }))} placeholder="Nomor" disabled={disabled} />
            <TextInput type="date" value={data.addendum_rks_tgl} onChange={v => setData(p => ({ ...p, addendum_rks_tgl: v }))} disabled={disabled} />
          </div>
        )}
      </Field>

      <SectionTitle number="III" title="RENCANA ANGGARAN BIAYA (RAB)" />
      <PriceBlock prefix="rab" data={data} setData={setData} disabled={disabled} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Tahun Anggaran"><Select value={data.tahun_anggaran_rab} onChange={v => setData(p => ({ ...p, tahun_anggaran_rab: v }))} options={TAHUN_OPTIONS} disabled={disabled} /></Field>
        <Field label="Periode Anggaran"><Select value={data.periode_anggaran} onChange={v => setData(p => ({ ...p, periode_anggaran: v }))} options={PERIODE_OPTIONS} disabled={disabled} /></Field>
        <Field label="No. PRK"><TextInput value={data.no_prk} onChange={v => setData(p => ({ ...p, no_prk: v }))} disabled={disabled} /></Field>
      </div>
      <Field label="Anggaran">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.anggaran_no} onChange={v => setData(p => ({ ...p, anggaran_no: v }))} placeholder="Nomor" disabled={disabled} />
          <TextInput type="date" value={data.anggaran_tgl} onChange={v => setData(p => ({ ...p, anggaran_tgl: v }))} disabled={disabled} />
        </div>
      </Field>
      <Field label="Jenis Anggaran"><Select value={data.jenis_anggaran} onChange={v => setData(p => ({ ...p, jenis_anggaran: v }))} options={JENIS_ANGGARAN_OPTIONS} disabled={disabled} /></Field>

      <SectionTitle number="IV" title="DOKUMEN HPE" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="No. Dokumen"><TextInput value={data.hpe_no_dokumen} onChange={v => setData(p => ({ ...p, hpe_no_dokumen: v }))} disabled={disabled} /></Field>
        <Field label="Tanggal Dokumen"><TextInput type="date" value={data.hpe_tgl_dokumen} onChange={v => setData(p => ({ ...p, hpe_tgl_dokumen: v }))} disabled={disabled} /></Field>
      </div>
      <PriceBlock prefix="hpe" data={data} setData={setData} disabled={disabled} />
      <Field label="Tahun Anggaran"><Select value={data.tahun_anggaran_hpe} onChange={v => setData(p => ({ ...p, tahun_anggaran_hpe: v }))} options={TAHUN_OPTIONS} disabled={disabled} /></Field>

      <SectionTitle number="V-A" title="KRITERIA PENGADAAN" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Jenis Pengadaan"><Select value={data.jenis_pengadaan} onChange={v => setData(p => ({ ...p, jenis_pengadaan: v }))} options={JENIS_PENGADAAN_TENDER} disabled={disabled} /></Field>
        <Field label="Metode Pengadaan"><Select value={data.metode_pengadaan_tender} onChange={v => setData(p => ({ ...p, metode_pengadaan_tender: v }))} options={METODE_PENGADAAN_TENDER} disabled={disabled} /></Field>
        <Field label="Kualifikasi"><Select value={data.kualifikasi} onChange={v => setData(p => ({ ...p, kualifikasi: v }))} options={KUALIFIKASI_OPTIONS} disabled={disabled} /></Field>
        <Field label="Metode Penyampaian Dokumen"><Select value={data.metode_penyampaian} onChange={v => setData(p => ({ ...p, metode_penyampaian: v }))} options={METODE_PENYAMPAIAN_OPTIONS} disabled={disabled} /></Field>
        <Field label="Metode Evaluasi"><Select value={data.metode_evaluasi} onChange={v => setData(p => ({ ...p, metode_evaluasi: v }))} options={METODE_EVALUASI_OPTIONS} disabled={disabled} /></Field>
        <Field label="Jenis Perjanjian/Kontrak"><Select value={data.jenis_kontrak} onChange={v => setData(p => ({ ...p, jenis_kontrak: v }))} options={JENIS_KONTRAK_TENDER} disabled={disabled} /></Field>
      </div>

      <SectionTitle number="V-B" title="DOKUMEN HPS" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="No. Dokumen"><TextInput value={data.hps_no_dokumen} onChange={v => setData(p => ({ ...p, hps_no_dokumen: v }))} disabled={disabled} /></Field>
        <Field label="Tanggal Dokumen"><TextInput type="date" value={data.hps_tgl_dokumen} onChange={v => setData(p => ({ ...p, hps_tgl_dokumen: v }))} disabled={disabled} /></Field>
      </div>
      <PriceBlock prefix="hps" data={data} setData={setData} disabled={disabled} />

      <SectionTitle number="VI" title="PROSES PENGADAAN" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="No. Paket Pekerjaan"><TextInput value={data.no_paket} onChange={v => setData(p => ({ ...p, no_paket: v }))} disabled={disabled} /></Field>
        <Field label="Tanggal Pengumuman"><TextInput type="date" value={data.tgl_pengumuman} onChange={v => setData(p => ({ ...p, tgl_pengumuman: v }))} disabled={disabled} /></Field>
        <Field label="Biaya Dokumen RKS" hint="Rupiah"><NumberInput value={data.biaya_rks} onChange={v => setData(p => ({ ...p, biaya_rks: v }))} disabled={disabled} /></Field>
        <Field label="Pendaftaran dan Download Dokumen"><TextInput type="date" value={data.pendaftaran_tgl} onChange={v => setData(p => ({ ...p, pendaftaran_tgl: v }))} disabled={disabled} /></Field>
      </div>
      <Field label="Pemberian Penjelasan">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.penjelasan_no} onChange={v => setData(p => ({ ...p, penjelasan_no: v }))} placeholder="No. BA" disabled={disabled} />
          <TextInput type="date" value={data.penjelasan_tgl} onChange={v => setData(p => ({ ...p, penjelasan_tgl: v }))} disabled={disabled} />
        </div>
      </Field>
      <Field label="Upload Dokumen Penawaran">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput type="date" value={data.upload_awal} onChange={v => setData(p => ({ ...p, upload_awal: v }))} disabled={disabled} />
          <TextInput type="date" value={data.upload_akhir} onChange={v => setData(p => ({ ...p, upload_akhir: v }))} disabled={disabled} />
        </div>
      </Field>
      {[
        { label: "Pembukaan Penawaran Sampul Satu", key: "ba_pembukaan_s1" },
        { label: "Evaluasi Penawaran Sampul Satu", key: "ba_evaluasi_s1" },
      ].map(({ label, key }) => (
        <Field key={key} label={label}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput value={data[`${key}_no`]} onChange={v => setData(p => ({ ...p, [`${key}_no`]: v }))} placeholder="No. BA" disabled={disabled} />
            <TextInput type="date" value={data[`${key}_tgl`]} onChange={v => setData(p => ({ ...p, [`${key}_tgl`]: v }))} disabled={disabled} />
          </div>
        </Field>
      ))}
      <Field label="Evaluasi Dokumen Aplikasi Kualifikasi" hint={isTenderTerbatas ? "Terkunci" : ""}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.eval_kualifikasi_no} onChange={v => setData(p => ({ ...p, eval_kualifikasi_no: v }))} placeholder="No. BA" disabled={disabled || isTenderTerbatas} />
          <TextInput type="date" value={data.eval_kualifikasi_tgl} onChange={v => setData(p => ({ ...p, eval_kualifikasi_tgl: v }))} disabled={disabled || isTenderTerbatas} />
        </div>
      </Field>
      <Field label="Pemberitahuan Hasil Evaluasi Sampul Satu">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <NumberInput value={data.hasil_s1_jumlah} onChange={v => setData(p => ({ ...p, hasil_s1_jumlah: v }))} placeholder="Jumlah Peserta Lulus" disabled={disabled} />
          <TextInput type="date" value={data.hasil_s1_tgl} onChange={v => setData(p => ({ ...p, hasil_s1_tgl: v }))} disabled={disabled} />
        </div>
      </Field>
      {[
        { label: "Pembukaan Penawaran Sampul Dua", key: "ba_pembukaan_s2", locked: is1Tahap1Sampul },
        { label: "Evaluasi Penawaran Sampul Dua", key: "ba_evaluasi_s2", locked: is1Tahap1Sampul },
      ].map(({ label, key, locked }) => (
        <Field key={key} label={label} hint={locked ? "Terkunci" : ""}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput value={data[`${key}_no`]} onChange={v => setData(p => ({ ...p, [`${key}_no`]: v }))} placeholder="No. BA" disabled={disabled || locked} />
            <TextInput type="date" value={data[`${key}_tgl`]} onChange={v => setData(p => ({ ...p, [`${key}_tgl`]: v }))} disabled={disabled || locked} />
          </div>
        </Field>
      ))}
      <Field label="Pembuktian Kualifikasi" hint={isTenderTerbatas ? "Terkunci" : ""}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.pembuktian_no} onChange={v => setData(p => ({ ...p, pembuktian_no: v }))} placeholder="No. BA" disabled={disabled || isTenderTerbatas} />
          <TextInput type="date" value={data.pembuktian_tgl} onChange={v => setData(p => ({ ...p, pembuktian_tgl: v }))} disabled={disabled || isTenderTerbatas} />
        </div>
      </Field>
      {[
        { label: "Klarifikasi dan Negosiasi Harga", key: "klarifikasi_nego" },
        { label: "BAHP", key: "bahp" },
        { label: "UCP", key: "ucp" },
      ].map(({ label, key }) => (
        <Field key={key} label={label}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput value={data[`${key}_no`]} onChange={v => setData(p => ({ ...p, [`${key}_no`]: v }))} placeholder="No. BA" disabled={disabled} />
            <TextInput type="date" value={data[`${key}_tgl`]} onChange={v => setData(p => ({ ...p, [`${key}_tgl`]: v }))} disabled={disabled} />
          </div>
        </Field>
      ))}
      <Field label="Penetapan Pemenang">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.penetapan_no} onChange={v => setData(p => ({ ...p, penetapan_no: v }))} placeholder="No. Surat" disabled={disabled} />
          <TextInput type="date" value={data.penetapan_tgl} onChange={v => setData(p => ({ ...p, penetapan_tgl: v }))} disabled={disabled} />
        </div>
      </Field>
      <Field label="Pengumuman Pemenang">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput type="date" value={data.pengumuman_pemenang_tgl} onChange={v => setData(p => ({ ...p, pengumuman_pemenang_tgl: v }))} disabled={disabled} />
          <NumberInput value={data.pengumuman_pemenang_jumlah} onChange={v => setData(p => ({ ...p, pengumuman_pemenang_jumlah: v }))} placeholder="Jumlah Pemenang" disabled={disabled} />
        </div>
      </Field>
      <Field label="Masa Sanggah">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput type="date" value={data.sanggah_tgl} onChange={v => setData(p => ({ ...p, sanggah_tgl: v }))} disabled={disabled} />
          <Select value={data.sanggah_status} onChange={v => setData(p => ({ ...p, sanggah_status: v }))} options={ADA_TIDAK_OPTIONS} disabled={disabled} />
        </div>
      </Field>
      <Field label="Penunjukan Penyedia Barang/Jasa">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.penunjukan_no} onChange={v => setData(p => ({ ...p, penunjukan_no: v }))} placeholder="No. Surat" disabled={disabled} />
          <TextInput type="date" value={data.penunjukan_tgl} onChange={v => setData(p => ({ ...p, penunjukan_tgl: v }))} disabled={disabled} />
        </div>
      </Field>
      <Field label="CDA">
        <Select value={data.cda_status} onChange={v => setData(p => ({ ...p, cda_status: v }))} options={ADA_TIDAK_OPTIONS} disabled={disabled} />
        {data.cda_status === "Ada" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <TextInput value={data.cda_no} onChange={v => setData(p => ({ ...p, cda_no: v }))} placeholder="Nomor" disabled={disabled} />
            <TextInput type="date" value={data.cda_tgl} onChange={v => setData(p => ({ ...p, cda_tgl: v }))} disabled={disabled} />
          </div>
        )}
      </Field>

      <SectionTitle number="VII" title="DOKUMEN PENAWARAN" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="No. Penawaran"><TextInput value={data.penawaran_no} onChange={v => setData(p => ({ ...p, penawaran_no: v }))} disabled={disabled} /></Field>
        <Field label="Tanggal"><TextInput type="date" value={data.penawaran_tgl} onChange={v => setData(p => ({ ...p, penawaran_tgl: v }))} disabled={disabled} /></Field>
        <Field label="Waktu Pelaksanaan"><TextInput value={data.penawaran_waktu} onChange={v => setData(p => ({ ...p, penawaran_waktu: v }))} disabled={disabled} /></Field>
      </div>
      <PriceBlock prefix="penawaran" data={data} setData={setData} disabled={disabled} />

      <SectionTitle number="VIII" title="PERJANJIAN/KONTRAK" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="No. Kontrak"><TextInput value={data.kontrak_no} onChange={v => setData(p => ({ ...p, kontrak_no: v }))} disabled={disabled} /></Field>
        <div />
        <Field label="Tanggal Awal"><TextInput type="date" value={data.kontrak_tgl_awal} onChange={v => setData(p => ({ ...p, kontrak_tgl_awal: v }))} disabled={disabled} /></Field>
        <Field label="Tanggal Akhir"><TextInput type="date" value={data.kontrak_tgl_akhir} onChange={v => setData(p => ({ ...p, kontrak_tgl_akhir: v }))} disabled={disabled} /></Field>
      </div>
      <PriceBlock prefix="kontrak" data={data} setData={setData} disabled={disabled} />

      <SectionTitle number="IX" title="PENGENDALI PEKERJAAN" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Direksi Pekerjaan"><TextInput value={data.direksi} onChange={v => setData(p => ({ ...p, direksi: v }))} disabled={disabled} /></Field>
        <Field label="Pengawas Pekerjaan"><TextInput value={data.pengawas} onChange={v => setData(p => ({ ...p, pengawas: v }))} disabled={disabled} /></Field>
        <Field label="Pengawas Lapangan" hint="Jika tidak ada beri tanda -"><TextInput value={data.pengawas_lapangan} onChange={v => setData(p => ({ ...p, pengawas_lapangan: v }))} disabled={disabled} /></Field>
      </div>

      <SectionTitle number="X" title="DATA PENYEDIA BARANG/JASA" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Nama Penyedia"><TextInput value={data.nama_penyedia} onChange={v => setData(p => ({ ...p, nama_penyedia: v }))} disabled={disabled} /></Field>
        <Field label="Alamat Perusahaan"><TextInput value={data.alamat_perusahaan} onChange={v => setData(p => ({ ...p, alamat_perusahaan: v }))} disabled={disabled} /></Field>
        <Field label="Nama PIC Pengadaan"><TextInput value={data.pic_nama} onChange={v => setData(p => ({ ...p, pic_nama: v }))} disabled={disabled} /></Field>
        <Field label="No. Telp PIC"><TextInput value={data.pic_telp} onChange={v => setData(p => ({ ...p, pic_telp: v }))} disabled={disabled} /></Field>
        <Field label="No. NPWP Perusahaan"><TextInput value={data.npwp} onChange={v => setData(p => ({ ...p, npwp: v }))} disabled={disabled} /></Field>
        <Field label="Email Perusahaan"><TextInput value={data.email} onChange={v => setData(p => ({ ...p, email: v }))} disabled={disabled} /></Field>
        <Field label="Pimpinan"><TextInput value={data.pimpinan} onChange={v => setData(p => ({ ...p, pimpinan: v }))} disabled={disabled} /></Field>
        <Field label="Jabatan"><TextInput value={data.jabatan} onChange={v => setData(p => ({ ...p, jabatan: v }))} disabled={disabled} /></Field>
      </div>
      <Field label="Informasi Bank">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <TextInput value={data.bank_nama} onChange={v => setData(p => ({ ...p, bank_nama: v }))} placeholder="Nama Bank" disabled={disabled} />
          <TextInput value={data.bank_rekening} onChange={v => setData(p => ({ ...p, bank_rekening: v }))} placeholder="Nomor Rekening" disabled={disabled} />
          <TextInput value={data.bank_pemilik} onChange={v => setData(p => ({ ...p, bank_pemilik: v }))} placeholder="Pemilik Rekening" disabled={disabled} />
        </div>
      </Field>
      <Field label="CSMS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <Select value={data.csms_jenis} onChange={v => setData(p => ({ ...p, csms_jenis: v }))} options={CSMS_JENIS_OPTIONS} placeholder="Jenis Dokumen" disabled={disabled} />
          <Select value={data.csms_risiko} onChange={v => setData(p => ({ ...p, csms_risiko: v }))} options={RISIKO_OPTIONS} placeholder="Level Risiko" disabled={disabled} />
          <TextInput type="date" value={data.csms_terbit} onChange={v => setData(p => ({ ...p, csms_terbit: v }))} disabled={disabled} />
          <TextInput type="date" value={data.csms_berakhir} onChange={v => setData(p => ({ ...p, csms_berakhir: v }))} disabled={disabled} />
        </div>
      </Field>

      <SectionTitle number="XI" title="JAMINAN PENGADAAN" />
      {["penawaran", "pelaksanaan"].map(jType => (
        <Field key={jType} label={`Jaminan ${jType.charAt(0).toUpperCase() + jType.slice(1)}`}>
          <Select value={data[`jaminan_${jType}_status`]} onChange={v => setData(p => ({ ...p, [`jaminan_${jType}_status`]: v }))} options={ADA_TIDAK_OPTIONS} disabled={disabled} />
          {data[`jaminan_${jType}_status`] === "Ada" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
              <TextInput value={data[`jaminan_${jType}_no`]} onChange={v => setData(p => ({ ...p, [`jaminan_${jType}_no`]: v }))} placeholder="No. Jaminan" disabled={disabled} />
              <TextInput type="date" value={data[`jaminan_${jType}_terbit`]} onChange={v => setData(p => ({ ...p, [`jaminan_${jType}_terbit`]: v }))} disabled={disabled} />
              <NumberInput value={data[`jaminan_${jType}_nilai`]} onChange={v => setData(p => ({ ...p, [`jaminan_${jType}_nilai`]: v }))} placeholder="Nilai Jaminan" disabled={disabled} />
              <TextInput type="date" value={data[`jaminan_${jType}_awal`]} onChange={v => setData(p => ({ ...p, [`jaminan_${jType}_awal`]: v }))} disabled={disabled} />
              <TextInput type="date" value={data[`jaminan_${jType}_akhir`]} onChange={v => setData(p => ({ ...p, [`jaminan_${jType}_akhir`]: v }))} disabled={disabled} />
            </div>
          )}
        </Field>
      ))}

      <SectionTitle number="XII" title="PROSES PRAKUALIFIKASI" />
      {isPaskakualifikasi && <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 13 }}>Bagian ini terkunci karena Kualifikasi = Paskakualifikasi</p>}
      {[
        { label: "Undangan Kualifikasi", key: "pra_undangan_tgl", type: "date" },
        { label: "Download Dokumen Kualifikasi", key: "pra_download_tgl", type: "date" },
      ].map(({ label, key, type }) => (
        <Field key={key} label={label}>
          <TextInput type={type} value={data[key]} onChange={v => setData(p => ({ ...p, [key]: v }))} disabled={disabled || isPaskakualifikasi} />
        </Field>
      ))}
      <Field label="Upload Dokumen Aplikasi Kualifikasi">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput type="date" value={data.pra_upload_awal} onChange={v => setData(p => ({ ...p, pra_upload_awal: v }))} disabled={disabled || isPaskakualifikasi} />
          <TextInput type="date" value={data.pra_upload_akhir} onChange={v => setData(p => ({ ...p, pra_upload_akhir: v }))} disabled={disabled || isPaskakualifikasi} />
        </div>
      </Field>
      {[
        { label: "Evaluasi Dokumen Aplikasi Kualifikasi", key: "pra_eval" },
        { label: "Pembuktian Kualifikasi", key: "pra_pembuktian" },
      ].map(({ label, key }) => (
        <Field key={key} label={label}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput value={data[`${key}_no`]} onChange={v => setData(p => ({ ...p, [`${key}_no`]: v }))} placeholder="No. BA" disabled={disabled || isPaskakualifikasi} />
            <TextInput type="date" value={data[`${key}_tgl`]} onChange={v => setData(p => ({ ...p, [`${key}_tgl`]: v }))} disabled={disabled || isPaskakualifikasi} />
          </div>
        </Field>
      ))}
      <Field label="Penetapan Hasil Kualifikasi">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput value={data.pra_penetapan_no} onChange={v => setData(p => ({ ...p, pra_penetapan_no: v }))} placeholder="No. Surat" disabled={disabled || isPaskakualifikasi} />
          <TextInput type="date" value={data.pra_penetapan_tgl} onChange={v => setData(p => ({ ...p, pra_penetapan_tgl: v }))} disabled={disabled || isPaskakualifikasi} />
        </div>
      </Field>
      <Field label="Sanggah Hasil Kualifikasi">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select value={data.pra_sanggah_status} onChange={v => setData(p => ({ ...p, pra_sanggah_status: v }))} options={ADA_TIDAK_OPTIONS} disabled={disabled || isPaskakualifikasi} />
          <TextInput type="date" value={data.pra_sanggah_tgl} onChange={v => setData(p => ({ ...p, pra_sanggah_tgl: v }))} disabled={disabled || isPaskakualifikasi} />
        </div>
      </Field>
      <Field label="Pengumuman Hasil Prakualifikasi">
        <TextInput type="date" value={data.pra_pengumuman_tgl} onChange={v => setData(p => ({ ...p, pra_pengumuman_tgl: v }))} disabled={disabled || isPaskakualifikasi} />
      </Field>
      <Field label="Calon Penyedia Lolos Kualifikasi">
        <NumberInput value={data.pra_lolos_jumlah} onChange={v => setData(p => ({ ...p, pra_lolos_jumlah: v }))} placeholder="Jumlah Penyedia" disabled={disabled || isPaskakualifikasi} />
      </Field>

      <SectionTitle number="XIII" title="DATA LAINNYA" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="NORM. SISTEM EPROC"><TextInput value={data.norm_eproc} onChange={v => setData(p => ({ ...p, norm_eproc: v }))} disabled={disabled} /></Field>
        <Field label="Nama Material/Jasa"><TextInput value={data.nama_material} onChange={v => setData(p => ({ ...p, nama_material: v }))} disabled={disabled} /></Field>
        <Field label="NOMOR PR"><TextInput value={data.nomor_pr} onChange={v => setData(p => ({ ...p, nomor_pr: v }))} disabled={disabled} /></Field>
        <Field label="MANAJEMEN KONTRAK"><Select value={data.mankon} onChange={v => setData(p => ({ ...p, mankon: v }))} options={MANKON_OPTIONS} disabled={disabled} /></Field>
      </div>

      <Field label="Status Pengadaan">
        <Select value={data.status} onChange={v => setData(p => ({ ...p, status: v }))} options={STATUS_OPTIONS} disabled={disabled} />
      </Field>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN APP ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [dataList, setDataList] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [inputType, setInputType] = useState("Pengadaan Langsung");
  const [formData, setFormData] = useState({});
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [filterMetode, setFilterMetode] = useState("Semua");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputSubMenu, setInputSubMenu] = useState(false);

  // Dashboard calculations
  const filtered = useMemo(() => {
    let d = dataList;
    if (filterTahun !== "Semua") d = d.filter(i => i.tahun_pengadaan === filterTahun);
    if (filterMetode !== "Semua") d = d.filter(i => i.metode === filterMetode);
    return d;
  }, [dataList, filterTahun, filterMetode]);

  const totalRAB = filtered.reduce((s, d) => s + (Number(d.rab_total_dengan_ppn) || 0), 0);
  const totalHPS = filtered.reduce((s, d) => s + (Number(d.hps_total_dengan_ppn) || Number(d.hpe_total_dengan_ppn) || 0), 0);
  const totalKontrak = filtered.reduce((s, d) => s + (Number(d.spk_total_dengan_ppn) || Number(d.kontrak_total_dengan_ppn) || 0), 0);
  const terkontrak = filtered.filter(d => d.status === "Terkontrak").length;
  const proses = filtered.filter(d => d.status === "Sedang Proses").length;
  const batal = filtered.filter(d => d.status === "Batal/Gagal").length;

  const startInput = (type) => {
    setInputType(type);
    setFormData({ metode: type, tahun_pengadaan: new Date().getFullYear().toString() });
    setEditId(null);
    setViewId(null);
    setPage("input");
  };

  const handleSave = () => {
    if (editId) {
      setDataList(prev => prev.map(d => d.id === editId ? { ...formData, id: editId } : d));
    } else {
      setDataList(prev => [...prev, { ...formData, id: generateId() }]);
    }
    setToast({ message: "Data Berhasil Disimpan", type: "success" });
    setEditId(null);
    setPage("dashboard");
  };

  const handleCancel = () => {
    setConfirm({
      message: "Anda yakin ingin membatalkan data pengadaan?",
      onYes: () => { setConfirm(null); setPage("dashboard"); },
      onNo: () => setConfirm(null)
    });
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setInputType(item.metode);
    setEditId(item.id);
    setViewId(null);
    setPage("input");
  };

  const handleView = (item) => {
    setFormData({ ...item });
    setInputType(item.metode);
    setViewId(item.id);
    setEditId(null);
    setPage("input");
  };

  const handleDelete = (id) => {
    setConfirm({
      message: "Apakah anda yakin ingin menghapus data pengadaan?",
      onYes: () => { setDataList(prev => prev.filter(d => d.id !== id)); setConfirm(null); setToast({ message: "Data Berhasil Dihapus", type: "success" }); },
      onNo: () => setConfirm(null)
    });
  };

  // ─── STYLES ──────────────────────────────────────────
  const sidebarStyle = {
    width: sidebarOpen ? 260 : 64, minHeight: "100vh",
    background: "linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)",
    color: "#e2e8f0", transition: "width .3s", overflow: "hidden", flexShrink: 0,
    display: "flex", flexDirection: "column", position: "relative"
  };

  const menuBtn = (active) => ({
    display: "flex", alignItems: "center", gap: 14, padding: "13px 20px",
    background: active ? "rgba(59,130,246,.2)" : "transparent",
    border: "none", color: active ? "#60a5fa" : "#cbd5e1", cursor: "pointer",
    fontSize: 14, fontWeight: active ? 700 : 500, width: "100%", textAlign: "left",
    borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
    transition: "all .2s", borderRadius: 0,
  });

  const cardStyle = (bg) => ({
    background: bg, borderRadius: 14, padding: "24px 28px", color: "#fff",
    boxShadow: "0 4px 20px rgba(0,0,0,.08)", flex: 1, minWidth: 200,
  });

  return (
    <div style={{ display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: "100vh", background: "#f0f4f8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); }}
        input:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        button:hover { filter: brightness(1.08); }
      `}</style>

      {/* ─── Sidebar ─────────────────────────────────── */}
      <div style={sidebarStyle}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 12 }}>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3, whiteSpace: "nowrap" }}>📋 Monitoring Pengadaan</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 20 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav style={{ marginTop: 16, flex: 1 }}>
          <button style={menuBtn(page === "dashboard")} onClick={() => setPage("dashboard")}>
            <Icon type="dashboard" size={18} /> {sidebarOpen && "Dashboard"}
          </button>
          <button style={menuBtn(page === "monitoring")} onClick={() => setPage("monitoring")}>
            <Icon type="monitor" size={18} /> {sidebarOpen && "Monitoring"}
          </button>
          <button style={menuBtn(page === "input")} onClick={() => setInputSubMenu(!inputSubMenu)}>
            <Icon type="input" size={18} /> {sidebarOpen && <span style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "space-between" }}>Input Data <span style={{ transform: inputSubMenu ? "rotate(180deg)" : "rotate(0)", transition: ".2s", display: "inline-block" }}><Icon type="chevron" size={14} /></span></span>}
          </button>
          {inputSubMenu && sidebarOpen && (
            <div style={{ paddingLeft: 48 }}>
              {["Pengadaan Langsung", "Tender KHS", "Tender non KHS"].map(t => (
                <button key={t} onClick={() => startInput(t)} style={{
                  display: "block", padding: "10px 14px", background: "none", border: "none",
                  color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 500,
                  width: "100%", textAlign: "left", borderRadius: 6,
                }}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* ─── Main Content ────────────────────────────── */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Header */}
        <div style={{
          padding: "20px 36px", background: "#fff",
          borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
            {page === "dashboard" ? "Dashboard" : page === "monitoring" ? "Monitoring Pengadaan" : `Input Data — ${inputType}`}
          </h1>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>

        <div style={{ padding: "28px 36px" }}>

          {/* ═══ DASHBOARD ═══ */}
          {page === "dashboard" && (
            <>
              {/* Filters */}
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Tahun</label>
                  <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} style={{ ...inputStyle, width: 140 }}>
                    <option value="Semua">Semua</option>
                    {TAHUN_OPTIONS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Metode</label>
                  <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)} style={{ ...inputStyle, width: 200 }}>
                    {METODE_OPTIONS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Top Cards */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
                <div style={cardStyle("linear-gradient(135deg, #2563eb, #1d4ed8)")}>
                  <p style={{ fontSize: 13, opacity: .85, marginBottom: 6 }}>Nilai RAB</p>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{formatRupiah(totalRAB)}</p>
                </div>
                <div style={cardStyle("linear-gradient(135deg, #7c3aed, #6d28d9)")}>
                  <p style={{ fontSize: 13, opacity: .85, marginBottom: 6 }}>Nilai HPS/HPE</p>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{formatRupiah(totalHPS)}</p>
                </div>
                <div style={cardStyle("linear-gradient(135deg, #0891b2, #0e7490)")}>
                  <p style={{ fontSize: 13, opacity: .85, marginBottom: 6 }}>Nilai Kontrak</p>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{formatRupiah(totalKontrak)}</p>
                </div>
              </div>

              {/* Bottom Cards */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ ...cardStyle("#fff"), color: "#1e293b", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✅</div>
                    <div>
                      <p style={{ fontSize: 12, color: "#64748b" }}>Terkontrak</p>
                      <p style={{ fontSize: 28, fontWeight: 800 }}>{terkontrak}</p>
                    </div>
                  </div>
                </div>
                <div style={{ ...cardStyle("#fff"), color: "#1e293b", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⏳</div>
                    <div>
                      <p style={{ fontSize: 12, color: "#64748b" }}>Sedang Proses</p>
                      <p style={{ fontSize: 28, fontWeight: 800 }}>{proses}</p>
                    </div>
                  </div>
                </div>
                <div style={{ ...cardStyle("#fff"), color: "#1e293b", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>❌</div>
                    <div>
                      <p style={{ fontSize: 12, color: "#64748b" }}>Batal/Gagal</p>
                      <p style={{ fontSize: 28, fontWeight: 800 }}>{batal}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ MONITORING ═══ */}
          {page === "monitoring" && (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Tahun</label>
                  <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} style={{ ...inputStyle, width: 140 }}>
                    <option value="Semua">Semua</option>
                    {TAHUN_OPTIONS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Metode Pengadaan</label>
                  <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)} style={{ ...inputStyle, width: 220 }}>
                    {METODE_OPTIONS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#1e3a5f", color: "#fff" }}>
                        {["No", "Nama Pekerjaan", "Metode", "Tahun", "Bidang Pengguna", "Status", "Nilai Kontrak", "Aksi"].map(h => (
                          <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Belum ada data pengadaan</td></tr>
                      ) : filtered.map((d, i) => (
                        <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "12px 16px" }}>{i + 1}</td>
                          <td style={{ padding: "12px 16px", maxWidth: 250 }}>{d.nama_pekerjaan || "-"}</td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{d.metode || "-"}</td>
                          <td style={{ padding: "12px 16px" }}>{d.tahun_pengadaan || "-"}</td>
                          <td style={{ padding: "12px 16px" }}>{d.bidang_pengguna || "-"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                              background: d.status === "Terkontrak" ? "#dcfce7" : d.status === "Sedang Proses" ? "#fef3c7" : "#fee2e2",
                              color: d.status === "Terkontrak" ? "#15803d" : d.status === "Sedang Proses" ? "#a16207" : "#dc2626",
                            }}>{d.status || "-"}</span>
                          </td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{formatRupiah(d.spk_total_dengan_ppn || d.kontrak_total_dengan_ppn || 0)}</td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleEdit(d)} title="Edit" style={{ padding: 7, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#2563eb" }}><Icon type="edit" size={15} /></button>
                              <button onClick={() => handleView(d)} title="Lihat" style={{ padding: 7, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#7c3aed" }}><Icon type="view" size={15} /></button>
                              <button onClick={() => handleDelete(d.id)} title="Hapus" style={{ padding: 7, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#dc2626" }}><Icon type="delete" size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══ INPUT FORM ═══ */}
          {page === "input" && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "32px 36px", boxShadow: "0 2px 12px rgba(0,0,0,.06)", maxWidth: 960 }}>
              {viewId && (
                <div style={{ marginBottom: 20, padding: "10px 16px", background: "#eff6ff", borderRadius: 8, color: "#1e40af", fontSize: 13, fontWeight: 600 }}>
                  Mode Lihat — Data tidak dapat diedit
                </div>
              )}

              {inputType === "Pengadaan Langsung" ? (
                <FormPengadaanLangsung data={formData} setData={setFormData} disabled={!!viewId} />
              ) : (
                <FormTender data={formData} setData={setFormData} disabled={!!viewId} isTenderKHS={inputType === "Tender KHS"} />
              )}

              {/* Action Buttons */}
              {!viewId && (
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40, paddingTop: 28, borderTop: "1px solid #e2e8f0" }}>
                  <button onClick={handleCancel} style={{
                    padding: "13px 48px", borderRadius: 10, border: "none", background: "#dc2626",
                    color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(220,38,38,.25)"
                  }}>Batal</button>
                  <button onClick={handleSave} style={{
                    padding: "13px 48px", borderRadius: 10, border: "none", background: "#16a34a",
                    color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22,163,74,.25)"
                  }}>Simpan</button>
                </div>
              )}
              {viewId && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                  <button onClick={() => setPage("monitoring")} style={{
                    padding: "13px 48px", borderRadius: 10, border: "none", background: "#2563eb",
                    color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer"
                  }}>Kembali ke Monitoring</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Overlays ─────────────────────────────── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog message={confirm.message} onYes={confirm.onYes} onNo={confirm.onNo} />}
    </div>
  );
}
