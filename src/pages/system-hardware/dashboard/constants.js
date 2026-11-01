import { assetStats } from "@/data/systemHardware";
export const STAT_CARDS = [
    { label: "Total", value: assetStats.total, color: "bg-brand-navy text-white" },
    { label: "Available", value: assetStats.available, color: "bg-green-500 text-white" },
    { label: "Issued", value: assetStats.issued, color: "bg-purple-500 text-white" },
    { label: "Pending Return", value: assetStats.pendingReturn, color: "bg-orange-400 text-white" },
    { label: "Not Returned", value: assetStats.notReturned, color: "bg-red-500 text-white" },
    { label: "Missing", value: assetStats.missing, color: "bg-gray-500 text-white" },
    { label: "Maintenance", value: assetStats.maintenance, color: "bg-yellow-500 text-white" },
    { label: "Overdue", value: assetStats.overdue, color: "bg-red-700 text-white" },
];
export const DONUT_R = 60;
export const DONUT_STROKE = 22;
export const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;
