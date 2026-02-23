"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Power, PanelRightOpen, PanelRightClose, Settings, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface ControlCardProps {
  children: React.ReactNode;
  enabled?: boolean;
  onEnabledChange?: (options: { enabled: boolean }) => void;
  showPowerButton?: boolean;
  showSettingsButton?: boolean;
  showRightPaneToggleButton?: boolean;
  showRightPane?: boolean;
  onRightPaneChange?: (options: { show: boolean }) => void;
  settingsContent?: React.ReactNode;
  rightPaneContent?: React.ReactNode;
  className?: string;
}

export function ControlCard({
  children,
  enabled = true,
  onEnabledChange,
  showPowerButton = true,
  showSettingsButton = true,
  showRightPaneToggleButton = true,
  showRightPane: controlledShowRightPane,
  onRightPaneChange,
  settingsContent,
  rightPaneContent,
  className,
}: ControlCardProps): JSX.Element {
  const rightPaneFadeMs = 380;
  const [internalShowRightPane, setInternalShowRightPane] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    if (!showSettingsButton) {
      setShowSettings(false);
    }
  }, [showSettingsButton]);

  const showRightPane = controlledShowRightPane ?? internalShowRightPane;
  const hasRightPaneContent = Boolean(rightPaneContent);

  const handleRightPaneToggle = () => {
    const newValue = !showRightPane;

    if (onRightPaneChange) {
      onRightPaneChange({ show: newValue });
    } else {
      setInternalShowRightPane(newValue);
    }
  };

  return (
    <Card className={`relative overflow-hidden py-2 ${className ?? ""}`}>
      <motion.div
        initial={false}
        className="grid gap-0 md:p-0"
        animate={{
          gridTemplateColumns: showRightPane && hasRightPaneContent ? "1fr 1px 1fr" : "1fr 0px 0fr",
        }}
        transition={{ duration: 0.38, ease: "easeInOut" }}
      >
        {/* Main Content Section */}
        <div className="relative flex flex-col items-center justify-center gap-4 p-6 md:p-8">
          {/* Power Button - Top Right */}
          {showPowerButton && onEnabledChange && (
            <div className="absolute top-0 right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onEnabledChange({ enabled: !enabled });
                }}
                className="h-8 w-8 p-0"
              >
                <Power
                  className={`h-4 w-4 ${enabled ? "text-green-600" : "text-muted-foreground"}`}
                />
              </Button>
            </div>
          )}

          {/* Main Content */}
          {children}

          {/* Settings Button - Bottom Left */}
          {showSettingsButton && Boolean(settingsContent) && (
            <div className="absolute bottom-0 left-2 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSettings(!showSettings);
                }}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Right Pane Toggle - Bottom Right */}
          {hasRightPaneContent && showRightPaneToggleButton && (
            <div className="absolute bottom-0 right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRightPaneToggle}
                className="h-8 w-8 p-0"
              >
                {showRightPane ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        {hasRightPaneContent && (
          <motion.div
            initial={false}
            animate={{ opacity: showRightPane ? 1 : 0 }}
            transition={{ duration: rightPaneFadeMs / 1000, ease: "easeInOut" }}
            className="hidden w-px bg-border md:block"
          />
        )}

        {/* Right Pane */}
        {hasRightPaneContent && (
          <motion.div
            initial={false}
            animate={{ opacity: showRightPane ? 1 : 0 }}
            transition={{ duration: rightPaneFadeMs / 1000, ease: "easeInOut" }}
            className={`min-w-0 overflow-hidden ${showRightPane ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <div className="flex flex-col gap-6 p-6 md:p-8">{rightPaneContent}</div>
          </motion.div>
        )}
      </motion.div>

      {/* Settings Overlay */}
      <AnimatePresence initial={false}>
        {showSettings && Boolean(settingsContent) && (
          <motion.div
            key="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 z-10 flex flex-col bg-background/95 p-4 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSettings(false);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="space-y-4">{settingsContent}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
