import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyStateMessage?: string | ReactNode;
  pagination?: PaginationConfig;
}

const Table = <T,>({
  columns,
  data,
  keyExtractor,
  emptyStateMessage = "No records found.",
  pagination,
}: TableProps<T>) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 border-b border-slate-100 whitespace-nowrap ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`px-6 py-4 whitespace-nowrap ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : col.accessor
                        ? (item[col.accessor] as ReactNode)
                        : null}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  {typeof emptyStateMessage === "string" ? (
                    <p className="text-sm">{emptyStateMessage}</p>
                  ) : (
                    emptyStateMessage
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Rows per page:
            </span>
            <select
              value={pagination.limit}
              onChange={(e) => {
                if (pagination.onLimitChange) {
                  pagination.onLimitChange(Number(e.target.value));
                }
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-700 font-medium cursor-pointer"
            >
              {[10, 20, 50, 100].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {Math.min(
                  (pagination.page - 1) * pagination.limit + 1,
                  pagination.total,
                )}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-700">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {pagination.total}
              </span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 text-xs font-medium text-slate-600 px-2">
                Page {pagination.page} of {pagination.totalPages}
              </div>

              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
