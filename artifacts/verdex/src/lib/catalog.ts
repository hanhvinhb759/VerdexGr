export type PillarId = "P" | "T" | "R" | "TGS";
export type ItemStatus = "implemented" | "not_implemented" | "na" | "insufficient";
export type VerifyLevel = "self" | "evidence" | "cross" | "external";
export type PlanId = "trial" | "basic" | "standard" | "premium";

export type Criterion = {
  id: string;
  pillar: PillarId;
  name: string;
  score: number;
  status: ItemStatus;
  verify: VerifyLevel;
  evidence: boolean;
  days: number;
  clash: boolean;
  action: string;
};

export const PILLARS: { id: PillarId; name: string; vi: string; inOgs: boolean }[] = [
  { id: "P", name: "Green Packaging", vi: "Đóng gói xanh", inOgs: true },
  { id: "T", name: "Green Transportation", vi: "Vận chuyển xanh", inOgs: true },
  { id: "R", name: "Reverse Logistics", vi: "Logistics ngược", inOgs: true },
  { id: "TGS", name: "Transparency", vi: "Minh bạch truyền thông", inOgs: false },
];

export const CRITERIA: Criterion[] = [
  { id: "p1", pillar: "P", name: "Tỷ lệ vật liệu tái chế hoặc tái tạo", score: 90, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Giữ tỷ lệ tái chế và lưu hóa đơn nhà cung cấp theo kỳ." },
  { id: "p2", pillar: "P", name: "Mức giảm nhựa nguyên sinh", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Đặt mốc giảm nhựa nguyên sinh so với kỳ gốc 24 tháng." },
  { id: "p3", pillar: "P", name: "Hệ số khoảng trống bao bì", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Chuẩn hóa kích thước thùng và giảm vật liệu chèn." },
  { id: "p4", pillar: "P", name: "Bao bì tái sử dụng hoặc chuẩn hóa", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Mở vòng tuần hoàn thùng cho nhóm đơn lặp lại." },
  { id: "p5", pillar: "P", name: "Kiểm soát vật liệu hạn chế", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Lưu bảng thành phần và cam kết nhà cung cấp." },
  { id: "t1", pillar: "T", name: "Cơ cấu phương thức vận tải", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Dịch các tuyến phù hợp từ đường bộ sang đường sắt hoặc thủy." },
  { id: "t2", pillar: "T", name: "Tỷ lệ phương tiện phát thải thấp", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Ghi nhận tỷ lệ xe đạt chuẩn khí thải cao hơn hoặc dùng điện." },
  { id: "t3", pillar: "T", name: "Hệ số chất tải và chạy rỗng", score: 50, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Đo tỷ lệ chạy rỗng theo tuyến và ghép đơn chiều về." },
  { id: "t4", pillar: "T", name: "Gom hàng và tối ưu tuyến", score: 70, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Cố định cửa sổ gom đơn nội thành trước khi xuất bến." },
  { id: "t5", pillar: "T", name: "Cường độ nhiên liệu", score: 50, status: "implemented", verify: "evidence", evidence: false, days: 12, clash: false, action: "Nhập km, tấn và loại phương tiện. Chưa công bố phát thải đã kiểm toán." },
  { id: "r1", pillar: "R", name: "Phạm vi chương trình thu hồi", score: 50, status: "implemented", verify: "evidence", evidence: true, days: 12, clash: false, action: "Mở thu hồi cho nhóm đơn thương mại điện tử còn thiếu." },
  { id: "r2", pillar: "R", name: "Tỷ lệ tiếp nhận trên đơn đủ điều kiện", score: 50, status: "implemented", verify: "evidence", evidence: true, days: 12, clash: false, action: "Công bố điểm trả hàng và đo tỷ lệ đơn được nhận lại." },
  { id: "r3", pillar: "R", name: "Cơ cấu tái sử dụng, tái chế, chôn lấp", score: 55, status: "implemented", verify: "evidence", evidence: true, days: 12, clash: false, action: "Tách sản lượng tái sử dụng khỏi phần đem chôn lấp." },
  { id: "r4", pillar: "R", name: "Khả năng tiếp cận điểm trả", score: 50, status: "implemented", verify: "evidence", evidence: true, days: 12, clash: false, action: "Thêm điểm trả trong vùng giao hàng hiện có." },
  { id: "r5", pillar: "R", name: "Hồ sơ đối tác xử lý", score: 50, status: "implemented", verify: "evidence", evidence: false, days: 12, clash: false, action: "Xin tệp đối soát từ đơn vị thu hồi để lên mức cross-checked." },
  { id: "g1", pillar: "TGS", name: "Tuyên bố xanh có minh chứng", score: 100, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Giữ liên kết từ mỗi tuyên bố tới minh chứng đã được phép công khai." },
  { id: "g2", pillar: "TGS", name: "Nhất quán giữa công bố và vận hành", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: true, action: "Rà tuyên bố đang cao hơn dữ liệu vận chuyển và thu hồi." },
  { id: "g3", pillar: "TGS", name: "Khách hàng tiếp cận được bằng chứng", score: 75, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Đưa tóm tắt dễ hiểu lên hồ sơ công khai, không mở toàn văn chứng từ." },
  { id: "g4", pillar: "TGS", name: "Tuổi thông tin công bố", score: 100, status: "implemented", verify: "cross", evidence: true, days: 12, clash: false, action: "Cập nhật ngày công bố mỗi khi hồ sơ vận hành đổi." },
  { id: "g5", pillar: "TGS", name: "Hạn chế tuyên bố không có cơ sở", score: 70, status: "implemented", verify: "evidence", evidence: true, days: 12, clash: false, action: "Gỡ các câu tuyệt đối như xanh hoàn toàn khi coverage hoặc confidence chưa đủ." },
];

export const PLANS: { id: PlanId; name: string; price: string; points: string[] }[] = [
  { id: "trial", name: "Free Trial", price: "0 đồng · 45 ngày", points: ["Tạo hồ sơ và tải minh chứng", "Xem OGS nếu đủ hai trụ", "Checklist chẩn đoán tối đa năm mục"] },
  { id: "basic", name: "Paid Basic", price: "Phí thấp theo tháng", points: ["Theo dõi điểm theo thời gian", "Lưu các kỳ đã chốt", "Cảnh báo dữ liệu quá hạn"] },
  { id: "standard", name: "Paid Standard", price: "Phí phân tích", points: ["Tổng hợp phản hồi khách hàng", "Green Perception Gap", "Checklist có thứ tự ưu tiên"] },
  { id: "premium", name: "Paid Premium", price: "Phí báo cáo", points: ["Báo cáo cho đối tác", "Chuẩn bị biến đầu vào kiểu GLEC", "Không gồm kiểm toán carbon"] },
];

export type Peer = {
  code: string;
  name: string;
  segment: string;
  greenScore: number;
  confidence: number;
  band: string;
  coverage: string;
  comparable: boolean;
  note: string;
};

export const PEERS: Peer[] = [
  {
    code: "SH-1180",
    name: "Sông Hậu Express",
    segment: "3PL đường bộ và last-mile thương mại điện tử",
    greenScore: 71,
    confidence: 64,
    band: "Limited",
    coverage: "Provisional · 2/3",
    comparable: true,
    note: "Cùng nhóm 3PL. Reverse Logistics chưa đủ dữ liệu nên coverage chưa đầy.",
  },
  {
    code: "CX-0901",
    name: "Cảng Xanh Depot",
    segment: "Kho bãi và depot container",
    greenScore: 58,
    confidence: 44,
    band: "Provisional",
    coverage: "Full · kho bãi",
    comparable: false,
    note: "Khác nhóm hoạt động. Không so sánh Green Score với doanh nghiệp vận tải last-mile.",
  },
];

export function seedItems(): Record<string, Omit<Criterion, "id" | "pillar" | "name" | "action">> {
  return Object.fromEntries(
    CRITERIA.map((item) => [
      item.id,
      {
        score: item.score,
        status: item.status,
        verify: item.verify,
        evidence: item.evidence,
        days: item.days,
        clash: item.clash,
      },
    ]),
  );
}
