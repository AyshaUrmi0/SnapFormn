import {
  // Questions / existing
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
  // New question blocks
  Clock, Grid3x3, PenLine, ListOrdered,
  // Layout
  CheckCircle2, Heading1, Heading2, Heading3, Heading, Tag,
  // Embed
  Image, Video, Music, Code,
  // Advanced
  GitBranch, Calculator, EyeOff, Shield, Globe,
  // Template icons
  MessageSquareHeart, CalendarCheck, CalendarPlus, MailPlus,
  ThumbsUp, TrendingUp, Contact, Briefcase, HelpCircle, ShoppingCart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const FIELD_ICON_MAP: Record<string, LucideIcon> = {
  // Existing
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
  // New question blocks
  Clock, Grid3x3, PenLine, ListOrdered,
  // Layout
  CheckCircle2, Heading1, Heading2, Heading3, Heading, Tag,
  // Embed
  Image, Video, Music, Code,
  // Advanced
  GitBranch, Calculator, EyeOff, Shield, Globe,
};

export const TEMPLATE_ICON_MAP: Record<string, LucideIcon> = {
  MessageSquareHeart, CalendarCheck, CalendarPlus, MailPlus,
  ThumbsUp, TrendingUp, Contact, Briefcase, HelpCircle, ShoppingCart,
};
