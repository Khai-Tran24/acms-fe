import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { createResource } from "@/lib/api/resource/resource.api";
import { useToast } from "@/lib/hooks/use-toast";
import { errorMessage, type ContractPropertyValue } from "./form-values";

export function ContractPropertyEditor({
  contractProperties,
  setContractProperties,
  creatingProperty,
  setCreatingProperty,
  saving,
}: {
  contractProperties: ContractPropertyValue[];
  setContractProperties: Dispatch<SetStateAction<ContractPropertyValue[]>>;
  creatingProperty: boolean;
  setCreatingProperty: (value: boolean) => void;
  saving: boolean;
}) {
  const toastRef = useRef(useToast());
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("TAI_SAN_KHAC");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyNote, setPropertyNote] = useState("");
  const createContractProperty = async () => {
    if (!propertyName.trim() || !propertyLocation.trim()) return;
    setCreatingProperty(true);
    try {
      const created = await createResource("property", {
        propertyName: propertyName.trim(),
        propertyType,
        propertyLocation: propertyLocation.trim(),
        propertyNote,
      });
      setContractProperties((current) => [
        ...current,
        {
          id: created.id,
          name: String(created.propertyName),
          type: String(created.propertyType),
          note: propertyNote,
          originalNote: propertyNote,
        },
      ]);
      setPropertyName("");
      setPropertyType("TAI_SAN_KHAC");
      setPropertyLocation("");
      setPropertyNote("");

      toastRef.current.success("Đã tạo và thêm tài sản vào hợp đồng.");
    } catch (error) {
      toastRef.current.error(errorMessage(error) ?? "Không thể tạo tài sản.");
    } finally {
      setCreatingProperty(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-accent/30 p-4">
      <div>
        <h3 className="font-semibold">Tạo tài sản cho hợp đồng</h3>
        <p className="text-sm text-muted-foreground">
          Tài sản được tạo ngay tại đây và tự động gắn vào hợp đồng khi lưu.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inline-property-name">Tên tài sản</Label>
          <Input
            id="inline-property-name"
            value={propertyName}
            onChange={(event) => setPropertyName(event.target.value)}
            placeholder="Nhập tên tài sản"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inline-property-type">Loại tài sản</Label>
          <select
            id="inline-property-type"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            className="border-input bg-card h-10 w-full rounded-md border px-3 text-sm"
          >
            <option value="DONG_SAN">Động sản</option>
            <option value="BAT_DONG_SAN">Bất động sản</option>
            <option value="KHOAN_NO">Khoản nợ</option>
            <option value="TAI_SAN_KHAC">Tài sản khác</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="inline-property-location">Địa điểm tài sản</Label>
          <Input
            id="inline-property-location"
            value={propertyLocation}
            onChange={(event) => setPropertyLocation(event.target.value)}
            placeholder="Nhập địa chỉ hoặc nơi lưu giữ tài sản"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="inline-property-note">Ghi chú tài sản</Label>
          <Textarea
            id="inline-property-note"
            value={propertyNote}
            onChange={(event) => setPropertyNote(event.target.value)}
            placeholder="Nhập ghi chú về tài sản"
          />
        </div>
        <div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={
              !propertyName.trim() ||
              !propertyLocation.trim() ||
              creatingProperty
            }
            onClick={createContractProperty}
          >
            <Plus className="mr-2 size-4" />
            {creatingProperty ? "Đang tạo..." : "Tạo tài sản"}
          </Button>
        </div>
      </div>
      {contractProperties.length > 0 && (
        <div className="space-y-3">
          {contractProperties.map((property) => (
            <div
              key={property.id}
              className="space-y-2 rounded-lg border bg-background p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span>{property.name}</span>
                <button
                  type="button"
                  aria-label={`Bỏ ${property.name}`}
                  onClick={() =>
                    setContractProperties((current) =>
                      current.filter((item) => item.id !== property.id),
                    )
                  }
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <Label htmlFor={`property-note-${property.id}`}>
                Ghi chú tài sản
              </Label>
              <Textarea
                id={`property-note-${property.id}`}
                value={property.note}
                disabled={saving}
                placeholder="Nhập ghi chú về tài sản"
                onChange={(event) =>
                  setContractProperties((current) =>
                    current.map((item) =>
                      item.id === property.id
                        ? { ...item, note: event.target.value }
                        : item,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
