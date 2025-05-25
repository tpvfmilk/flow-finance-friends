
import { HomeIcon, BarChart3, DollarSign, Tag, PiggyBank, Target, Settings, MapPin } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    title: "Expenses",
    to: "/expenses",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    title: "Categories",
    to: "/categories",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    title: "Deposits",
    to: "/deposits",
    icon: <PiggyBank className="h-4 w-4" />,
  },
  {
    title: "Goals",
    to: "/goals",
    icon: <Target className="h-4 w-4" />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Map",
    to: "/map",
    icon: <MapPin className="h-4 w-4" />,
  },
];
