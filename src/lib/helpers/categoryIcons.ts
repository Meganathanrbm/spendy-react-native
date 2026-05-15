/**
 * Spendy 2.0 — Category → Lucide icon component map.
 * Matches the exact icon assignments from the design doc.
 */
import type { LucideIcon } from "lucide-react-native";
import {
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  ReceiptText,
  Pill,
  Film,
  BookOpen,
  Plane,
  House,
  Package,
  Briefcase,
  Banknote,
  Landmark,
  Gift,
  TrendingDown,
  ArrowLeftRight,
  Tag,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Bitcoin,
  Building2,
  Shield,
  // Picker extras
  Coffee,
  Heart,
  Dumbbell,
  Music,
  Camera,
  Star,
  Zap,
  Bell,
  Phone,
  Globe,
  Tv,
  Users,
  GraduationCap,
  Bus,
  Laptop,
  Code,
  Wine,
  DollarSign,
  Activity,
  Scissors,
  Mountain,
  Sun,
  Leaf,
  Gamepad2,
  Pizza,
  Apple,
  Flame,
  Pen,
  MapPin,
  Headphones,
  Watch,
  Shirt,
  Baby,
  Bike,
  Droplets,
} from "lucide-react-native";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Expense
  Food:          Utensils,
  Groceries:     ShoppingCart,
  Transport:     Car,
  Shopping:      ShoppingBag,
  Bills:         ReceiptText,
  Health:        Pill,
  Entertainment: Film,
  Education:     BookOpen,
  Travel:        Plane,
  Rent:          House,
  Other:         Package,
  // Income
  Salary:        Briefcase,
  Freelance:     Banknote,
  Business:      Landmark,
  Gift:          Gift,
  Returns:       TrendingDown,
  // Transfer
  Transfer:      ArrowLeftRight,
};

/** Account type → Lucide icon map */
export const ACCOUNT_TYPE_ICONS: Record<string, LucideIcon> = {
  savings:    Landmark,
  current:    Landmark,
  credit:     CreditCard,
  wallet:     Wallet,
  cash:       Banknote,
  investment: TrendingUp,
};

/** Asset type → Lucide icon map */
export const ASSET_TYPE_ICONS: Record<string, LucideIcon> = {
  stocks:        TrendingUp,
  mutual_fund:   TrendingUp,
  fixed_deposit: Landmark,
  gold:          Tag,
  ppf:           Shield,
  nps:           Building2,
  epf:           Landmark,
  crypto:        Bitcoin,
  real_estate:   House,
  other:         Package,
};

/** All icons available in the custom category icon picker. */
export const PICKER_ICONS: Record<string, LucideIcon> = {
  // Food & Drink
  Utensils, Coffee, Pizza, Wine, Apple, ShoppingCart, ShoppingBag,
  // Transport
  Car, Bus, Plane, Bike,
  // Home & Utilities
  House, Tv, Droplets, Flame,
  // Health & Fitness
  Pill, Heart, Dumbbell, Activity, Scissors,
  // Work & Education
  Briefcase, Laptop, Code, GraduationCap, BookOpen, Pen,
  // Entertainment
  Film, Music, Camera, Gamepad2, Headphones,
  // Finance
  Banknote, CreditCard, Wallet, PiggyBank, ReceiptText, DollarSign, Landmark, Tag, TrendingUp, TrendingDown,
  // People & Social
  Users, Gift, Baby,
  // Travel & Nature
  Globe, MapPin, Mountain, Sun, Leaf,
  // Other
  Star, Zap, Bell, Phone, Watch, Shirt, Package,
};

/** Returns the Lucide icon for a category by category name. */
export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Package;
}

/** Returns the Lucide icon component by Lucide icon name (for custom categories). */
export function getIconByName(name: string): LucideIcon {
  return PICKER_ICONS[name] ?? Package;
}

/** Returns the Lucide icon for an account type. */
export function getAccountTypeIcon(type: string): LucideIcon {
  return ACCOUNT_TYPE_ICONS[type] ?? Wallet;
}
