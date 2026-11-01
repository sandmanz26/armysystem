export const PER_PAGE = 10;
export const FILTER_SECTIONS = [
    {
        key: "trainingType",
        label: "Training Type",
        options: ["Group", "Individual"],
    },
    {
        key: "trainingSlot",
        label: "Training Slot",
        twoCol: true,
        options: ["AM Session", "PM Session", "Full Day", "Hourly", "Ad-Hoc"],
    },
    {
        key: "briefingRoom",
        label: "Briefing Room",
        options: ["Briefing Room 1", "Briefing Room 2"],
    },
    {
        key: "courseware",
        label: "Courseware",
        searchable: true,
        options: [
            "Day Test for SAR21/M16 BTP",
            "Night Test for SAR21/M16 BTP",
            "SAR21/M16 ATP(M)",
            "SAR21 Target Exposure Timing ATP(M)",
        ],
    },
];
