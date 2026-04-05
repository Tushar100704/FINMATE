import React from 'react';
import { ViewStyle } from 'react-native';
import {
  Home,
  CreditCard,
  Wallet,
  User,
  Plus,
  List,
  Smartphone,
  RefreshCw,
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Receipt,
  ShoppingBag,
  Tv,
  Car,
  Heart,
  GraduationCap,
  DollarSign,
  Pin,
  Store,
  Building2,
  Repeat,
  HelpCircle,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  ShieldCheck,
  XCircle,
  Share,
  UserPlus,
  Copy,
  CornerUpLeft,
  Banknote,
  Settings,
  Download,
  Upload,
  UserCircle,
  Moon,
  Bell,
  IndianRupee,
  ChevronRight,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Info,
  Zap,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  LogOut,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Star,
  Sparkles,
  LucideIcon,
} from 'lucide-react-native';

export type IconName =
  | 'home'
  | 'credit-card'
  | 'wallet'
  | 'user'
  | 'plus'
  | 'list'
  | 'smartphone'
  | 'refresh'
  | 'food'
  | 'groceries'
  | 'users'
  | 'receipt'
  | 'shopping-bag'
  | 'entertainment'
  | 'travel'
  | 'health'
  | 'education'
  | 'income'
  | 'others'
  | 'store'
  | 'building'
  | 'repeat'
  | 'help'
  | 'briefcase'
  | 'laptop'
  | 'trending-up'
  | 'gift'
  | 'refund'
  | 'banknote'
  | 'settings'
  | 'download'
  | 'upload'
  | 'user-circle'
  | 'moon'
  | 'bell'
  | 'rupee'
  | 'chevron-right'
  | 'search'
  | 'filter'
  | 'close'
  | 'check'
  | 'alert'
  | 'info'
  | 'zap'
  | 'trending-down'
  | 'calendar'
  | 'clock'
  | 'map-pin'
  | 'mail'
  | 'phone'
  | 'edit'
  | 'trash'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'unlock'
  | 'logout'
  | 'arrow-up'
  | 'arrow-down'
  | 'bar-chart'
  | 'pie-chart'
  | 'line-chart'
  | 'activity'
  | 'target'
  | 'award'
  | 'star'
  | 'sparkles'
  | 'shield-check'
  | 'x-circle'
  | 'share'
  | 'user-plus'
  | 'copy';

const iconMap: Record<IconName, LucideIcon> = {
  'home': Home,
  'credit-card': CreditCard,
  'wallet': Wallet,
  'user': User,
  'plus': Plus,
  'list': List,
  'smartphone': Smartphone,
  'refresh': RefreshCw,
  'food': UtensilsCrossed,
  'groceries': ShoppingCart,
  'users': Users,
  'receipt': Receipt,
  'shopping-bag': ShoppingBag,
  'entertainment': Tv,
  'travel': Car,
  'health': Heart,
  'education': GraduationCap,
  'income': DollarSign,
  'others': Pin,
  'store': Store,
  'building': Building2,
  'repeat': Repeat,
  'help': HelpCircle,
  'briefcase': Briefcase,
  'laptop': Laptop,
  'trending-up': TrendingUp,
  'gift': Gift,
  'refund': CornerUpLeft,
  'banknote': Banknote,
  'settings': Settings,
  'download': Download,
  'upload': Upload,
  'user-circle': UserCircle,
  'moon': Moon,
  'bell': Bell,
  'rupee': IndianRupee,
  'chevron-right': ChevronRight,
  'search': Search,
  'filter': Filter,
  'close': X,
  'check': Check,
  'alert': AlertCircle,
  'info': Info,
  'zap': Zap,
  'trending-down': TrendingDown,
  'calendar': Calendar,
  'clock': Clock,
  'map-pin': MapPin,
  'mail': Mail,
  'phone': Phone,
  'edit': Edit,
  'trash': Trash2,
  'eye': Eye,
  'eye-off': EyeOff,
  'lock': Lock,
  'unlock': Unlock,
  'logout': LogOut,
  'arrow-up': ArrowUpRight,
  'arrow-down': ArrowDownLeft,
  'bar-chart': BarChart3,
  'pie-chart': PieChart,
  'line-chart': LineChart,
  'activity': Activity,
  'target': Target,
  'award': Award,
  'star': Star,
  'sparkles': Sparkles,
  'shield-check': ShieldCheck,
  'x-circle': XCircle,
  'share': Share,
  'user-plus': UserPlus,
  'copy': Copy,
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

export function Icon({ name, size = 24, color = '#000', strokeWidth = 2, style }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
