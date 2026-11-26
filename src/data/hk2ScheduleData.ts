export type ScheduleClassCode = "D25A" | "D25B" | "D25C" | "D25D";

export type ScheduleEventKind = "theory" | "practice" | "exam" | "makeup";

export interface ClassTrackMeta {
  code: ScheduleClassCode;
  label: string;
  shortLabel: string;
  description: string;
}

export interface Hk2ScheduleEvent {
  date: string; // YYYY-MM-DD
  week: number;
  classCode: ScheduleClassCode;
  session: "Sáng" | "Chiều";
  subject: string;
  detail: string;
  kind: ScheduleEventKind;
}

export interface Hk2Holiday {
  date: string; // YYYY-MM-DD
  week: number;
  label: string;
}

export const SCHEDULE_CLASS_META: Record<ScheduleClassCode, ClassTrackMeta> = {
  D25A: {
    code: "D25A",
    label: "Lớp D25A",
    shortLabel: "D25A",
    description: "Ca Chiều: Thực tập TT KST & TT HPT2 (Nhóm 1–8), lịch bù Tết DL và lịch thi học phần",
  },
  D25B: {
    code: "D25B",
    label: "Lớp D25B",
    shortLabel: "D25B",
    description: "Ca Sáng: Thực tập KST & HPT2 (Nhóm 9–18) · Ca Chiều: Lý thuyết & Lịch thi (GĐ1, 6B, 7C, 7D)",
  },
  D25C: {
    code: "D25C",
    label: "Lớp D25C",
    shortLabel: "D25C",
    description: "Ca Sáng: Lý thuyết (GĐ2, 7B, 7C, 7D) · Ca Chiều: Thực tập KST & HPT2 (Nhóm 19–26) & Lịch thi",
  },
  D25D: {
    code: "D25D",
    label: "Lớp D25D",
    shortLabel: "D25D",
    description: "Ca Chiều: Thực tập TT KST & TT HPT2 (theo phân nhóm lịch HK2)",
  },
};

export const HK2_HOLIDAYS: Hk2Holiday[] = [
  {
    "date": "2026-11-24",
    "week": 2,
    "label": "Ngày Văn hóa Việt Nam (Nghỉ học)"
  },
  {
    "date": "2027-01-01",
    "week": 7,
    "label": "Tết Dương lịch 2027 (Nghỉ lễ)"
  },
  {
    "date": "2027-01-25",
    "week": 11,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-01-26",
    "week": 11,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-01-27",
    "week": 11,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-01-28",
    "week": 11,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-01-29",
    "week": 11,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-01-30",
    "week": 11,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-01-31",
    "week": 11,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-01",
    "week": 12,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-02",
    "week": 12,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-03",
    "week": 12,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-04",
    "week": 12,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-05",
    "week": 12,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-06",
    "week": 12,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-07",
    "week": 12,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-08",
    "week": 13,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-09",
    "week": 13,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-10",
    "week": 13,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-11",
    "week": 13,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-12",
    "week": 13,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-13",
    "week": 13,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  },
  {
    "date": "2027-02-14",
    "week": 13,
    "label": "Nghỉ Tết Nguyên Đán 2027"
  }
];

export const HK2_SCHEDULE_EVENTS: Hk2ScheduleEvent[] = [
  {
    "date": "2026-11-16",
    "week": 1,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-11-16",
    "week": 1,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-11-17",
    "week": 1,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2026-11-18",
    "week": 1,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-11-18",
    "week": 1,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-11-19",
    "week": 1,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ6",
    "kind": "theory"
  },
  {
    "date": "2026-11-19",
    "week": 1,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B_217 Hồng Bàng",
    "kind": "theory"
  },
  {
    "date": "2026-11-19",
    "week": 1,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-11-20",
    "week": 1,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-11-20",
    "week": 1,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ5",
    "kind": "theory"
  },
  {
    "date": "2026-11-23",
    "week": 2,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-11-23",
    "week": 2,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-11-25",
    "week": 2,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-11-25",
    "week": 2,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-11-26",
    "week": 2,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ2 (Đổi phòng)",
    "kind": "makeup"
  },
  {
    "date": "2026-11-26",
    "week": 2,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-11-27",
    "week": 2,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-11-27",
    "week": 2,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-11-30",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2026-11-30",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2026-11-30",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2026-11-30",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2026-11-30",
    "week": 3,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-11-30",
    "week": 3,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-01",
    "week": 3,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm thực hành D25D",
    "kind": "practice"
  },
  {
    "date": "2026-12-01",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2026-12-01",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2026-12-01",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2026-12-01",
    "week": 3,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-01",
    "week": 3,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2026-12-02",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2026-12-02",
    "week": 3,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm thực hành D25D",
    "kind": "practice"
  },
  {
    "date": "2026-12-02",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2026-12-02",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2026-12-02",
    "week": 3,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-02",
    "week": 3,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-03",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2026-12-03",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2026-12-03",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2026-12-03",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2026-12-03",
    "week": 3,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B",
    "kind": "theory"
  },
  {
    "date": "2026-12-03",
    "week": 3,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-04",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2026-12-04",
    "week": 3,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2026-12-04",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2026-12-04",
    "week": 3,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2026-12-04",
    "week": 3,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-04",
    "week": 3,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-07",
    "week": 4,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-07",
    "week": 4,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-07",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2026-12-07",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2026-12-08",
    "week": 4,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-08",
    "week": 4,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2026-12-08",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2026-12-09",
    "week": 4,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-09",
    "week": 4,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-09",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2026-12-09",
    "week": 4,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 37,38",
    "kind": "practice"
  },
  {
    "date": "2026-12-10",
    "week": 4,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B",
    "kind": "theory"
  },
  {
    "date": "2026-12-10",
    "week": 4,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-10",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2026-12-10",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2026-12-11",
    "week": 4,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-11",
    "week": 4,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-11",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2026-12-11",
    "week": 4,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2026-12-14",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2026-12-14",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2026-12-14",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2026-12-14",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2026-12-14",
    "week": 5,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-15",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2026-12-15",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2026-12-15",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2026-12-15",
    "week": 5,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-15",
    "week": 5,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2026-12-16",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2026-12-16",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2026-12-16",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2026-12-16",
    "week": 5,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-17",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2026-12-17",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2026-12-17",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2026-12-17",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2026-12-17",
    "week": 5,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B",
    "kind": "theory"
  },
  {
    "date": "2026-12-17",
    "week": 5,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-18",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2026-12-18",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2026-12-18",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2026-12-18",
    "week": 5,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2026-12-18",
    "week": 5,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-18",
    "week": 5,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-19",
    "week": 5,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2026-12-19",
    "week": 5,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2026-12-19",
    "week": 5,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2026-12-21",
    "week": 6,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-21",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2026-12-21",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2026-12-22",
    "week": 6,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-22",
    "week": 6,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2026-12-22",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2026-12-23",
    "week": 6,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-23",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2026-12-23",
    "week": 6,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 37,38",
    "kind": "practice"
  },
  {
    "date": "2026-12-24",
    "week": 6,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B",
    "kind": "theory"
  },
  {
    "date": "2026-12-24",
    "week": 6,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-24",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2026-12-24",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2026-12-25",
    "week": 6,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  },
  {
    "date": "2026-12-25",
    "week": 6,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-25",
    "week": 6,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  },
  {
    "date": "2026-12-25",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2026-12-25",
    "week": 6,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2026-12-28",
    "week": 7,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2026-12-28",
    "week": 7,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2026-12-28",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2026-12-28",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2026-12-28",
    "week": 7,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-28",
    "week": 7,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-29",
    "week": 7,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2026-12-29",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2026-12-29",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2026-12-29",
    "week": 7,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-30",
    "week": 7,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2026-12-30",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2026-12-30",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2026-12-30",
    "week": 7,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2026-12-30",
    "week": 7,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2026-12-31",
    "week": 7,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2026-12-31",
    "week": 7,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2026-12-31",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2026-12-31",
    "week": 7,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2026-12-31",
    "week": 7,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Lịch kiểm tra / Đánh giá (nửa cuối chiều)",
    "kind": "exam"
  },
  {
    "date": "2026-12-31",
    "week": 7,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2026-12-31",
    "week": 7,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Lịch kiểm tra / Đánh giá (nửa cuối chiều)",
    "kind": "exam"
  },
  {
    "date": "2027-01-04",
    "week": 8,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2027-01-04",
    "week": 8,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2027-01-04",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-01-04",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-01-05",
    "week": 8,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7D · Bù Tết DL",
    "kind": "makeup"
  },
  {
    "date": "2027-01-05",
    "week": 8,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2027-01-05",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-01-06",
    "week": 8,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2027-01-06",
    "week": 8,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2027-01-06",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-01-06",
    "week": 8,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 37,38",
    "kind": "practice"
  },
  {
    "date": "2027-01-07",
    "week": 8,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ3 · Bù Tết DL",
    "kind": "makeup"
  },
  {
    "date": "2027-01-07",
    "week": 8,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B",
    "kind": "theory"
  },
  {
    "date": "2027-01-07",
    "week": 8,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-01-07",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-01-07",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-01-08",
    "week": 8,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-01-08",
    "week": 8,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2027-01-08",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-01-08",
    "week": 8,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-01-09",
    "week": 8,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 3,4 · Bù Tết Dương lịch",
    "kind": "makeup"
  },
  {
    "date": "2027-01-09",
    "week": 8,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 5,6 · Bù Tết Dương lịch",
    "kind": "makeup"
  },
  {
    "date": "2027-01-09",
    "week": 8,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 13,14 · Bù Tết Dương lịch",
    "kind": "makeup"
  },
  {
    "date": "2027-01-09",
    "week": 8,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 15,16 · Bù Tết Dương lịch",
    "kind": "makeup"
  },
  {
    "date": "2027-01-11",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2027-01-11",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2027-01-11",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2027-01-11",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2027-01-11",
    "week": 9,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7D",
    "kind": "theory"
  },
  {
    "date": "2027-01-12",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2027-01-12",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2027-01-12",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2027-01-12",
    "week": 9,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2027-01-13",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2027-01-13",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2027-01-13",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2027-01-13",
    "week": 9,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7D",
    "kind": "theory"
  },
  {
    "date": "2027-01-14",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2027-01-14",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2027-01-14",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2027-01-14",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2027-01-14",
    "week": 9,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B",
    "kind": "theory"
  },
  {
    "date": "2027-01-14",
    "week": 9,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-01-15",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2027-01-15",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2027-01-15",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2027-01-15",
    "week": 9,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2027-01-15",
    "week": 9,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-01-16",
    "week": 9,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-01-16",
    "week": 9,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-01-16",
    "week": 9,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-01-18",
    "week": 10,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2027-01-18",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-01-18",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-01-19",
    "week": 10,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 7B",
    "kind": "theory"
  },
  {
    "date": "2027-01-19",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-01-20",
    "week": 10,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2027-01-20",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-01-20",
    "week": 10,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 37,38",
    "kind": "practice"
  },
  {
    "date": "2027-01-21",
    "week": 10,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Phòng 6B",
    "kind": "theory"
  },
  {
    "date": "2027-01-21",
    "week": 10,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-01-21",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-01-21",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-01-22",
    "week": 10,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-01-22",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-01-22",
    "week": 10,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-02-15",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2027-02-15",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2027-02-15",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2027-02-15",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2027-02-15",
    "week": 14,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2027-02-16",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2027-02-16",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2027-02-16",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2027-02-17",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2027-02-17",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2027-02-17",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2027-02-17",
    "week": 14,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2027-02-18",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2027-02-18",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2027-02-18",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2027-02-18",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2027-02-18",
    "week": 14,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-02-19",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2027-02-19",
    "week": 14,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2027-02-19",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2027-02-19",
    "week": 14,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2027-02-19",
    "week": 14,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-02-22",
    "week": 15,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2027-02-22",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-02-22",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-02-23",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-02-24",
    "week": 15,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2027-02-24",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-02-24",
    "week": 15,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 37,38",
    "kind": "practice"
  },
  {
    "date": "2027-02-25",
    "week": 15,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-02-25",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-02-25",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-02-26",
    "week": 15,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-02-26",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-02-26",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-02-27",
    "week": 15,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-02-27",
    "week": 15,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-02-27",
    "week": 15,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Hóa phân tích 2 (HPT2)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-01",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2027-03-01",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2027-03-01",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2027-03-01",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2027-03-01",
    "week": 16,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ2",
    "kind": "theory"
  },
  {
    "date": "2027-03-02",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 1,2",
    "kind": "practice"
  },
  {
    "date": "2027-03-02",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2027-03-02",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 11,12",
    "kind": "practice"
  },
  {
    "date": "2027-03-03",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2027-03-03",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2027-03-03",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 9, 10",
    "kind": "practice"
  },
  {
    "date": "2027-03-03",
    "week": 16,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Hóa sinh",
    "detail": "Phòng GĐ1",
    "kind": "theory"
  },
  {
    "date": "2027-03-04",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2027-03-04",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 7,8",
    "kind": "practice"
  },
  {
    "date": "2027-03-04",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2027-03-04",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 17,18",
    "kind": "practice"
  },
  {
    "date": "2027-03-04",
    "week": 16,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-03-05",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 3,4",
    "kind": "practice"
  },
  {
    "date": "2027-03-05",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 5,6",
    "kind": "practice"
  },
  {
    "date": "2027-03-05",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 13,14",
    "kind": "practice"
  },
  {
    "date": "2027-03-05",
    "week": 16,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 15,16",
    "kind": "practice"
  },
  {
    "date": "2027-03-05",
    "week": 16,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-03-06",
    "week": 16,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-06",
    "week": 16,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-06",
    "week": 16,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Tư tưởng Hồ Chí Minh",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-08",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-03-08",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-03-09",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 19,20",
    "kind": "practice"
  },
  {
    "date": "2027-03-10",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-03-10",
    "week": 17,
    "classCode": "D25D",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 37,38",
    "kind": "practice"
  },
  {
    "date": "2027-03-11",
    "week": 17,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-03-11",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-03-11",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 25,26",
    "kind": "practice"
  },
  {
    "date": "2027-03-12",
    "week": 17,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-03-12",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Ký sinh trùng (TT KST)",
    "detail": "Nhóm 21,22",
    "kind": "practice"
  },
  {
    "date": "2027-03-12",
    "week": 17,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Thực tập Hóa phân tích 2 (TT HPT2)",
    "detail": "Nhóm 23,24",
    "kind": "practice"
  },
  {
    "date": "2027-03-13",
    "week": 17,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-13",
    "week": 17,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Ký sinh trùng",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-16",
    "week": 18,
    "classCode": "D25A",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-16",
    "week": 18,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-16",
    "week": 18,
    "classCode": "D25C",
    "session": "Chiều",
    "subject": "Sinh lý bệnh – Miễn dịch (SLBMD)",
    "detail": "Lịch thi / Đánh giá HK2",
    "kind": "exam"
  },
  {
    "date": "2027-03-18",
    "week": 18,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-03-19",
    "week": 18,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-03-25",
    "week": 19,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-03-26",
    "week": 19,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-04-01",
    "week": 20,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-04-02",
    "week": 20,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  },
  {
    "date": "2027-04-02",
    "week": 20,
    "classCode": "D25B",
    "session": "Chiều",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Phòng 7C",
    "kind": "theory"
  },
  {
    "date": "2027-04-02",
    "week": 20,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Hóa sinh",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  },
  {
    "date": "2027-04-07",
    "week": 21,
    "classCode": "D25B",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  },
  {
    "date": "2027-04-07",
    "week": 21,
    "classCode": "D25C",
    "session": "Sáng",
    "subject": "Lịch sử Đảng Cộng sản Việt Nam (LSĐ)",
    "detail": "Lịch thi / Kiểm tra HK2",
    "kind": "exam"
  }
];
