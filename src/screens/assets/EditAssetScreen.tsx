import React from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useAssets } from "../../hooks/useAssets";
import AddAssetModal from "../../components/assets/AddAssetModal";

type Route = NativeStackScreenProps<RootStackParamList, "EditAsset">["route"];

export default function EditAssetScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { data: assets = [] } = useAssets();
  const existing = assets.find((a) => a.id === route.params.assetId);

  return (
    <View style={{ flex: 1 }}>
      <AddAssetModal
        visible
        onClose={() => navigation.goBack()}
        existing={existing}
      />
    </View>
  );
}
