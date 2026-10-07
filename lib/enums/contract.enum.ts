export enum ContractStatus {
  MOI = "MOI",
  DANG_DAU_GIA = "DANG_DAU_GIA",
  DAU_GIA_KHONG_THANH = "DAU_GIA_KHONG_THANH",
  DAU_GIA_THANH = "DAU_GIA_THANH",
  DA_HUY = "DA_HUY",
  DA_THANH_LY = "DA_THANH_LY",
}

export enum PropertyType {
  DONG_SAN = "DONG_SAN",
  BAT_DONG_SAN = "BAT_DONG_SAN",
  KHOAN_NO = "KHOAN_NO",
  TAI_SAN_KHAC = "TAI_SAN_KHAC",
}

export enum PaymentStatus {
  CHUA_THU_TIEN = "CHUA_THU_TIEN",
  DA_THU_TIEN = "DA_THU_TIEN",
}

export enum AuctionFormat {
  DAU_GIA_TRUC_TIEP_BANG_LOI_NO = "TRUC_TIEP_BANG_LOI_NO",
  DAU_GIA_BANG_BO_PHIEU_TRUC_TIEP = "BANG_BO_PHIEU_TRUC_TIEP",
  DAU_GIA_BANG_BO_PHIEU_GIAN_TIEP = "BANG_BO_PHIEU_GIAN_TIEP",
  DAU_GIA_TRUC_TUYEN = "TRUC_TUYEN",
}

export enum AuctionMethod {
  TRA_GIA_LEN = "TRA_GIA_LEN",
  DAT_GIA_XUONG = "DAT_GIA_XUONG",
}

export const AUCTION_FORMAT_LABELS: Record<AuctionFormat, string> = {
  [AuctionFormat.DAU_GIA_TRUC_TIEP_BANG_LOI_NO]: "Trực tiếp bằng lời nói",
  [AuctionFormat.DAU_GIA_BANG_BO_PHIEU_TRUC_TIEP]: "Bỏ phiếu trực tiếp",
  [AuctionFormat.DAU_GIA_BANG_BO_PHIEU_GIAN_TIEP]: "Bỏ phiếu gián tiếp",
  [AuctionFormat.DAU_GIA_TRUC_TUYEN]: "Trực tuyến",
};

export const AUCTION_METHOD_LABELS: Record<AuctionMethod, string> = {
  [AuctionMethod.TRA_GIA_LEN]: "Trả giá lên",
  [AuctionMethod.DAT_GIA_XUONG]: "Đặt giá xuống",
};
