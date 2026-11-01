export interface AssignmentSource {
  type: "booking" | "create";
  bookingData?: any;
}

export interface CreateAssignmentFormValues {
  operator: string;
  personnelOperator: string;
  assignmentType: string;
  baseStation: string;
  courseware: string;
  bookingIds: string[];
}

export interface CreateAssignmentProps {
  onNavigate?: (path: string) => void;
}

export interface FieldDropdownProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  locked?: boolean;
  required?: boolean;
  openDropdown: string | null;
  onToggle: (id: string) => void;
  onSelect: (field: string, value: string) => void;
}

export interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export interface RightPanelProps {
  weapons: { type: string; quantity: number }[];
  isCollective: boolean;
  hasBooking: boolean;
}
