export function perceptionState(count: number): { label: string; detail: string } {
  if (count < 20) {
    return {
      label: "Chưa đủ mẫu",
      detail: "Dưới 20 đánh giá hợp lệ. Nhận thức chưa được dùng như một kết luận.",
    };
  }
  if (count < 50) {
    return {
      label: "Tham khảo",
      detail: "Từ 20 đến 49 đánh giá. Chưa tính Green Perception Gap chính thức.",
    };
  }
  return {
    label: "Mẫu chính thức",
    detail: "Từ 50 đánh giá hợp lệ. Có thể đối chiếu với Green Score khi phạm vi đánh giá và Data Confidence đủ điều kiện.",
  };
}

export function toHundred(values: number[]): number {
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return ((avg - 1) / 4) * 100;
}
