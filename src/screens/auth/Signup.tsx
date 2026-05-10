import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { User, Mail, Lock, Eye, EyeOff, CheckCheck } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useMutation } from "@tanstack/react-query";
import { signup } from "../../lib/api/auth";
import { useAuth } from "../../contexts/AuthContext";
import { User as UserType } from "../../types";

const SignupScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login: authLogin } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: (user: UserType) => signup(user),
    onSuccess: async (_, user) => {
      Alert.alert("Success", "Account created!");
      await authLogin({ name: user.name, email: user.email });
    },
    onError: (error: any) => {
      Alert.alert("Signup Failed", error.message || "Something went wrong.");
    },
  });

  const handleSignup = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    const newUser: UserType = {
      name: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
    };

    mutation.mutate(newUser);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-10 pb-6">
          <Text className="text-2xl font-bold text-center mb-8">
            Create Account
          </Text>

          {/* Full Name */}
          <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-full mb-4">
            <User size={20} color="#374151" strokeWidth={1.7} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-full mb-4">
            <Mail size={20} color="#374151" strokeWidth={1.7} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              autoCapitalize="none"
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-full mb-4">
            <Lock size={20} color="#374151" strokeWidth={1.7} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#374151" strokeWidth={1.7} />
              ) : (
                <Eye size={20} color="#374151" strokeWidth={1.7} />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-full mb-6">
            <CheckCheck size={20} color="#374151" strokeWidth={1.7} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Confirm Password"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            className="bg-blue-700 rounded-full py-4 items-center mb-6"
            disabled={mutation.isPending}
          >
            <Text className="text-white font-semibold text-lg">
              {mutation.isPending ? "Creating..." : "Sign up"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-400">Or sign up with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row justify-around mb-6">
            <TouchableOpacity className="p-4 border rounded-lg">
              <FontAwesome name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity className="p-4 border rounded-lg">
              <AntDesign name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity className="p-4 border rounded-lg">
              <AntDesign name="apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text className="text-blue-600 font-semibold">Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
