// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Modal,
// } from "react-native";
// import {
//   FileDown,
//   FileUp,
//   FileJson,
//   FileText,
//   ChevronRight,
// } from "lucide-react-native";
// import type { LucideIcon } from "lucide-react-native";
// import * as FileSystem from "expo-file-system/legacy";
// let Sharing: typeof import("expo-sharing") | null = null;
// try {
//   Sharing = require("expo-sharing");
// } catch {
//   Sharing = null;
// }
// // import * as DocumentPicker from "expo-document-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useQueryClient } from "@tanstack/react-query";

// import { useTheme } from "../../hooks/useTheme";
// import { useAuth } from "../../contexts/AuthContext";
// import AppHeader from "../../components/common/AppHeader";
// import { layout } from "../../theme/spacing";
// import { fetchTransactions } from "../../lib/api/transactions";
// import { getAccounts } from "../../lib/api/accounts";
// import { getBudgets } from "../../lib/api/budgets";
// import { getAssets } from "../../lib/api/assets";
// import { getAllCategories } from "../../lib/helpers/categories";
// import {
//   transactionsToCSV,
//   exportToJSON,
//   parseCSVToTransactions,
//   parseJSONBackup,
//   recalculateBalances,
//   SpendyBackup,
// } from "../../lib/helpers/dataTransfer";
// import { Transaction, Account } from "../../types";

// type ActionRow = {
//   icon: LucideIcon;
//   label: string;
//   sublabel: string;
//   onPress: () => void;
//   danger?: boolean;
// };

// function todayString(): string {
//   return new Date().toISOString().slice(0, 10);
// }

// export default function DataManagementScreen() {
//   const { colors, typography } = useTheme();
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();
//   const navigation = useNavigation();
//   const queryClient = useQueryClient();

//   const [loadingMsg, setLoadingMsg] = useState<string | null>(null);

//   const email = user!.email;

//   // ─── Export CSV ─────────────────────────────────────────────────────────────

//   async function handleExportCSV() {
//     setLoadingMsg("Generating CSV…");
//     try {
//       const [transactions, accounts] = await Promise.all([
//         fetchTransactions(email),
//         getAccounts(email),
//       ]);
//       const csv = transactionsToCSV(transactions, accounts);
//       const path = `${FileSystem.cacheDirectory}spendy_export_${todayString()}.csv`;
//       await FileSystem.writeAsStringAsync(path, csv, {
//         encoding: FileSystem.EncodingType.UTF8,
//       });
//       setLoadingMsg(null);
//       const canShare = Sharing ? await Sharing.isAvailableAsync() : false;
//       if (!canShare) {
//         Alert.alert("Saved", `File saved to:\n${path}`);
//         return;
//       }
//       await Sharing!.shareAsync(path, {
//         mimeType: "text/csv",
//         dialogTitle: "Export Transactions",
//         UTI: "public.comma-separated-values-text",
//       });
//     } catch (e: any) {
//       setLoadingMsg(null);
//       Alert.alert("Export Failed", e?.message ?? "Something went wrong.");
//     }
//   }

//   // ─── Export JSON ─────────────────────────────────────────────────────────────

//   async function handleExportJSON() {
//     setLoadingMsg("Generating backup…");
//     try {
//       const [transactions, accounts, budgets, assets, allCats] = await Promise.all([
//         fetchTransactions(email),
//         getAccounts(email),
//         getBudgets(email),
//         getAssets(email),
//         getAllCategories(email),
//       ]);
//       const customCategories = allCats.filter((c) => c.isCustom);
//       const backup: SpendyBackup = {
//         version: "1.0",
//         exportedAt: new Date().toISOString(),
//         userId: email,
//         data: { transactions, accounts, budgets, assets, customCategories },
//       };
//       const json = exportToJSON(backup);
//       const path = `${FileSystem.cacheDirectory}spendy_backup_${todayString()}.json`;
//       await FileSystem.writeAsStringAsync(path, json, {
//         encoding: FileSystem.EncodingType.UTF8,
//       });
//       setLoadingMsg(null);
//       const canShare = Sharing ? await Sharing.isAvailableAsync() : false;
//       if (!canShare) {
//         Alert.alert("Saved", `File saved to:\n${path}`);
//         return;
//       }
//       await Sharing!.shareAsync(path, {
//         mimeType: "application/json",
//         dialogTitle: "Backup Spendy Data",
//         UTI: "public.json",
//       });
//     } catch (e: any) {
//       setLoadingMsg(null);
//       Alert.alert("Export Failed", e?.message ?? "Something went wrong.");
//     }
//   }

//   // ─── Import CSV ──────────────────────────────────────────────────────────────

//   async function handleImportCSV() {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ["text/csv", "text/comma-separated-values", "application/csv", "*/*"],
//         copyToCacheDirectory: true,
//       });
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ["text/csv", "text/comma-separated-values", "application/csv", "*/*"],
//         copyToCacheDirectory: true,
//       });
//       if (result.canceled) return;

//       setLoadingMsg("Reading file…");
//       const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
//         encoding: FileSystem.EncodingType.UTF8,
//       });

//       const existingAccounts = await getAccounts(email);
//       const { transactions, newAccounts, failedRows } = parseCSVToTransactions(
//         content,
//         existingAccounts,
//       );
//       setLoadingMsg(null);

//       if (transactions.length === 0) {
//         Alert.alert(
//           "Nothing to Import",
//           "No valid transactions found in this file." +
//             (failedRows > 0 ? `\n\n${failedRows} rows could not be parsed.` : ""),
//         );
//         return;
//       }

//       const lines: string[] = [
//         `Found ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}.`,
//       ];
//       if (newAccounts.length > 0) {
//         lines.push(
//           `\n${newAccounts.length} new account${newAccounts.length !== 1 ? "s" : ""} will be created:\n${newAccounts.map((a) => a.name).join(", ")}`,
//         );
//       }
//       if (failedRows > 0) {
//         lines.push(`\n${failedRows} row${failedRows !== 1 ? "s" : ""} skipped (invalid data).`);
//       }
//       lines.push("\nThis will be added to your existing data.");

//       Alert.alert("Import Preview", lines.join(""), [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Import",
//           onPress: () => doImportCSV(transactions, newAccounts, existingAccounts),
//         },
//       ]);
//     } catch (e: any) {
//       setLoadingMsg(null);
//       Alert.alert("Import Failed", e?.message ?? "Something went wrong.");
//     }
//   }

//   async function doImportCSV(
//     newTxs: Transaction[],
//     newAccounts: Account[],
//     existingAccounts: Account[],
//   ) {
//     setLoadingMsg(`Importing ${newTxs.length} transactions…`);
//     try {
//       const existingTxsRaw = await AsyncStorage.getItem(`@spendy_transactions_${email}`);
//       const existingTxs: Transaction[] = existingTxsRaw ? JSON.parse(existingTxsRaw) : [];

//       const allAccounts = [...existingAccounts, ...newAccounts];
//       const allTxs = [...existingTxs, ...newTxs].sort((a, b) =>
//         a.date.localeCompare(b.date),
//       );
//       const accountsWithBalances = recalculateBalances(allTxs, allAccounts);

//       await AsyncStorage.multiSet([
//         [`@spendy_transactions_${email}`, JSON.stringify(allTxs)],
//         [`@spendy_accounts_${email}`, JSON.stringify(accountsWithBalances)],
//       ]);

//       queryClient.invalidateQueries();
//       setLoadingMsg(null);
//       Alert.alert(
//         "Import Complete",
//         `${newTxs.length} transaction${newTxs.length !== 1 ? "s" : ""} imported successfully.`,
//       );
//     } catch (e: any) {
//       setLoadingMsg(null);
//       Alert.alert("Import Failed", e?.message ?? "Something went wrong.");
//     }
//   }

//   // ─── Import JSON ─────────────────────────────────────────────────────────────

//   async function handleImportJSON() {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ["application/json", "text/json", "*/*"],
//         copyToCacheDirectory: true,
//       });
//       if (result.canceled) return;

//       setLoadingMsg("Reading file…");
//       const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
//         encoding: FileSystem.EncodingType.UTF8,
//       });
//       setLoadingMsg(null);

//       const backup = parseJSONBackup(content);
//       if (!backup) {
//         Alert.alert(
//           "Invalid File",
//           "This doesn't look like a Spendy backup file. Make sure you're using a .json file exported from Spendy.",
//         );
//         return;
//       }

//       const { transactions, accounts, budgets, assets, customCategories } = backup.data;
//       const exportedOn = new Date(backup.exportedAt).toLocaleDateString("en-IN", {
//         day: "numeric",
//         month: "long",
//         year: "numeric",
//       });

//       Alert.alert(
//         "Restore Backup?",
//         `Backup from ${exportedOn}\n\n${transactions.length} transactions · ${accounts.length} accounts · ${budgets.length} budgets · ${assets.length} assets\n\nThis will REPLACE all your current data. This cannot be undone.`,
//         [
//           { text: "Cancel", style: "cancel" },
//           {
//             text: "Restore",
//             style: "destructive",
//             onPress: () => doImportJSON(backup),
//           },
//         ],
//       );
//     } catch (e: any) {
//       setLoadingMsg(null);
//       Alert.alert("Import Failed", e?.message ?? "Something went wrong.");
//     }
//   }

//   async function doImportJSON(backup: SpendyBackup) {
//     setLoadingMsg("Restoring backup…");
//     try {
//       const { transactions, accounts, budgets, assets, customCategories } = backup.data;

//       await AsyncStorage.multiSet([
//         [`@spendy_transactions_${email}`, JSON.stringify(transactions)],
//         [`@spendy_accounts_${email}`, JSON.stringify(accounts)],
//         [`@spendy_budgets_${email}`, JSON.stringify(budgets)],
//         [`@spendy_assets_${email}`, JSON.stringify(assets)],
//         [`@spendy_custom_categories_${email}`, JSON.stringify(customCategories)],
//       ]);

//       queryClient.invalidateQueries();
//       setLoadingMsg(null);
//       Alert.alert("Restore Complete", "Your data has been restored from the backup.");
//     } catch (e: any) {
//       setLoadingMsg(null);
//       Alert.alert("Restore Failed", e?.message ?? "Something went wrong.");
//     }
//   }

//   // ─── Rows ─────────────────────────────────────────────────────────────────────

//   const exportRows: ActionRow[] = [
//     {
//       icon: FileText,
//       label: "Export as CSV",
//       sublabel: "Transactions only · opens in Excel or Sheets",
//       onPress: handleExportCSV,
//     },
//     {
//       icon: FileJson,
//       label: "Export as JSON",
//       sublabel: "Full backup · transactions, accounts, budgets, assets",
//       onPress: handleExportJSON,
//     },
//   ];

//   const importRows: ActionRow[] = [
//     {
//       icon: FileUp,
//       label: "Import from CSV",
//       sublabel: "Add transactions from a CSV file",
//       onPress: handleImportCSV,
//     },
//     {
//       icon: FileDown,
//       label: "Import from JSON",
//       sublabel: "Restore a full Spendy backup · replaces all data",
//       onPress: handleImportJSON,
//       danger: true,
//     },
//   ];

//   // ─── Render ──────────────────────────────────────────────────────────────────

//   function renderSection(title: string, rows: ActionRow[]) {
//     return (
//       <View style={styles.section}>
//         <Text
//           style={[
//             styles.sectionLabel,
//             { color: colors.textMuted, fontSize: typography.size.xs },
//           ]}
//         >
//           {title}
//         </Text>
//         <View
//           style={[
//             styles.card,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//         >
//           {rows.map((row, i) => {
//             const RowIcon = row.icon;
//             return (
//               <TouchableOpacity
//                 key={row.label}
//                 onPress={row.onPress}
//                 activeOpacity={0.7}
//                 style={[
//                   styles.row,
//                   { borderBottomColor: colors.divider },
//                   i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth },
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.iconBox,
//                     {
//                       backgroundColor: row.danger ? colors.expenseLight : colors.surfaceAlt,
//                     },
//                   ]}
//                 >
//                   <RowIcon
//                     size={18}
//                     color={row.danger ? colors.expense : colors.primary}
//                     strokeWidth={1.7}
//                   />
//                 </View>
//                 <View style={styles.rowInfo}>
//                   <Text
//                     style={[
//                       styles.rowLabel,
//                       {
//                         color: row.danger ? colors.expense : colors.text,
//                         fontSize: typography.size.base,
//                         fontWeight: typography.weight.medium,
//                       },
//                     ]}
//                   >
//                     {row.label}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.rowSublabel,
//                       { color: colors.textMuted, fontSize: typography.size.xs },
//                     ]}
//                   >
//                     {row.sublabel}
//                   </Text>
//                 </View>
//                 <ChevronRight size={16} color={colors.textMuted} strokeWidth={1.7} />
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       <AppHeader
//         title="Data Management"
//         rightElement={<></>}
//         onMenuPress={() => navigation.goBack()}
//       />

//       <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
//         {renderSection("EXPORT", exportRows)}
//         {renderSection("IMPORT", importRows)}
//       </ScrollView>

//       {/* Loading overlay */}
//       <Modal visible={!!loadingMsg} transparent animationType="fade">
//         <View style={styles.overlay}>
//           <View
//             style={[
//               styles.loadingBox,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//           >
//             <ActivityIndicator size="large" color={colors.primary} />
//             <Text
//               style={[
//                 styles.loadingText,
//                 { color: colors.text, fontSize: typography.size.sm },
//               ]}
//             >
//               {loadingMsg}
//             </Text>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   section: { marginTop: 24, marginHorizontal: 16 },
//   sectionLabel: {
//     fontWeight: "600",
//     letterSpacing: 0.6,
//     marginBottom: 8,
//     marginLeft: 4,
//     textTransform: "uppercase",
//   },
//   card: {
//     borderRadius: layout.cardRadius,
//     borderWidth: StyleSheet.hairlineWidth,
//     overflow: "hidden",
//   },
//   row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
//   iconBox: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   rowInfo: { flex: 1 },
//   rowLabel: {},
//   rowSublabel: { marginTop: 2 },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingBox: {
//     padding: 28,
//     borderRadius: 16,
//     borderWidth: StyleSheet.hairlineWidth,
//     alignItems: "center",
//     gap: 16,
//     minWidth: 220,
//   },
//   loadingText: { textAlign: "center" },
// });
