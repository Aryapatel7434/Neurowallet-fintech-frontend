
import { useCallback, useEffect, useState } from "react";

import {
    getAIInsights,
    getFinancialScore,
    getBudgetHealth,
    getGoalRecommendation,
} from "../services/aiService";

const useAI = () => {
    const [insights, setInsights] = useState(null);
    const [financialScore, setFinancialScore] = useState(null);
    const [budgetHealth, setBudgetHealth] = useState(null);
    const [goalRecommendation, setGoalRecommendation] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAIData = useCallback(async () => {
        setLoading(true);
        setError("");

        const requests = [
            {
                name: "AI insights",
                request: getAIInsights,
                setter: setInsights,
            },
            {
                name: "Financial score",
                request: getFinancialScore,
                setter: setFinancialScore,
            },
            {
                name: "Budget health",
                request: getBudgetHealth,
                setter: setBudgetHealth,
            },
            {
                name: "Goal recommendation",
                request: getGoalRecommendation,
                setter: setGoalRecommendation,
            },
        ];

        const results = await Promise.allSettled(
            requests.map(({ request }) => request())
        );

        const failures = [];

        results.forEach((result, index) => {
            const { name, setter } = requests[index];

            if (result.status === "fulfilled") {
                setter(result.value);
            } else {
                failures.push(name);
                console.error(
                    `Failed to load ${name}:`,
                    result.reason
                );
            }
        });

        if (failures.length > 0) {
            setError(
                `Some AI data could not be loaded: ${failures.join(", ")}.`
            );
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAIData();
    }, [fetchAIData]);

    return {
        insights,
        financialScore,
        budgetHealth,
        goalRecommendation,
        loading,
        error,
        refreshAIData: fetchAIData,
    };
};

export default useAI;
