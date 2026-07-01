# Hướng Dẫn Quy Chuẩn Phát Triển Frontend (Agent Guidelines)

Tài liệu này đóng vai trò là hiến pháp của dự án (Project Constitution), cấu hình các quy định, cấu trúc thư mục, tiêu chuẩn coding và quy trình phát triển mà mọi Agentic AI (như Antigravity) và lập trình viên phải tuân thủ tuyệt đối khi làm việc trong dự án Frontend này.

---

## 1. Công Nghệ Sử Dụng (Technology Stack)

*   **Framework & Language:** React 19+, TypeScript.
*   **Build Tool & Bundler:** Vite (đã được cấu hình tích hợp với Tailwind CSS v4 và path alias `@/*`).
*   **UI & Styling:** Shadcn UI (xây dựng trên Radix UI primitives và Tailwind CSS v4). Các component nền tảng được đặt tại `src/components/ui/` để dễ dàng tùy chỉnh.
*   **Data Fetching & State Management:** Axios (đóng gói qua class `APIManager` để xử lý interceptors, Authorization tokens, X-Request-Id, session expiration) kết hợp với TanStack React Query để quản lý server state & cache.
*   **Form & Validation:** React Hook Form kết hợp với Yup để kiểm tra tính hợp lệ dữ liệu.
*   **Routing:** React Router DOM (với mô hình định tuyến lồng nhau - nested routing).
*   **Tables & Charts:**
    *   `ag-grid-react` cho lưới dữ liệu lớn, phức tạp, chỉnh sửa trực tiếp (inline editing).
    *   `TanStack Table` (hoặc Shadcn UI Table) cho các bảng dữ liệu tiêu chuẩn.
    *   `chart.js` & `react-chartjs-2` cho biểu đồ dashboard.
*   **Internationalization (i18n):** i18next & react-i18next cho đa ngôn ngữ.
*   **Time & Data Utilities:** moment, moment-timezone, numeral, lodash.

---

## 2. Cấu Trúc Thư Mục Dự Án (Directory Structure)

Tất cả mã nguồn phải tuân theo cấu trúc phân lớp trong thư mục `src/`:

```
src/
├── @types/          # Khai báo kiểu dữ liệu TypeScript toàn cục (dạng declare module như @dto, @ui)
├── assets/          # Hình ảnh, icons tĩnh và styles toàn cục (index.css)
├── components/      # Các UI Component dùng chung (components/ui/ chứa Shadcn UI components)
├── constants/       # Quản lý API endpoints, Enums, màu sắc, Query Keys, cấu hình WebTable
├── containers/      # Smart Components chứa logic nghiệp vụ và state của một tính năng cụ thể
├── context/         # React Context chia sẻ state theo phạm vi module hoặc global
├── core/            # Phần lõi hệ thống (Event Emitter, Storage, Notifications)
├── hocs/ & hofs/    # Higher-Order Components & Functions xử lý UI & dữ liệu tái sử dụng
├── hooks/
│   ├── core/        # Hooks lõi dùng chung (useQueryEnhancer, useMutationEnhancer, useAgTable)
│   └── [feature]/   # Hooks nghiệp vụ chứa các lệnh gọi API qua React Query (ví dụ: hooks/auth/)
├── layouts/         # Layout khung (AdminLayout, Sidebar, Navbar)
├── pages/           # Các trang đại diện (nhận diện bởi Router, gọi components từ containers)
├── routes/          # Cấu hình định tuyến (Nested routing tương ứng cấu trúc Pages)
├── services/        # Lớp giao tiếp API, cấu hình APIManager và interceptors
├── translation/     # Quản lý đa ngôn ngữ (Localization)
└── utils/           # Các hàm tiện ích dùng chung (Regex, formatting, Excel export...)
```

---

## 3. Quy Chuẩn Đặt Tên & Viết Code (Coding & Naming Conventions)

*   **Thư mục Page/Component/Container:** Sử dụng `PascalCase` (Ví dụ: `Customer/`, `ProductDetail/`).
*   **File Component/Page (.tsx):** Sử dụng `PascalCase` (Ví dụ: `CustomerTable.tsx`, `Dashboard.tsx`).
*   **Custom Hooks:** Phải bắt đầu bằng tiền tố `use` và đặt tên theo kiểu `camelCase` (Ví dụ: `useFetchCustomers.ts`).
*   **Helper, Utilities & Configs:** Đặt tên theo kiểu `camelCase` (Ví dụ: `validation.ts`, `colors.ts`).
*   **Đường dẫn tuyệt đối (Absolute Imports):**
    Sử dụng alias `@/*` đã được cấu hình trong `tsconfig.json` và Vite để import tài nguyên:
    *   `import { Button } from '@/components/ui/button'`
    *   `import { CustomerTable } from '@/containers/Customer'`
    *   `import { ENDPOINTS } from '@/constants'`
    *   `import APIManager from '@/services'`
    *   `import { useFetchCustomers } from '@/hooks/customer'`

---

## 4. Quy Trình Phát Triển Tính Năng Mới (Feature Development Workflow)

Khi được yêu cầu xây dựng một tính năng mới (Ví dụ: tính năng `Customer` - Khách hàng), Agent phải tuân thủ nghiêm ngặt quy trình 5 bước sau:

### Bước 1: Khai báo Data Models & DTOs
Thêm định nghĩa kiểu dữ liệu trong thư mục `src/@types/` để tái sử dụng toàn dự án dạng toàn cục (ambient module) không cần import tương đối:
```typescript
// src/@types/customer.d.ts
declare module '@dto' {
  export interface ICustomer {
    id: number;
    name: string;
    email: string;
  }
}
```

### Bước 2: Định nghĩa URL Endpoints & Query Keys
*   Đăng ký API endpoint mới trong `src/constants/` (hoặc file endpoint tương ứng).
*   Thêm Query Key mới để cache dữ liệu trong `src/constants/query.ts`.

### Bước 3: Tạo Custom Hooks gọi API
Tạo thư mục `src/hooks/[feature]/index.ts` để bọc các API request bằng React Query qua `useQueryEnhancer` (truy xuất dữ liệu) hoặc `useMutationEnhancer` (thay đổi dữ liệu):
```typescript
import { useQueryEnhancer } from '../core';
import APIManager from '@/services';
import { ENDPOINTS, QUERY_KEYS } from '@/constants';
import { ICustomer } from '@dto';

export const useFetchCustomers = () => {
  return useQueryEnhancer<ICustomer[]>({
    queryKey: [QUERY_KEYS.customerList],
    queryFn: async () => {
      const res = await APIManager.request({
        url: ENDPOINTS.customer('list'),
      });
      return res.data;
    }
  });
};
```

### Bước 4: Thiết kế Giao diện (Components & Containers)
*   **Component dùng chung:** Tạo ở `src/components/` (hoặc dùng các components Shadcn UI trong `src/components/ui/`).
*   **Component nghiệp vụ (Container):** Tạo ở `src/containers/Customer/` (Ví dụ: `CustomerTable.tsx`, `CustomerForm.tsx`), kết hợp giữa UI components của Shadcn và custom hooks đã khai báo ở Bước 3.

### Bước 5: Tạo Page & Đăng ký Router
*   Tạo Page đại diện tại `src/pages/Customer/index.tsx`. Ghép nối các component nghiệp vụ từ thư mục `containers` thành giao diện màn hình hoàn chỉnh.
*   Đăng ký Router: Import trang này vào cấu hình định tuyến tương ứng dưới `src/routes/` và gắn URL path mong muốn.
