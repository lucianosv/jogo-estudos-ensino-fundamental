
export const getThemeColors = (selectedGame?: any) => {
  if (!selectedGame) {
    return {
      gradient: "from-purple-500 to-pink-500",
      border: "border-purple-400",
      button: "bg-purple-600 text-white hover:bg-purple-700",
      buttonHover: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
    };
  }

  if (selectedGame.theme.includes("Tanjiro")) {
    return {
      gradient: "from-blue-500 to-teal-500",
      border: "border-blue-400",
      button: "bg-blue-600 text-white hover:bg-blue-700",
      buttonHover: "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
    };
  } else if (selectedGame.theme.includes("Nezuko")) {
    return {
      gradient: "from-pink-500 to-rose-500",
      border: "border-pink-400",
      button: "bg-pink-600 text-white hover:bg-pink-700",
      buttonHover: "hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700"
    };
  } else if (selectedGame.theme.includes("Zenitsu")) {
    return {
      gradient: "from-yellow-500 to-amber-500",
      border: "border-yellow-400",
      button: "bg-yellow-600 text-white hover:bg-yellow-700",
      buttonHover: "hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700"
    };
  } else if (selectedGame.theme.includes("Inosuke")) {
    return {
      gradient: "from-green-500 to-emerald-500",
      border: "border-green-400",
      button: "bg-green-600 text-white hover:bg-green-700",
      buttonHover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700"
    };
  }

  return {
    gradient: "from-purple-500 to-pink-500",
    border: "border-purple-400",
    button: "bg-purple-600 text-white hover:bg-purple-700",
    buttonHover: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
  };
};
