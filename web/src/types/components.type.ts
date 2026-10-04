// Common component prop types

export interface GoogleSignInButtonProps {
  className?: string;
}

export interface ProfileOption {
  user: {
    name: string;
    email: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  isLoadingUser: boolean;
}

export interface MobileMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}
