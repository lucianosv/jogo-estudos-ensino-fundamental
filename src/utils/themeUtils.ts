
interface ThemeColors {
  gradient: string;
  border?: string;
  button?: string;
  buttonHover?: string;
}

interface BackgroundImages {
  left: string;
  right: string;
  bottom: string;
}

interface Game {
  theme: string;
  background: string;
  password: string[];
  story: {
    title: string;
    content: string;
  };
  questions: Array<{
    content: string;
    choices: string[];
    answer: string;
    word: string;
  }>;
}

export const getThemeColors = (selectedGame?: Game | null): ThemeColors => {
  if (selectedGame) {
    if (selectedGame.theme.includes("Tanjiro")) {
      return {
        gradient: "from-blue-500 to-teal-500",
        border: "border-blue-400",
        button: "from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
      };
    } else if (selectedGame.theme.includes("Nezuko")) {
      return {
        gradient: "from-pink-500 to-rose-500",
        border: "border-pink-400",
        button: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
      };
    } else if (selectedGame.theme.includes("Zenitsu")) {
      return {
        gradient: "from-yellow-500 to-amber-500",
        border: "border-yellow-400",
        button: "from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
      };
    } else if (selectedGame.theme.includes("Inosuke")) {
      return {
        gradient: "from-green-500 to-emerald-500",
        border: "border-green-400",
        button: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      };
    }
  }

  return {
    gradient: "from-red-600 to-orange-600",
    border: "border-amber-400",
    button: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
  };
};

export const getBackgroundImages = (selectedGame?: Game | null): BackgroundImages => {
  if (!selectedGame) {
    return {
      left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
      right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
      bottom: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
    };
  }
  
  if (selectedGame.theme.includes("Tanjiro")) {
    return {
      left: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=600&fit=crop&crop=faces",
      right: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&crop=faces",
      bottom: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=300&fit=crop"
    };
  } else if (selectedGame.theme.includes("Nezuko")) {
    return {
      left: "https://images.unsplash.com/photo-1520637736862-4d197d17c55a?w=400&h=600&fit=crop&crop=faces",
      right: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=600&fit=crop",
      bottom: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=300&fit=crop"
    };
  } else if (selectedGame.theme.includes("Zenitsu")) {
    return {
      left: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      right: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop",
      bottom: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=300&fit=crop"
    };
  } else if (selectedGame.theme.includes("Inosuke")) {
    return {
      left: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop",
      right: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      bottom: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=300&fit=crop"
    };
  }
  
  return {
    left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
    right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
    bottom: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
  };
};
