import React from "react";
import { Save } from "lucide-react";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Button from "../../common/Button";

interface SingleRotaFormProps {
  formData: {
    user_id: string;
    shop_id: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
    note: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  shops: any[];
  users: any[];
  loading: boolean;
  editItemId?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const SingleRotaForm: React.FC<SingleRotaFormProps> = ({
  formData,
  setFormData,
  shops,
  users,
  loading,
  editItemId,
  onSubmit,
  onCancel,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 space-y-5"
    >
      {!editItemId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Shop *"
            value={formData.shop_id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, shop_id: e.target.value })
            }
          >
            <option value="" disabled>
              Select Shop
            </option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </Select>

          <Select
            label="Employee *"
            value={formData.user_id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, user_id: e.target.value })
            }
          >
            <option value="" disabled>
              Select Employee
            </option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {editItemId && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 mb-6">
          Editing time for an existing shift assignment. To change shop or
          employee, please delete and recreate.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          type="date"
          label="Shift Date *"
          value={formData.shiftDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, shiftDate: e.target.value })
          }
        />
        <Input
          type="time"
          label="Start Time *"
          value={formData.startTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, startTime: e.target.value })
          }
        />
        <Input
          type="time"
          label="End Time *"
          value={formData.endTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, endTime: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-sm font-medium text-primary-700 block mb-1.5">
          Note (Optional)
        </label>
        <textarea
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
          rows={3}
          placeholder="Add any instructions or notes about this shift..."
          value={formData.note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, note: e.target.value })
          }
        />
      </div>

      <div className="pt-4 flex gap-3">
        <Button
          variant="secondary"
          className="w-full"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          className="w-full"
          type="submit"
          disabled={loading}
        >
          <Save size={18} className="mr-2" />
          {editItemId ? "Update Shift" : "Create Shift"}
        </Button>
      </div>
    </form>
  );
};

export default SingleRotaForm;
