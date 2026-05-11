import { Search, X } from "lucide-react-native";
import { memo } from "react";
import { Animated, Pressable, View } from "react-native";

type SearchButtonProps = {
  isSearching: boolean;
  color: string;
  onPress: () => void;
};

export const SearchButton = memo(function SearchButton({
  isSearching,
  color,
  onPress,
}: SearchButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={searchBtnStyle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View>
        {isSearching ? (
          <X size={22} color={color} strokeWidth={1.7} />
        ) : (
          <Search size={22} color={color} strokeWidth={1.7} />
        )}
      </View>
    </Pressable>
  );
});

const searchBtnStyle = {
  width: 36,
  height: 36,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
