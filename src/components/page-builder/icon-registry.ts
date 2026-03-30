import { icons, type LucideIcon } from "lucide-react";

/**
 * Categorized icon registry for the IconPicker.
 * Maps category names to arrays of Lucide icon names.
 * Only includes the most useful ~300 icons to keep the picker manageable.
 */

export type IconCategory =
  | "Popular"
  | "Arrows"
  | "Communication"
  | "Design"
  | "Development"
  | "Devices"
  | "Education"
  | "Files"
  | "Finance"
  | "Food"
  | "Health"
  | "Layout"
  | "Media"
  | "Nature"
  | "Navigation"
  | "People"
  | "Security"
  | "Shapes"
  | "Shopping"
  | "Social"
  | "Sports"
  | "Text"
  | "Time"
  | "Tools"
  | "Transport"
  | "Weather";

export const ICON_CATEGORIES: Record<IconCategory, string[]> = {
  Popular: [
    "Star", "Heart", "Search", "Settings", "Home", "User", "Mail", "Phone",
    "MapPin", "Calendar", "Clock", "Check", "X", "Plus", "Minus", "ChevronRight",
    "ArrowRight", "ExternalLink", "Download", "Upload", "Share2", "Copy",
    "Trash2", "Edit3", "Eye", "EyeOff", "Bell", "Bookmark", "Flag", "Zap",
    "Award", "Gift", "ThumbsUp", "MessageCircle", "Send", "Link",
  ],
  Arrows: [
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUpRight",
    "ArrowDownRight", "ArrowUpLeft", "ArrowDownLeft", "ChevronsUp",
    "ChevronsDown", "ChevronsLeft", "ChevronsRight", "ChevronUp",
    "ChevronDown", "ChevronLeft", "ChevronRight", "MoveUp", "MoveDown",
    "MoveLeft", "MoveRight", "CornerDownRight", "CornerUpLeft",
    "Undo2", "Redo2", "RefreshCw", "RotateCw", "Repeat",
  ],
  Communication: [
    "Mail", "MessageCircle", "MessageSquare", "Phone", "PhoneCall",
    "PhoneOff", "Video", "Voicemail", "AtSign", "Send", "Inbox",
    "MailOpen", "MessagesSquare", "Megaphone", "Radio", "Rss",
    "Bell", "BellRing", "BellOff",
  ],
  Design: [
    "Palette", "Paintbrush", "Pen", "PenTool", "Pencil", "Pipette",
    "Layers", "Layout", "Grid3X3", "AlignCenter", "AlignLeft",
    "AlignRight", "Maximize2", "Minimize2", "Move", "Crop",
    "Scissors", "Ruler", "Figma", "Aperture", "Blend",
    "Sparkles", "Wand2",
  ],
  Development: [
    "Code", "Code2", "Terminal", "Bug", "Database", "Server",
    "Cloud", "Cpu", "HardDrive", "Wifi", "Globe",
    "GitBranch", "GitCommit", "GitMerge", "GitPullRequest",
    "Blocks", "Box", "Boxes", "Binary", "Braces",
    "FileCode", "FolderCode", "Webhook", "Container",
  ],
  Devices: [
    "Monitor", "Smartphone", "Tablet", "Laptop", "Tv",
    "Printer", "Mouse", "Keyboard", "Headphones", "Speaker",
    "Camera", "Mic", "MicOff", "Bluetooth", "Usb",
    "Plug", "Power", "Battery", "BatteryCharging",
  ],
  Education: [
    "BookOpen", "Book", "GraduationCap", "School", "Library",
    "Lightbulb", "Brain", "Microscope", "FlaskConical",
    "TestTube", "Atom", "BookMarked", "NotebookPen",
    "PencilLine", "Presentation", "FileText",
  ],
  Files: [
    "File", "FileText", "FileImage", "FileVideo", "FileAudio",
    "FileCode", "FileSpreadsheet", "FileArchive", "FilePlus",
    "FileMinus", "FileCheck", "FileX", "Folder", "FolderOpen",
    "FolderPlus", "Archive", "Paperclip", "ClipboardList",
    "ClipboardCheck", "ClipboardCopy",
  ],
  Finance: [
    "DollarSign", "CreditCard", "Wallet", "Banknote", "Coins",
    "PiggyBank", "TrendingUp", "TrendingDown", "BarChart",
    "BarChart3", "LineChart", "PieChart", "Receipt", "Calculator",
    "Percent", "CircleDollarSign",
  ],
  Food: [
    "Coffee", "Wine", "Beer", "UtensilsCrossed", "Cookie",
    "Apple", "Cherry", "Grape", "IceCream", "Pizza",
    "Soup", "Beef", "Egg", "CakeSlice", "Salad",
  ],
  Health: [
    "Heart", "HeartPulse", "Activity", "Stethoscope", "Pill",
    "Syringe", "Thermometer", "Cross", "CirclePlus",
    "Dumbbell", "PersonStanding", "Accessibility", "HandHeart",
  ],
  Layout: [
    "Layout", "LayoutDashboard", "LayoutGrid", "LayoutList",
    "LayoutTemplate", "Columns3", "Rows3", "Grid3X3",
    "PanelLeft", "PanelRight", "PanelTop", "PanelBottom",
    "SplitSquareHorizontal", "SplitSquareVertical", "Table2",
    "Kanban", "GalleryHorizontalEnd", "GalleryVerticalEnd",
  ],
  Media: [
    "Image", "Camera", "Video", "Film", "Music", "Mic",
    "PlayCircle", "PauseCircle", "StopCircle", "SkipForward",
    "SkipBack", "Volume2", "VolumeX", "Radio", "Podcast",
    "Monitor", "Tv", "Projector", "ImagePlus",
  ],
  Nature: [
    "Sun", "Moon", "CloudSun", "Snowflake", "Droplets",
    "Flower2", "TreePine", "Trees", "Leaf", "Sprout",
    "Mountain", "Waves", "Wind", "Rainbow", "Sunrise",
    "MountainSnow", "Palmtree",
  ],
  Navigation: [
    "Home", "MapPin", "Map", "Compass", "Navigation",
    "Locate", "Globe", "Search", "Menu", "MoreHorizontal",
    "MoreVertical", "ExternalLink", "Link", "Unlink",
    "LogIn", "LogOut", "DoorOpen", "Signpost",
  ],
  People: [
    "User", "Users", "UserPlus", "UserMinus", "UserCheck",
    "UserX", "UserCog", "Contact", "Baby",
    "PersonStanding", "Handshake", "Hand", "HeartHandshake",
    "UsersRound", "CircleUser",
  ],
  Security: [
    "Lock", "Unlock", "Key", "Shield", "ShieldCheck",
    "ShieldAlert", "ShieldOff", "Fingerprint",
    "ScanFace", "KeyRound", "LockKeyhole",
    "Eye", "EyeOff", "AlertTriangle", "AlertCircle",
  ],
  Shapes: [
    "Circle", "Square", "Triangle", "Pentagon", "Hexagon",
    "Octagon", "Diamond", "RectangleHorizontal", "RectangleVertical",
    "Star", "Heart", "Sparkle", "Sparkles", "Gem",
    "Crown", "Flame", "Infinity",
  ],
  Shopping: [
    "ShoppingCart", "ShoppingBag", "Store", "Tag", "Tags",
    "Ticket", "Package", "PackageOpen", "Gift", "Truck",
    "CreditCard", "Receipt", "Barcode", "QrCode", "Scan",
    "BadgePercent",
  ],
  Social: [
    "Share2", "ThumbsUp", "ThumbsDown", "MessageCircle",
    "MessageSquare", "Heart", "Bookmark", "Flag",
    "Bell", "AtSign", "Hash", "Smile", "Frown",
    "Meh", "PartyPopper", "Laugh",
  ],
  Sports: [
    "Trophy", "Medal", "Target", "Crosshair", "Sword",
    "Gamepad2", "Dumbbell", "Bike", "Footprints",
    "Timer", "Swords", "Volleyball",
  ],
  Text: [
    "Type", "Bold", "Italic", "Underline", "Strikethrough",
    "AlignLeft", "AlignCenter", "AlignRight", "AlignJustify",
    "List", "ListOrdered", "ListChecks", "Quote", "Heading1",
    "Heading2", "Heading3", "CaseSensitive", "Subscript",
    "Superscript", "TextCursorInput",
  ],
  Time: [
    "Clock", "Timer", "TimerOff", "Hourglass", "Calendar",
    "CalendarDays", "CalendarClock", "CalendarCheck",
    "CalendarPlus", "CalendarMinus", "CalendarX",
    "Alarm", "Watch", "History", "TimerReset",
  ],
  Tools: [
    "Settings", "Wrench", "Hammer", "Screwdriver",
    "Filter", "SlidersHorizontal", "Gauge", "Cog",
    "Construction", "Drill", "Axe", "Shovel",
    "Magnet", "Plug", "Lightbulb", "Flashlight",
  ],
  Transport: [
    "Car", "Bus", "Truck", "Bike", "Train",
    "Plane", "Ship", "Rocket", "Fuel",
    "ParkingCircle", "TrainFront", "Sailboat",
  ],
  Weather: [
    "Sun", "Moon", "Cloud", "CloudRain", "CloudSnow",
    "CloudLightning", "CloudSun", "CloudFog", "Wind",
    "Thermometer", "Droplets", "Snowflake", "Rainbow",
    "Umbrella", "Sunrise", "Sunset",
  ],
};

/** All category names in display order */
export const CATEGORY_NAMES = Object.keys(ICON_CATEGORIES) as IconCategory[];

/**
 * Get a Lucide icon component by name.
 * Returns undefined if the icon name doesn't exist.
 */
export function getIcon(name: string): LucideIcon | undefined {
  return (icons as Record<string, LucideIcon>)[name];
}

/**
 * Search all Lucide icons by name substring.
 * Returns matching icon names sorted alphabetically.
 */
export function searchIcons(query: string, limit = 60): string[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const results: string[] = [];
  for (const name of Object.keys(icons)) {
    if (name.toLowerCase().includes(lower)) {
      results.push(name);
      if (results.length >= limit) break;
    }
  }
  return results.sort();
}

/** Total number of available Lucide icons */
export const TOTAL_ICON_COUNT = Object.keys(icons).length;
