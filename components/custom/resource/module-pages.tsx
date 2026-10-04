import { ResourceManager } from "./resource-manager";
import { resourceConfigs } from "./resource-fields";

export const ContractModulePage = () => (
  <ResourceManager
    resource="contract"
    title="Quản lý hợp đồng"
    singular="hợp đồng"
    fields={resourceConfigs.contract.fields}
  />
);
export const PropertyModulePage = () => (
  <ResourceManager
    resource="property"
    title="Quản lý tài sản"
    singular="tài sản"
    fields={resourceConfigs.property.fields}
  />
);
export const RegulationModulePage = () => (
  <ResourceManager
    resource="regulation"
    title="Quản lý quy chế"
    singular="quy chế"
    fields={resourceConfigs.regulation.fields}
  />
);
export const AnnouncementModulePage = () => (
  <ResourceManager
    resource="announcement"
    title="Quản lý thông báo"
    singular="thông báo"
    fields={resourceConfigs.announcement.fields}
  />
);
export const AuctionResultModulePage = () => (
  <ResourceManager
    resource="auction-result"
    title="Quản lý thanh lý hợp đồng"
    singular="kết quả đấu giá"
    fields={resourceConfigs["auction-result"].fields}
  />
);
export const UserModulePage = () => (
  <ResourceManager
    resource="user"
    title="Quản lý người dùng"
    singular="người dùng"
    fields={resourceConfigs.user.fields}
  />
);

export const MemberDirectoryPage = () => (
  <ResourceManager
    resource="user"
    title="Danh bạ thành viên"
    singular="thành viên"
    fields={resourceConfigs.user.fields.filter((field) =>
      [
        "username",
        "fullName",
        "email",
        "phone",
        "role",
        "assignedContractCount",
      ].includes(field.key),
    )}
    readOnly
  />
);
