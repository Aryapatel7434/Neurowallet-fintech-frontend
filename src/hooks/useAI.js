import { useEffect, useState } from "react";
import {
    getAIInsights,
    getFinancialScore,
    getBudgetHealth,
    getGoalRecommendation
} from "../services/aiService";

const useAI = () => {

    const [insights, setInsights] = useState(null);
    const [financialScore, setFinancialScore] = useState(null);
    const [budgetHealth, setBudgetHealth] = useState(null);
    const [goalRecommendation, setGoalRecommendation] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchAIData = async () => {

            try {

                const [
                    insightsRes,
                    scoreRes,
                    budgetRes,
                    goalRes
                ] = await Promise.all([
                    getAIInsights(),
                    getFinancialScore(),
                    getBudgetHealth(),
                    getGoalRecommendation()
                ]);

              setInsights(insightsRes);
setFinancialScore(scoreRes);
setBudgetHealth(budgetRes);
setGoalRecommendation(goalRes);

            } catch (err) {

                console.error(err);
                setError("Failed to load AI data.");

            } finally {

                setLoading(false);

            }

        };

        fetchAIData();

    }, []);

    return {
        insights,
        financialScore,
        budgetHealth,
        goalRecommendation,
        loading,
        error
    };

};

export default useAI;