export interface ActivityRow {
  no: number;
  action: string;
  module: string;
  /** "6 Jun 2026" — 14 Regular text/default. */
  date: string;
  /** "11:09 PM" — 12 Regular text/body, second line of the Date cell. */
  time: string;
  /** Sort key for the Date column. */
  ts: number;
  desc: string;
}

export interface UserDetailProps {
  onNavigate?: (path: string) => void;
}

export interface MoreMenuProps {
  onArchive: () => void;
  onResetPassword: () => void;
}
