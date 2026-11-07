// Lägg till lektioner här. taskIds är uppgifternas id:n i versionslistorna i tasks.js.
// videoIds är videoId-värdena på genomgångarna i tasks.js.
const lessonBank = [
    {
        code: "prov-ma1a",
        title: "Inför Prövning Ma1a",
        taskLectionIds: [28, 47, 55, 62, 63, 66, 69, 295, 351, 372, 378, 401, 403, 406, 425, 426, 445, 488, 491, 513, 529, 534, 541, 546, 551, 560, 582, 588, 603, 606, 621, 627, 630, 633, 819, 826, 837, 841, 846, 852, 849, 862, 866, 870, 874, 877, 878, 900, 924, 927, 933, 939, 942, 946, 951, 955, 958, 961, 985, 993, 995, 1014, 1020],
    },
    {
        code: "prov-ma2b",
        title: "Inför prov - SA25M",
        taskLectionIds: [736, 737, 741, 745, 749, 753, 758, 760, 761, 762, 766, 764, 768, 770, 774, 777, 787, 795, 796, 800, 804, 805, 807, 810, 1248, 1132, 1133, 1140, 1149, 1152, 1157, 1159, 1161, 1169, 1174, 1177, 1183, 1186, 1188, 1190, 1193, 1195, 1197, 1198, 1203, 1205, 1062, 1067, 1071, 1078, 1085, 1090, 1092, 1093, 1096, 1102, 1104, 1109, 1112, 1115, 1117, 1119, 1120, 1125, 1126],
    },
        {
        code: "prov-sa26",
        title: "Inför prov - SA26BC",
        taskLectionIds: [],
    },
];

if (typeof module !== 'undefined') {
    module.exports = lessonBank;
}

