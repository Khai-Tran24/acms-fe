import { ResourceField } from "./resource-field";

const contractFields: ResourceField[] = [
  {
    key: "contractNumber",
    label: "Số hợp đồng",
    required: true,
    placeholder: "Nhập số hợp đồng",
  },
  {
    key: "contractStatus",
    label: "Trạng thái",
    kind: "select",
    required: true,
    options: [
      { value: "MOI", label: "Mới" },
      { value: "DANG_DAU_GIA", label: "Đang đấu giá" },
      { value: "DAU_GIA_KHONG_THANH", label: "Đấu giá không thành" },
      { value: "DAU_GIA_THANH", label: "Đấu giá thành" },
      { value: "DA_HUY", label: "Đã hủy" },
    ],
  },
  {
    key: "contractType",
    label: "Loại hợp đồng",
    kind: "select",
    required: true,
    options: [
      { value: "HOP_DONG_MOI", label: "Hợp đồng mới" },
      { value: "HOP_DONG_SUA_DOI_BO_SUNG", label: "Hợp đồng sửa đổi bổ sung" },
    ],
  },
  {
    key: "contractOwnerType",
    label: "Danh mục tài sản",
    kind: "select",
    options: [
      { value: "TAI_SAN_THI_HANH_AN", label: "Tài sản thi hành án" },
      { value: "TAI_SAN_CONG", label: "Tài sản công" },
      {
        value: "TAI_SAN_CUA_TO_CHUC_TIN_DUNG",
        label: "Tài sản của tổ chức tín dụng",
      },
      { value: "TAI_SAN_CUA_CAC_BEN_KHAC", label: "Tài sản của các bên khác" },
    ],
  },
  {
    key: "contractDate",
    label: "Ngày ký hợp đồng",
    kind: "date",
    sendEmptyAsNull: true,
  },
  {
    key: "assignedToId",
    label: "Người phụ trách",
    kind: "number",
    required: true,
    table: false,
  },
  {
    key: "startingPrice",
    label: "Giá khởi điểm",
    kind: "number",
    required: true,
  },
  {
    key: "stepPrice",
    label: "Bước giá",
    kind: "number",
    required: true,
    table: false,
  },
  {
    key: "customer",
    fixedJsonKeys: ["Đơn vị", "Đại diện người có tài sản"],
    label: "Người có tài sản",
    kind: "json",
    jsonShape: "object",
    table: false,
  },
];

const propertyFields: ResourceField[] = [
  { key: "propertyName", label: "Tên tài sản", required: true },
  {
    key: "propertyType",
    label: "Loại tài sản",
    kind: "select",
    required: true,
    options: [
      { value: "DONG_SAN", label: "Động sản" },
      { value: "BAT_DONG_SAN", label: "Bất động sản" },
      { value: "KHOAN_NO", label: "Khoản nợ" },
      { value: "TAI_SAN_KHAC", label: "Tài sản khác" },
    ],
  },
  {
    key: "propertyLocation",
    label: "Địa điểm tài sản",
    required: true,
    placeholder: "Nhập địa chỉ hoặc nơi lưu giữ tài sản",
  },
  {
    key: "propertyNote",
    label: "Ghi chú",
    kind: "textarea",
    placeholder: "Nhập ghi chú về tài sản",
  },
];

const auctionFields = (
  numberKey: string,
  numberLabel: string,
): ResourceField[] => [
    { key: "contractId", label: "ID hợp đồng", kind: "number", required: true },
    {
      key: numberKey,
      label: numberLabel,
      required: true,
      placeholder: `Nhập ${numberLabel.toLowerCase()}`,
    },
    {
      key: "startingPrice",
      label: "Giá khởi điểm",
      kind: "number",
      required: true,
    },
    {
      key: "registrationFee",
      label: "Phí đăng ký",
      kind: "number",
      required: true,
      table: false,
    },
    {
      key: "depositAmount",
      label: "Tiền đặt trước",
      kind: "number",
      required: true,
    },
    { key: "stepPrice", label: "Bước giá", kind: "number", required: true },
    {
      key: "startRegisterDate",
      label: "Bắt đầu đăng ký",
      kind: "datetime",
      required: true,
      table: false,
    },
    {
      key: "endRegisterDate",
      label: "Kết thúc đăng ký",
      kind: "datetime",
      required: true,
      table: false,
    },
    {
      key: "auctionDate",
      label: "Ngày đấu giá",
      kind: "datetime",
      required: true,
    },
    {
      key: "auctionTime",
      label: "Thời lượng đấu giá",
      kind: "number",
      required: true,
      table: false,
    },
    { key: "auctionFormat", label: "Hình thức", table: false },
    { key: "auctionMethod", label: "Phương thức", table: false },
  ];

const resultFields: ResourceField[] = [
  { key: "contractId", label: "Hợp đồng", kind: "number", required: true },
  {
    key: "auctionResultNumber",
    label: "Số thanh lý",
    placeholder: "Nhập số thanh lý",
  },
  {
    key: "winner",
    label: "Người trúng đấu giá",
    kind: "json",
    jsonShape: "object",
    required: true,
  },
  { key: "winningPrice", label: "Giá trúng", kind: "number", required: true },
  {
    key: "completedAt",
    label: "Thời gian hoàn tất",
    kind: "datetime",
    required: true,
  },
  {
    key: "auctionCost",
    label: "Chi phí đấu giá",
    kind: "json",
    jsonShape: "cost-array",
    defaultValue: "[]",
    table: false,
    helpText: "Thêm từng khoản chi và số tiền tương ứng.",
  },
  {
    key: "finalPrice",
    label: "Giá trị sau khi trừ các chi phí",
    kind: "number",
    form: false,
  },
];

const userFields: ResourceField[] = [
  { key: "username", label: "Tên đăng nhập", required: true },
  { key: "fullName", label: "Họ và tên", required: true },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "Số điện thoại" },
  {
    key: "assignedContractCount",
    label: "Hợp đồng được phân công",
    kind: "number",
    form: false,
  },
  {
    key: "role",
    label: "Vai trò",
    kind: "select",
    required: true,
    options: [
      { value: "ADMIN", label: "Quản trị viên" },
      { value: "DAU_GIA_VIEN", label: "Đấu giá viên" },
      { value: "THU_KY", label: "Thư ký" },
      { value: "CHUYEN_VIEN", label: "Chuyên viên" },
      { value: "NHAN_VIEN_LUU_TRU", label: "Nhân viên lưu trữ" },
    ],
  },
  {
    key: "isActive",
    label: "Trạng thái",
    kind: "select",
    required: true,
    options: [
      { value: "true", label: "Hoạt động" },
      { value: "false", label: "Ngừng hoạt động" },
    ],
  },
  // {
  //   key: "password",
  //   label: "Mật khẩu (ít nhất 8 ký tự)",
  //   required: true,
  //   table: false,
  // },
  // { key: "avatar", label: "Ảnh đại diện (URL)", table: false },
];

export const resourceConfigs = {
  contract: { singular: "hợp đồng", fields: contractFields },
  property: { singular: "tài sản", fields: propertyFields },
  regulation: { singular: "quy chế", fields: auctionFields("regulationNumber", "Số quy chế").map((field) => field.key === "contractId" ? { ...field, label: "Hợp đồng" } : field) },
  announcement: { singular: "thông báo", fields: auctionFields("announcementNumber", "Số thông báo") },
  "auction-result": { singular: "kết quả đấu giá", fields: resultFields },
  user: { singular: "người dùng", fields: userFields },
};
