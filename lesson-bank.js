// Lägg till lektioner här. taskIds är uppgifternas id:n i versionslistorna i tasks.js.
// videoIds är videoId-värdena på genomgångarna i tasks.js.
const lessonBank = [
    {
        code: "3nov",
        title: "Repetition",
        taskLectionIds: [737, 768, 1058, 1062, 1248, 1132, 1157, 760, 785, 798, 949, 945, 968],
    },
    {
        code: "prov-ma2b",
        title: "Inför prov - SA25M",
        taskLectionIds: [736, 737, 741, 745, 749, 753, 758, 760, 761, 762, 766, 764, 768, 770, 774, 777, 787, 795, 796, 800, 804, 805, 807, 810, 1248, 1132, 1133, 1140, 1149, 1152, 1157, 1159, 1161, 1169, 1174, 1177, 1183, 1186, 1188, 1190, 1193, 1195, 1197, 1198, 1203, 1205, 1062, 1067, 1071, 1078, 1085, 1090, 1092, 1093, 1096, 1102, 1104, 1109, 1112, 1115, 1117, 1119, 1120, 1125, 1126],
    },
];

if (typeof module !== 'undefined') {
    module.exports = lessonBank;
}

