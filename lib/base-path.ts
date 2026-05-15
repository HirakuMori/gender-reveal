const normalizeBasePath = (value: string | undefined): string => {
  if (!value) return "";
  if (value === "/") return "";
  return value.startsWith("/") ? value.replace(/\/$/, "") : `/${value.replace(/\/$/, "")}`;
};

export const BASE_PATH = normalizeBasePath(process.env.BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH);
