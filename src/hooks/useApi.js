import { useState } from "react";

function useApi() {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);

    const execute = async (apiCall) => {

        try {

            setLoading(true);

            setError(null);

            const response =
                await apiCall();

            return response;

        } catch (err) {

            setError(

                err.response?.data?.message ||

                "Something went wrong."

            );

            throw err;

        } finally {

            setLoading(false);

        }

    };

    return {

        loading,

        error,

        execute

    };

}

export default useApi;