import AsyncStorage from "@react-native-async-storage/async-storage";

export const verifyToken = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (token === null || token === undefined || token === "") {
    return false;
  }
  return true;

};
