// import api from "../api/axiosConfig";

// export const transferMoney = async (
//   receiverEmail,
//   amount
// ) => {

//   const response =
//     await api.post(
//       "/transactions/send",
//       {
//         receiverEmail,
//         amount
//       }
//     );

//   return response.data;
// };
import axiosInstance from "../api/axiosConfig";

export const transferMoney = async (
  receiverEmail,
  amount,
  category
) => {

  const response = await axiosInstance.post(
    "/wallet/transfer", // Change to "/transactions/send" if that's your actual endpoint
    {
      receiverEmail,
      amount,
      category
    }
  );

  return response.data;
};