import {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
  MessageSquareHeart, CalendarCheck, CalendarPlus, MailPlus,
  ThumbsUp, TrendingUp, Contact, Briefcase, HelpCircle, ShoppingCart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const FIELD_ICON_MAP: Record<string, LucideIcon> = {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
};

export const TEMPLATE_ICON_MAP: Record<string, LucideIcon> = {
  MessageSquareHeart, CalendarCheck, CalendarPlus, MailPlus,
  ThumbsUp, TrendingUp, Contact, Briefcase, HelpCircle, ShoppingCart,
};
