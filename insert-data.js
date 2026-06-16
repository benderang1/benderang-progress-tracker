const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/tracker.db');

const projects = [
  {
    "projectName": "Real Time Monitoring 3 - BCA",
    "client": "BCA",
    "personInCharge": "Luhung",
    "ongoingActions": "Sedang menunggu kontrak BCA (12 Juni 26)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Pembuatana Opsi lain (Festo -- Festo+IFM)",
        "pic": "LRB",
        "startDate": "2025-12-15",
        "dueDate": "2025-12-17",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Input Harga",
        "pic": "RS",
        "startDate": "2025-12-19",
        "dueDate": "2025-12-22",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi Design Ladder",
        "pic": "AOJ, LRB",
        "startDate": "2026-01-08",
        "dueDate": "2026-01-12",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "List Model dan Qty Sparepart",
        "pic": "LRB",
        "startDate": "2026-01-08",
        "dueDate": "2026-01-12",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Review ulang BoM",
        "pic": "LRB",
        "startDate": "2026-01-08",
        "dueDate": "2026-01-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi Penawaran",
        "pic": "LRB, PK",
        "startDate": "2026-01-08",
        "dueDate": "2026-01-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Persiapan drawing wiring",
        "pic": "DH, LRB",
        "startDate": "2026-03-06",
        "dueDate": "2026-03-10",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Drawing wiring",
        "pic": "DH",
        "startDate": "2026-03-10",
        "dueDate": "2026-03-13",
        "progress": 100,
        "comments": "Dilanjutkan dengan proses revisi",
        "status": "Done"
      },
      {
        "task": "Verifikasi Drawing",
        "pic": "DH",
        "startDate": "2026-03-27",
        "dueDate": "2026-03-30",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Double-Check Drawing",
        "pic": "DH, LRB",
        "startDate": "2026-04-10",
        "dueDate": "2026-04-16",
        "progress": 100,
        "comments": "Akan diselesaikan hari ini",
        "status": "Done"
      },
      {
        "task": "Pengiriman Drawing ke BCA",
        "pic": "RS, DH",
        "startDate": "2026-04-17",
        "dueDate": "2026-04-22",
        "progress": 0,
        "comments": "Belum PO dan masih perlu Revisi",
        "status": "Hold"
      },
      {
        "task": "Revisi Drawing RTM-3 BCA",
        "pic": "DH, LRB",
        "startDate": "2026-04-20",
        "dueDate": "2026-04-24",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Cross-check Drawing",
        "pic": "PK",
        "startDate": "2026-04-24",
        "dueDate": "2026-04-27",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Kick-off Meeting",
        "pic": "PK",
        "startDate": "",
        "dueDate": "2026-05-06",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi Drawing RTM-3 BCA (2)",
        "pic": "LRB",
        "startDate": "2026-05-07",
        "dueDate": "2026-05-11",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Drawing Mechanical",
        "pic": "LRB, AOJ",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-12",
        "progress": 100,
        "comments": "Perlu diperiksa LRB",
        "status": "Done"
      },
      {
        "task": "Update Item needed-date",
        "pic": "LRB",
        "startDate": "2026-05-07",
        "dueDate": "2026-05-12",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Approval Drawing",
        "pic": "LRB",
        "startDate": "2026-05-04",
        "dueDate": "2026-05-15",
        "progress": 95,
        "comments": "Masih proses revisi ke-3",
        "status": "On-going"
      },
      {
        "task": "Revisi ke-2 Drawing RTM-3 BCA",
        "pic": "LRB",
        "startDate": "2026-05-13",
        "dueDate": "2026-05-15",
        "progress": 95,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Upload data ke BCA",
        "pic": "LRB",
        "startDate": "2026-05-15",
        "dueDate": "2026-05-15",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Finalisasi Draft SPK",
        "pic": "RS",
        "startDate": "",
        "dueDate": "2026-05-22",
        "progress": 95,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Klarifikasi rencana penambahan Filter",
        "pic": "LRB",
        "startDate": "2026-05-22",
        "dueDate": "2026-05-25",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Purchasing Material",
        "pic": "RS, LRB",
        "startDate": "",
        "dueDate": "2026-06-19",
        "progress": 0,
        "comments": "Belum mulai karena belum PO",
        "status": "On-going"
      },
      {
        "task": "Klarifikasi item Rowshare",
        "pic": "LRB",
        "startDate": "2026-05-15",
        "dueDate": "2026-05-22",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Workshop Fabrication",
        "pic": "AOJ, LRB",
        "startDate": "",
        "dueDate": "2026-06-12",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Site Installation",
        "pic": "LRB",
        "startDate": "",
        "dueDate": "2026-06-22",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Commisioning",
        "pic": "LRB",
        "startDate": "",
        "dueDate": "2026-07-24",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Hand-over",
        "pic": "LRB",
        "startDate": "",
        "dueDate": "2026-07-31",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Demo Real-Time 7 (Monitoring IoT Dispenser)",
    "client": "Benderang",
    "personInCharge": "Luhung",
    "ongoingActions": "Perbaiki prototype 1",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Tunggu quotation dari Phoenix-Contact, kemudian siap PO",
        "pic": "RS",
        "startDate": "2025-03-28",
        "dueDate": "",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Tarik dan Konek kabel ethernet dari Sonoff ke Router",
        "pic": "GS, DH",
        "startDate": "2025-04-16",
        "dueDate": "",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Meeting next step untuk Demo Real-Time Monitoring",
        "pic": "Engineer",
        "startDate": "2025-04-16",
        "dueDate": "",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Panel bisa menjalankan motor",
        "pic": "DH, LRB",
        "startDate": "2025-04-28",
        "dueDate": "2025-05-02",
        "progress": 0,
        "comments": "",
        "status": "Hold"
      },
      {
        "task": "Data Sonoff untuk monitoring",
        "pic": "LM, GS",
        "startDate": "2025-04-29",
        "dueDate": "2025-05-09",
        "progress": 0,
        "comments": "",
        "status": "Hold"
      },
      {
        "task": "Komponen terpasang di panel",
        "pic": "LRB, GS",
        "startDate": "2025-05-07",
        "dueDate": "2025-05-09",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pengetesan robustness Item (ET-Series to Raspberry Pi, ER5000)",
        "pic": "LM",
        "startDate": "2025-11-13",
        "dueDate": "2025-12-09",
        "progress": 30,
        "comments": "Masih on going",
        "status": "On-going"
      },
      {
        "task": "Dokumentasi pembuktian device yang bermasalah",
        "pic": "LM",
        "startDate": "2025-11-28",
        "dueDate": "2025-12-09",
        "progress": 10,
        "comments": "Proses pengetesan ET1010 dan ET1020",
        "status": "On-going"
      },
      {
        "task": "Instalasi kontrol ke Dispenser",
        "pic": "LM",
        "startDate": "2026-05-18",
        "dueDate": "2026-05-19",
        "progress": 0,
        "comments": "Perlu bantuan tim",
        "status": "On-going"
      },
      {
        "task": "Life-On",
        "pic": "LM",
        "startDate": "",
        "dueDate": "2026-05-20",
        "progress": 80,
        "comments": "Dashboard sudah bisa diakses, kekurangannya pemasangan",
        "status": "On-going"
      },
      {
        "task": "Test durability",
        "pic": "LM",
        "startDate": "2026-05-22",
        "dueDate": "2026-05-29",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Perbaiki Prototype-1",
        "pic": "LM",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-19",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pembelian Capacitor 0.1uF atau Modul ADS1115",
        "pic": "LM",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-17",
        "progress": 0,
        "comments": "Pengajuan lewat email dilakukan hari ini",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Demo Real-Time 8 (Multiple Machine Monitoring Through Cloud)",
    "client": "Benderang",
    "personInCharge": "",
    "ongoingActions": "Pembuatan database di AWS",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Mempelajari arsitektur IoT AWS",
        "pic": "LM",
        "startDate": "2026-05-29",
        "dueDate": "2026-06-03",
        "progress": 100,
        "comments": "Target: Rabu, 03 Juni 2026",
        "status": "Done"
      },
      {
        "task": "Perlu CC untuk daftar AWS dari BF",
        "pic": "LM",
        "startDate": "2026-05-29",
        "dueDate": "2026-06-05",
        "progress": 100,
        "comments": "05 Juni 26",
        "status": "Done"
      },
      {
        "task": "Pembuatan database di AWS",
        "pic": "LM",
        "startDate": "2026-06-05",
        "dueDate": "2026-06-12",
        "progress": 95,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Energy Monitoring",
    "client": "Benderang",
    "personInCharge": "Leo",
    "ongoingActions": "Follow up pengiriman unit dan sample baru dari Denkai",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Leo perlu pastikan ke Pak Praderm dipasang dimana",
        "pic": "LM",
        "startDate": "2026-06-05",
        "dueDate": "2026-06-08",
        "progress": 0,
        "comments": "Hold karena perangkat tidak bisa terkoneksi ke aplikasi",
        "status": "Hold"
      },
      {
        "task": "Pastikan setelah pasang apa yang dilakukan",
        "pic": "LM",
        "startDate": "2026-06-05",
        "dueDate": "2026-06-08",
        "progress": 0,
        "comments": "",
        "status": "Hold"
      },
      {
        "task": "Follow up pengiriman unit dan sample baru dari Denkai",
        "pic": "LM",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-12",
        "progress": 100,
        "comments": "Barang dikirim tanggal 16 Jun dari Malaysia",
        "status": "Done"
      }
    ]
  },
  {
    "projectName": "Auto Security Seal Tape",
    "client": "Sanbe",
    "personInCharge": "Alwi",
    "ongoingActions": "Menunggu approval revisi quotation dari BF",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Konsep design",
        "pic": "LRB, AOJ",
        "startDate": "2025-11-25",
        "dueDate": "2025-11-26",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Drawing System",
        "pic": "AOJ",
        "startDate": "2025-11-26",
        "dueDate": "2025-12-01",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "BoM",
        "pic": "LRB, AOJ",
        "startDate": "2025-11-28",
        "dueDate": "2025-12-01",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Review Design by Client",
        "pic": "PP, LRB",
        "startDate": "",
        "dueDate": "2026-01-29",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Meeting membahas hasil survey",
        "pic": "AOJ, LRB",
        "startDate": "2026-04-10",
        "dueDate": "2026-04-10",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Design konsep (Seal sticker)",
        "pic": "AOJ",
        "startDate": "2026-04-13",
        "dueDate": "2026-04-16",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan BoM opsi sticker",
        "pic": "LRB, AOJ",
        "startDate": "2026-04-17",
        "dueDate": "2026-04-21",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian harga",
        "pic": "RS",
        "startDate": "2026-04-21",
        "dueDate": "2026-04-27",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Quotation",
        "pic": "PK",
        "startDate": "2026-04-27",
        "dueDate": "2026-04-28",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Approval Quotation",
        "pic": "Flora",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pengiriman Quotation",
        "pic": "RS",
        "startDate": "",
        "dueDate": "2026-05-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Meeting Revisi BoM",
        "pic": "PK",
        "startDate": "2026-05-22",
        "dueDate": "2026-05-22",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pencarian harga (revisi)",
        "pic": "RS, PK",
        "startDate": "2026-05-22",
        "dueDate": "2026-05-25",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pembuatan Quotation (revisi)",
        "pic": "PK",
        "startDate": "2026-05-25",
        "dueDate": "2026-05-25",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Approval Quotation (revisi)",
        "pic": "FM",
        "startDate": "2026-05-25",
        "dueDate": "2026-05-28",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pengiriman Quotation (revisi)",
        "pic": "RS",
        "startDate": "2026-05-28",
        "dueDate": "2026-05-28",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Vision Inspection",
    "client": "Imedco",
    "personInCharge": "Luhung",
    "ongoingActions": "Menunggu feedback dari User",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Drawing Bracket Camera 1 area + rejector",
        "pic": "AOJ, LRB, DH",
        "startDate": "2025-11-28",
        "dueDate": "2025-12-15",
        "progress": 100,
        "comments": "Selesai sketsa pak Doni",
        "status": "Done"
      },
      {
        "task": "BoM",
        "pic": "LRB, AOJ, DH",
        "startDate": "2025-11-28",
        "dueDate": "2025-12-30",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Trial oleh Cognex",
        "pic": "LRB",
        "startDate": "2026-02-16",
        "dueDate": "2026-02-25",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian Harga",
        "pic": "RS",
        "startDate": "2026-03-09",
        "dueDate": "2026-03-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Quotation",
        "pic": "PK",
        "startDate": "2026-03-15",
        "dueDate": "2026-03-20",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Proposal",
        "pic": "PK",
        "startDate": "2026-04-27",
        "dueDate": "2026-04-28",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Approval Proposal",
        "pic": "Flora",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "not approved",
        "status": "On-going"
      },
      {
        "task": "Revisi Proposal",
        "pic": "PK",
        "startDate": "2026-05-22",
        "dueDate": "2026-05-26",
        "progress": 80,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Approval Proposal rev.1",
        "pic": "FM",
        "startDate": "",
        "dueDate": "2026-05-29",
        "progress": 0,
        "comments": "Menunggu feedback dari user",
        "status": "On-going"
      },
      {
        "task": "Pengiriman Proposal",
        "pic": "RS",
        "startDate": "",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Menunggu feedback dari user",
        "status": "On-going"
      },
      {
        "task": "Presentation",
        "pic": "MT",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-15",
        "progress": 0,
        "comments": "Menunggu feedback dari user",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Machine Utilization",
    "client": "Imedco",
    "personInCharge": "Luhung",
    "ongoingActions": "Menunggu feedback dari User",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Mapping hardware untuk Monitoring per machine",
        "pic": "LRB, GS",
        "startDate": "2025-11-10",
        "dueDate": "2025-11-14",
        "progress": 100,
        "comments": "(PB pakai Fort)",
        "status": "Done"
      },
      {
        "task": "BoM",
        "pic": "LRB, GS",
        "startDate": "2025-11-10",
        "dueDate": "2025-11-14",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Presentasi Monitoring Machine Utilization",
        "pic": "LRB",
        "startDate": "2025-11-14",
        "dueDate": "2025-11-18",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian Harga barang",
        "pic": "RS",
        "startDate": "",
        "dueDate": "2026-02-16",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Quotation",
        "pic": "PK",
        "startDate": "2026-03-13",
        "dueDate": "2026-03-20",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Proposal",
        "pic": "PK",
        "startDate": "2026-04-27",
        "dueDate": "2026-04-28",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Approval Proposal",
        "pic": "Flora",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pengiriman Proposal",
        "pic": "RS",
        "startDate": "",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Menunggu approval proposal",
        "status": "Hold"
      },
      {
        "task": "Presentation",
        "pic": "MT",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-15",
        "progress": 0,
        "comments": "Menunggu feedback dari user, Follow up by Marshel",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Stabilisasi Suhu",
    "client": "PAS",
    "personInCharge": "Doni",
    "ongoingActions": "Project sudah selesai (Pembuatan manual book)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Meeting follow up survey",
        "pic": "DH, LRB",
        "startDate": "",
        "dueDate": "2026-01-09",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian Harga",
        "pic": "RS",
        "startDate": "2026-01-23",
        "dueDate": "2026-01-30",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Quotation",
        "pic": "PK",
        "startDate": "2026-02-13",
        "dueDate": "2026-02-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Recommendation Konsep",
        "pic": "DH",
        "startDate": "",
        "dueDate": "2026-03-27",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan BoM 3 opsi konsep baru",
        "pic": "DH, LRB",
        "startDate": "2026-04-06",
        "dueDate": "2026-04-08",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Quotation (opsi baru)",
        "pic": "PK",
        "startDate": "2026-04-10",
        "dueDate": "2026-04-15",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Final Survey",
        "pic": "LRB, DH",
        "startDate": "",
        "dueDate": "2026-05-04",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan program untuk HMI+PLC Samkoon",
        "pic": "LRB",
        "startDate": "2026-05-11",
        "dueDate": "2026-05-15",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembelian material",
        "pic": "RS, DH",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-15",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Site Instalation",
        "pic": "All Team",
        "startDate": "2026-05-25",
        "dueDate": "2026-05-27",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Commisioning",
        "pic": "All Team",
        "startDate": "2026-05-27",
        "dueDate": "2026-05-29",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Hand-over",
        "pic": "DH",
        "startDate": "2026-06-02",
        "dueDate": "2026-06-03",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan manual book",
        "pic": "LRB",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-15",
        "progress": 80,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Packing Machine",
    "client": "Sojitz - Internusa",
    "personInCharge": "Luhung",
    "ongoingActions": "Data Rowshare sudah bisa diakses",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Brainstorm design",
        "pic": "AOJ, LRB",
        "startDate": "2026-01-09",
        "dueDate": "2026-01-14",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Design concept",
        "pic": "AOJ, LRB",
        "startDate": "2026-02-09",
        "dueDate": "2026-02-16",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "ReDesign Concept",
        "pic": "AOJ",
        "startDate": "2026-03-06",
        "dueDate": "2026-03-12",
        "progress": 100,
        "comments": "Sudah approved oleh Pak Praderm",
        "status": "Done"
      },
      {
        "task": "Buat BoM untuk Konsep Packing Machine",
        "pic": "AOJ",
        "startDate": "2026-03-27",
        "dueDate": "2026-04-01",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian Harga dari BoM",
        "pic": "RS",
        "startDate": "2026-04-02",
        "dueDate": "2026-04-09",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi BoM",
        "pic": "LRB",
        "startDate": "2026-04-21",
        "dueDate": "2026-04-23",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian Harga (revisi)",
        "pic": "RS",
        "startDate": "2026-04-27",
        "dueDate": "2026-04-28",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Melengkapi data engineering item",
        "pic": "LRB",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-08",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Quotation dan proposal",
        "pic": "PK",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Mundur di minggu depan (22-May)",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Auto Packing Line",
    "client": "Sanjaya",
    "personInCharge": "Alwi",
    "ongoingActions": "Data Rowshare sudah bisa diakses",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Pembuatan Konsep",
        "pic": "AOJ, LRB",
        "startDate": "2026-02-13",
        "dueDate": "2026-02-25",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Buat partlist untuk perkiraan harga",
        "pic": "DH",
        "startDate": "2026-02-27",
        "dueDate": "2026-03-02",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian harga",
        "pic": "RS",
        "startDate": "2026-03-06",
        "dueDate": "",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Presentasi Konsep",
        "pic": "LRB",
        "startDate": "2026-03-27",
        "dueDate": "2026-04-02",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Breakdown harga conveyor Lion Wings >< Sanjaya",
        "pic": "DH, AOJ",
        "startDate": "2026-04-24",
        "dueDate": "2026-04-28",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Input Rowshare",
        "pic": "RS",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-11",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan Proposal dan Quotation",
        "pic": "PK",
        "startDate": "2026-05-11",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Mundur di tanggal 21-May",
        "status": "On-going"
      },
      {
        "task": "Approval Proposal dan Quotation",
        "pic": "Flora",
        "startDate": "2026-05-11",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Menunggu selesai pembuatan",
        "status": "Hold"
      },
      {
        "task": "Pengiriman Proposal dan Quotation",
        "pic": "RS",
        "startDate": "2026-05-11",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Menunggu selesai approval",
        "status": "Hold"
      }
    ]
  },
  {
    "projectName": "Press Machine",
    "client": "Ichii",
    "personInCharge": "Luhung",
    "ongoingActions": "Cancel",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Survey",
        "pic": "AOJ, LRB",
        "startDate": "",
        "dueDate": "2026-02-11",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Design Layout Konsep terbaru",
        "pic": "AOJ",
        "startDate": "2026-02-12",
        "dueDate": "2026-02-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi Design Konstruksi",
        "pic": "AOJ",
        "startDate": "2026-03-10",
        "dueDate": "2026-03-12",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "BoM Konstruksi",
        "pic": "AOJ",
        "startDate": "2026-03-13",
        "dueDate": "2026-03-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi Design",
        "pic": "AOJ",
        "startDate": "2026-04-13",
        "dueDate": "2026-04-17",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi Design (2)",
        "pic": "AOJ",
        "startDate": "2026-04-24",
        "dueDate": "2026-04-24",
        "progress": 100,
        "comments": "",
        "status": "Done"
      }
    ]
  },
  {
    "projectName": "Sertifikasi IUJPL",
    "client": "Benderang",
    "personInCharge": "",
    "ongoingActions": "Approval Pembayaran Sertifikasi Kompetensi",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Presentasi Internal",
        "pic": "LRB, AOJ",
        "startDate": "",
        "dueDate": "2026-03-25",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Ujian Kompetensi IUJPL",
        "pic": "LRB, AOJ",
        "startDate": "",
        "dueDate": "2026-03-30",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Membawa perlengkapan APD saat ujian",
        "pic": "LRB, AOJ",
        "startDate": "",
        "dueDate": "2026-03-30",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Mengetahui hal yang dilakukan untuk memulai sertifikasi badan",
        "pic": "RS",
        "startDate": "2026-04-10",
        "dueDate": "2026-04-13",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Melengkapi Akta Pendirian Badan Usaha",
        "pic": "RS",
        "startDate": "2026-04-10",
        "dueDate": "2026-04-17",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Melengkapi Laporan Neraca Keuangan Perusahaan",
        "pic": "RS",
        "startDate": "",
        "dueDate": "2026-04-30",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Melengkapi Approval laporan Neraca Keuangan",
        "pic": "Management",
        "startDate": "",
        "dueDate": "2026-05-18",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pengambilan sertifikat fisik untuk lanjut proses IUJPTL",
        "pic": "Management",
        "startDate": "",
        "dueDate": "2026-05-20",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Selesai sertifikasi Badan",
        "pic": "Management",
        "startDate": "",
        "dueDate": "2026-08-31",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Selesai IUJPTL (Sah sebagai Perusahaan PLTS)",
        "pic": "Management",
        "startDate": "",
        "dueDate": "2026-10-31",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Auto Line Process (Oven)",
    "client": "IPI Sunijaya",
    "personInCharge": "Marcell",
    "ongoingActions": "?",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Diskusi Automation Line",
        "pic": "MT, LRB, PK",
        "startDate": "2026-03-13",
        "dueDate": "2026-03-16",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Rough BoM 3/6 short execution",
        "pic": "MT, LRB, PK",
        "startDate": "2026-03-13",
        "dueDate": "2026-03-17",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pencarian Harga",
        "pic": "PK, RS",
        "startDate": "2026-03-17",
        "dueDate": "2026-03-23",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Pembuatan opsi kedua BoM",
        "pic": "PK, RS, LRB",
        "startDate": "2026-03-27",
        "dueDate": "2026-03-31",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Approval Quotation (Oven)",
        "pic": "Flora",
        "startDate": "2026-05-08",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Masih menunggu Approval",
        "status": "On-going"
      },
      {
        "task": "Pengiriman Quotation (Oven)",
        "pic": "RS",
        "startDate": "2026-05-13",
        "dueDate": "2026-05-13",
        "progress": 0,
        "comments": "Menunggu Approval",
        "status": "On-going"
      },
      {
        "task": "Konfirmasi Meeting dengan Klien",
        "pic": "",
        "startDate": "2026-05-29",
        "dueDate": "2026-06-04",
        "progress": 0,
        "comments": "Klien sedang mau meMeetingkan",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Installasi Compressor",
    "client": "Good Year",
    "personInCharge": "Doni",
    "ongoingActions": "menunggu respon klien, MT follow up PP (15Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Buat Timeline instalasi",
        "pic": "DH, LRB",
        "startDate": "2026-04-24",
        "dueDate": "2026-04-24",
        "progress": 100,
        "comments": "",
        "status": "Done"
      }
    ]
  },
  {
    "projectName": "Auto Weighing Banbury #4",
    "client": "Good Year",
    "personInCharge": "LRB",
    "ongoingActions": "menunggu respon klien, MT follow up PP (15Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Konsep design",
        "pic": "LRB, AOJ",
        "startDate": "2026-04-13",
        "dueDate": "2026-04-24",
        "progress": 100,
        "comments": "Perlu penambahan fence",
        "status": "Done"
      },
      {
        "task": "Pembuatan BoM",
        "pic": "LRB, AOJ",
        "startDate": "2026-04-27",
        "dueDate": "2026-04-30",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi Design",
        "pic": "AOJ",
        "startDate": "2026-04-24",
        "dueDate": "2026-04-29",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Laporan Lengkap Survey Goodyear",
        "pic": "DH",
        "startDate": "",
        "dueDate": "2026-05-11",
        "progress": 100,
        "comments": "",
        "status": "Done"
      }
    ]
  },
  {
    "projectName": "Auto Pick n Place Pigment",
    "client": "Good Year",
    "personInCharge": "LRB",
    "ongoingActions": "menunggu respon klien, MT follow up PP (15Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Laporan Lengkap Survey Goodyear",
        "pic": "DH",
        "startDate": "",
        "dueDate": "2026-05-11",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Konsep design",
        "pic": "",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "Wait Auto Weighing BB design",
        "status": "On-going"
      },
      {
        "task": "Pembuatan BoM",
        "pic": "",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "Wait Auto Weighing BB design",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "AMR Area BTB-BTC",
    "client": "Good Year",
    "personInCharge": "LRB",
    "ongoingActions": "menunggu respon klien, MT follow up PP (15Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Proposal AMR Laporan Lengkap Survey Goodyear",
        "pic": "PK",
        "startDate": "",
        "dueDate": "2026-05-11",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Konsep design",
        "pic": "DH",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pembuatan BoM",
        "pic": "DH",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Mesin 8 & 10 inch (Vision) - Extruder",
    "client": "Good Year",
    "personInCharge": "LRB",
    "ongoingActions": "menunggu respon klien, MT follow up PP (15Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Laporan Lengkap Survey Goodyear",
        "pic": "DH",
        "startDate": "",
        "dueDate": "2026-05-11",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi laporan lengkap survey",
        "pic": "DH",
        "startDate": "2026-05-11",
        "dueDate": "2026-05-15",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Konsep design",
        "pic": "",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pembuatan BoM",
        "pic": "",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Finished Goods Inspection (QC) (Vision)",
    "client": "Good Year",
    "personInCharge": "LRB",
    "ongoingActions": "menunggu respon klien, MT follow up BF (15Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Laporan Lengkap Survey Goodyear",
        "pic": "DH",
        "startDate": "",
        "dueDate": "2026-05-11",
        "progress": 100,
        "comments": "",
        "status": "Done"
      },
      {
        "task": "Revisi laporan lengkap survey",
        "pic": "DH",
        "startDate": "2026-05-11",
        "dueDate": "2026-05-15",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Konsep design",
        "pic": "DH",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pembuatan BoM",
        "pic": "DH",
        "startDate": "",
        "dueDate": "",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Press Machine Kukil",
    "client": "Ohsung",
    "personInCharge": "Alwi",
    "ongoingActions": "Improvement",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "System Destacker for Autoweighing",
    "client": "Anugrah Jaya",
    "personInCharge": "Luhung",
    "ongoingActions": "Menunggu data dari klien, cari vendor mekanik",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Pembuatan BoM",
        "pic": "LRB",
        "startDate": "2026-05-11",
        "dueDate": "2026-05-15",
        "progress": 90,
        "comments": "Menyusul BoM Mechanical",
        "status": "On-going"
      },
      {
        "task": "Pencarian Harga",
        "pic": "RS",
        "startDate": "2026-05-15",
        "dueDate": "2026-05-19",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pembuatan Quotation",
        "pic": "PK",
        "startDate": "2026-05-19",
        "dueDate": "2026-05-20",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Approval Quotation",
        "pic": "Flora",
        "startDate": "2026-05-20",
        "dueDate": "2026-05-21",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Pengiriman Quotation",
        "pic": "RS",
        "startDate": "2026-05-21",
        "dueDate": "2026-05-21",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Desain pallet magazine",
        "pic": "AOJ",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-18",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "Vision for Pallet Inspection",
    "client": "Danone",
    "personInCharge": "",
    "ongoingActions": "Trial sekitar 22-26 Juni (Omron dan Cognex)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": [
      {
        "task": "Meeting pembahasan mendapatkan foto pallet kayu",
        "pic": "MT, LRB, DH, AOJ",
        "startDate": "2026-05-19",
        "dueDate": "2026-05-19",
        "progress": 100,
        "comments": "Harus hari ini",
        "status": "Done"
      },
      {
        "task": "Memastikan tanggal trial (Omron & Cognex)",
        "pic": "LRB",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-17",
        "progress": 0,
        "comments": "",
        "status": "On-going"
      },
      {
        "task": "Persiapan proses trial (jika diperlukan)",
        "pic": "DH, LRB",
        "startDate": "2026-06-12",
        "dueDate": "2026-06-19",
        "progress": 0,
        "comments": "Wait info LRB",
        "status": "On-going"
      }
    ]
  },
  {
    "projectName": "RTM For Flowmeter E+H",
    "client": "Danone",
    "personInCharge": "",
    "ongoingActions": "Follow up ke PP kapan meetingnya (DH 12 Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Notifikasi masuk area produksi tanpa cuci tangan",
    "client": "Danone",
    "personInCharge": "",
    "ongoingActions": "Follow up ke PP kapan meetingnya (DH 12 Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "AMR Area SLM Machine - 3D Print Metal",
    "client": "ACMI",
    "personInCharge": "Marshel",
    "ongoingActions": "menunggu respon klien, MT follow up PP (15Jun)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Perbaikan mesin ACRA",
    "client": "MSA",
    "personInCharge": "LRB",
    "ongoingActions": "Hari Rabu akan Visit (17 Juni)",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Upgrade mesin linting",
    "client": "Mitra Prodin",
    "personInCharge": "",
    "ongoingActions": "",
    "status": "On-going",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "New BI Cash Pack",
    "client": "BCA",
    "personInCharge": "Alwi",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Auto Line Packing",
    "client": "Sanbe",
    "personInCharge": "Luhung",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Palletizing",
    "client": "Mortar Utama",
    "personInCharge": "Luhung",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Case Packer",
    "client": "Lion Wings",
    "personInCharge": "Luhung",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Conveyor",
    "client": "Sojitz",
    "personInCharge": "Luhung",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Automatic Slip Sheet Remover",
    "client": "Omron",
    "personInCharge": "Alwi",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Upgrade Spoon Machine",
    "client": "Omron",
    "personInCharge": "Doni",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Roll Length Measurement",
    "client": "Omron - Oji",
    "personInCharge": "Luhung",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Robotic 3D Inspection",
    "client": "3D Evolution",
    "personInCharge": "Luhung",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Packaging Machine Troubleshooting",
    "client": "Bias Inti Sejahera",
    "personInCharge": "Luhung",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Maintenance",
    "client": "PKF",
    "personInCharge": "Doni",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  },
  {
    "projectName": "Real Time Monitoring",
    "client": "PKF",
    "personInCharge": "Leo",
    "ongoingActions": "",
    "status": "Hold",
    "startDate": "",
    "endDate": "",
    "progress": 0,
    "pastDueTasks": 0,
    "tasks": []
  }
];


db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    projects.forEach(project => {
        const stmt = db.prepare(`
            INSERT INTO projects
            (projectName, client, personInCharge, startDate, endDate, progress, ongoingActions, pastDueTasks, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            [project.projectName, project.client, project.personInCharge,
             project.startDate, project.endDate, project.progress,
             project.ongoingActions, project.pastDueTasks, project.status],
            function(err) {
                if (err) { console.error("Project insert error:", err); return; }
                const projectId = this.lastID;

                if (!project.tasks || project.tasks.length === 0) return;

                const taskStmt = db.prepare(`
                    INSERT INTO tasks
                    (project_id, task, pic, startDate, dueDate, progress, comments, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                project.tasks.forEach(task => {
                    taskStmt.run(
                        [projectId, task.task, task.pic, task.startDate,
                         task.dueDate, task.progress, task.comments, task.status],
                        function(err) {
                            if (err) console.error("Task insert error:", err);
                        }
                    );
                });

                taskStmt.finalize();
            }
        );

        stmt.finalize();
    });

    db.run("COMMIT", err => {
        if (err) {
            console.error("Commit error:", err);
            db.run("ROLLBACK");
        } else {
            console.log("All data inserted successfully.");
        }
        db.close();
    });
});