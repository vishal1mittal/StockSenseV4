function getMockFinancialDocuments(symbol) {
    return {
        financialDocuments: {
            keyMetrics: [
                { label: "Revenue (TTM)", value: "$394.3B", change: "+2.8%" },
                {
                    label: "Net Income (TTM)",
                    value: "$97.0B",
                    change: "-2.8%",
                },
                { label: "EPS (TTM)", value: "$6.13", change: "-2.4%" },
                { label: "ROE", value: "174.6%", change: "+8.2%" },
            ],
            documents: [
                {
                    id: 1,
                    title: "Q4 2023 Earnings Report",
                    type: "10-K",
                    date: "2024-01-15",
                    size: "2.4 MB",
                    category: "Earnings",
                },
                {
                    id: 2,
                    title: "Annual Report 2023",
                    type: "10-K",
                    date: "2024-01-10",
                    size: "8.7 MB",
                    category: "Annual",
                },
                {
                    id: 3,
                    title: "Q3 2023 Financial Statements",
                    type: "10-Q",
                    date: "2023-10-30",
                    size: "1.8 MB",
                    category: "Quarterly",
                },
                {
                    id: 4,
                    title: "Proxy Statement 2023",
                    type: "DEF 14A",
                    date: "2023-04-15",
                    size: "3.2 MB",
                    category: "Proxy",
                },
            ],
        },
    };
}

module.exports = { getMockFinancialDocuments };
