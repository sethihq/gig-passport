"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogPanel,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ResponsiveModalContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const ResponsiveModalContext = React.createContext<{
  isMobile: boolean;
}>({ isMobile: false });

function ResponsiveModal({
  children,
  open,
  onOpenChange,
}: ResponsiveModalProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return (
      <ResponsiveModalContext.Provider value={{ isMobile: true }}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={{ isMobile: false }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ResponsiveModalContext.Provider>
  );
}

function ResponsiveModalTrigger({
  children,
  asChild,
}: ResponsiveModalTriggerProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <DrawerTrigger asChild={asChild}>{children}</DrawerTrigger>;
  }

  return (
    <DialogTrigger render={asChild ? (children as React.ReactElement) : undefined}>
      {!asChild && children}
    </DialogTrigger>
  );
}

function ResponsiveModalContent({
  children,
  className,
}: ResponsiveModalContentProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <DrawerContent className={className}>{children}</DrawerContent>;
  }

  return (
    <DialogPopup className={className}>
      {children}
    </DialogPopup>
  );
}

function ResponsiveModalHeader({
  children,
  className,
}: ResponsiveModalHeaderProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <DrawerHeader className={className}>{children}</DrawerHeader>;
  }

  return <DialogHeader className={className}>{children}</DialogHeader>;
}

function ResponsiveModalTitle({
  children,
  className,
}: ResponsiveModalTitleProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <DrawerTitle className={className}>{children}</DrawerTitle>;
  }

  return <DialogTitle className={className}>{children}</DialogTitle>;
}

function ResponsiveModalDescription({
  children,
  className,
}: ResponsiveModalDescriptionProps) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return (
      <DrawerDescription className={className}>{children}</DrawerDescription>
    );
  }

  return <DialogDescription className={className}>{children}</DialogDescription>;
}

function ResponsiveModalBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isMobile } = React.useContext(ResponsiveModalContext);

  if (isMobile) {
    return <div className={`px-4 pb-4 ${className || ""}`}>{children}</div>;
  }

  return <DialogPanel className={className}>{children}</DialogPanel>;
}

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
};
