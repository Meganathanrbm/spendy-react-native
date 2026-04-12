import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AddAccountModal from "../../components/accounts/AddAccountModal";

export default function AddAccountScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <AddAccountModal visible onClose={() => navigation.goBack()} />
    </View>
  );
}
