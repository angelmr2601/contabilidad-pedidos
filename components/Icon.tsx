type IconName =
  | "add"
  | "archive"
  | "box"
  | "calendar"
  | "check"
  | "close"
  | "copy"
  | "delete"
  | "delivery"
  | "draft"
  | "edit"
  | "filterOff"
  | "history"
  | "import"
  | "moon"
  | "payment"
  | "refresh"
  | "reset"
  | "save"
  | "settings"
  | "summary"
  | "sun"
  | "total";

type Props = {
  name: IconName;
  className?: string;
};

const paths: Record<IconName, string> = {
  add: "M12 5v14m-7-7h14",
  archive: "M4 7h16M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M9 11h6M7 4h10l1 3H6l1-3Z",
  box: "M21 8.5 12 3 3 8.5m18 0-9 5.5m9-5.5v7L12 21m-9-12.5 9 5.5m-9-5.5v7L12 21m0-7v7",
  calendar: "M7 3v4m10-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z",
  check: "m5 13 4 4L19 7",
  close: "m6 6 12 12M18 6 6 18",
  copy: "M8 8h11v11H8zM5 5h11v3M5 5v11h3",
  delete: "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  delivery: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  draft: "M6 3h9l3 3v15H6zM14 3v4h4M9 12h6M9 16h6",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM13 7l4 4",
  filterOff: "M4 5h16l-6 7v5l-4 2v-7L4 5Zm2 16L21 6",
  history: "M4 12a8 8 0 1 0 2.3-5.7L4 8m0-4v4h4m4-1v5l3 2",
  import: "M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3",
  moon: "M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8Z",
  payment: "M3 7h18v10H3zM3 10h18M7 14h4",
  refresh: "M20 11a8 8 0 0 0-14.9-3M4 7v4h4m-4 2a8 8 0 0 0 14.9 3M20 17v-4h-4",
  reset: "M4 4v6h6M4.6 14a8 8 0 1 0 2.2-7.2L4 10",
  save: "M5 4h12l2 2v14H5zM8 4v6h8V4M8 20v-6h8v6",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  summary: "M4 19V5m0 14h16M8 16V9m4 7V7m4 9v-5",
  sun: "M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  total: "M4 6h16M4 18h16M8 10h8M8 14h8",
};

export default function Icon({ name, className = "h-4 w-4" }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d={paths[name]} />
    </svg>
  );
}
