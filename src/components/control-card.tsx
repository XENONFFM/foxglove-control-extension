"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Power, PanelRightOpen, PanelRightClose, Settings, X } from "lucide-react";
import * as React from "react";

import type { SettingsMenuSection } from "@/components/settings-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsMenuLayout } from "@/components/settings-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ControlCardProps {
  children: React.ReactNode;
  title?: string;
  compact?: boolean;
  enabled?: boolean;
  onEnabledChange?: (options: { enabled: boolean }) => void;
  showPowerButton?: boolean;
  showSettingsButton?: boolean;
  showRightPaneToggleButton?: boolean;
  showRightPane?: boolean;
  onRightPaneChange?: (options: { show: boolean }) => void;
  settingsContent?: React.ReactNode;
  settingsSections?: Array<SettingsMenuSection & { content: React.ReactNode }>;
  rightPaneContent?: React.ReactNode;
  leftPaneReservedWidth?: number;
  rightPaneMinWidth?: number;
  className?: string;
}

export function ControlCard({
  children,
  title,
  compact = false,
  enabled = true,
  onEnabledChange,
  showPowerButton = true,
  showSettingsButton = true,
  showRightPaneToggleButton = true,
  showRightPane: controlledShowRightPane,
  onRightPaneChange,
  settingsContent,
  settingsSections,
  rightPaneContent,
  leftPaneReservedWidth = 420,
  rightPaneMinWidth = 320,
  className,
}: ControlCardProps): React.ReactElement {
  const DIVIDER_WIDTH = 1;
  const rightPaneFadeMs = 380;
  const expandSettleMs = 240;
  const [internalShowRightPane, setInternalShowRightPane] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedSettingsSectionKey, setSelectedSettingsSectionKey] = React.useState<
    string | undefined
  >(undefined);
  const [hasEnoughRightSpace, setHasEnoughRightSpace] = React.useState(true);
  const [showExpandedContent, setShowExpandedContent] = React.useState(!compact);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const previousCompactRef = React.useRef(compact);

  const showRightPane = controlledShowRightPane ?? internalShowRightPane;
  const hasRightPaneContent = Boolean(rightPaneContent);

  React.useEffect(() => {
    if (typeof window === "undefined" || !cardRef.current) {
      return;
    }

    const applyAvailableSpaceFlag = () => {
      const containerWidth = cardRef.current?.getBoundingClientRect().width ?? window.innerWidth;
      const availableRightWidth = containerWidth - leftPaneReservedWidth - DIVIDER_WIDTH;

      setHasEnoughRightSpace(availableRightWidth >= rightPaneMinWidth);
    };

    applyAvailableSpaceFlag();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            applyAvailableSpaceFlag();
          })
        : undefined;
    observer?.observe(cardRef.current);

    window.addEventListener("resize", applyAvailableSpaceFlag);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", applyAvailableSpaceFlag);
    };
  }, [leftPaneReservedWidth, rightPaneMinWidth]);

  React.useEffect(() => {
    if (!showSettingsButton) {
      setShowSettings(false);
    }
  }, [showSettingsButton]);

  React.useEffect(() => {
    if (!settingsSections || settingsSections.length === 0) {
      setSelectedSettingsSectionKey(undefined);
      return;
    }

    const hasSelected = settingsSections.some((section) => section.key === selectedSettingsSectionKey);
    if (!hasSelected) {
      setSelectedSettingsSectionKey(settingsSections[0]?.key);
    }
  }, [selectedSettingsSectionKey, settingsSections]);

  React.useLayoutEffect(() => {
    let revealTimer: number | undefined;

    const wasCompact = previousCompactRef.current;
    previousCompactRef.current = compact;

    if (compact) {
      setShowExpandedContent(false);
    } else if (wasCompact) {
      setShowExpandedContent(false);
      revealTimer = window.setTimeout(() => {
        setShowExpandedContent(true);
      }, expandSettleMs);
    } else {
      setShowExpandedContent(true);
    }

    return () => {
      if (revealTimer != null) {
        window.clearTimeout(revealTimer);
      }
    };
  }, [compact]);

  const shouldShowRightPane = showRightPane && hasRightPaneContent && hasEnoughRightSpace;
  const selectedSettingsSection = settingsSections?.find(
    (section) => section.key === selectedSettingsSectionKey,
  );
  const resolvedSettingsContent =
    settingsSections && settingsSections.length > 0
      ? selectedSettingsSection?.content ?? settingsSections[0]?.content
      : settingsContent;
  const hasSettingsSections = Boolean(settingsSections && settingsSections.length > 0);

  const handleRightPaneToggle = () => {
    const newValue = !showRightPane;

    if (onRightPaneChange) {
      onRightPaneChange({ show: newValue });
    } else {
      setInternalShowRightPane(newValue);
    }
  };

  return (
    <div ref={cardRef} className="w-full">
      <motion.div layout="position" transition={{ duration: 0.28, ease: "easeInOut" }}>
        <Card className={`relative overflow-hidden ${compact ? "py-1" : "py-2"} ${className ?? ""}`}>
          {compact ? (
            <motion.div initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm font-medium text-muted-foreground">{title ?? "Control"}</span>
                {showPowerButton && onEnabledChange && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
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
                      }
                    />
                    <TooltipContent>
                      <p>{enabled ? "Disable" : "Enable"}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={false}
              animate={{ opacity: showExpandedContent ? 1 : 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              style={{
                pointerEvents: showExpandedContent ? "auto" : "none",
                visibility: showExpandedContent ? "visible" : "hidden",
              }}
            >
                <motion.div
                  initial={false}
                  className="grid gap-0 md:p-0"
                  animate={{
                    gridTemplateColumns: shouldShowRightPane ? "1fr 1px 1fr" : "1fr 0px 0fr",
                  }}
                  transition={{ duration: 0.38, ease: "easeInOut" }}
                >
                {/* Main Content Section */}
                <div className="relative flex flex-col items-center justify-center gap-4 p-8">
                  {/* Power Button - Top Right */}
                  {showPowerButton && onEnabledChange && (
                    <div className="absolute top-0 right-2">
                      <Tooltip>
                        <TooltipTrigger
                          render={
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
                          }
                        />
                        <TooltipContent>
                          <p>{enabled ? "Disable" : "Enable"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {/* Main Content */}
                  {children}

                  {/* Settings Button - Bottom Left */}
                  {showSettingsButton && Boolean(resolvedSettingsContent) && (
                    <div className="absolute bottom-0 left-2 flex flex-col gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
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
                          }
                        />
                        <TooltipContent>
                          <p>{showSettings ? "Hide Settings" : "Show Settings"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {/* Right Pane Toggle - Bottom Right */}
                  {hasRightPaneContent && showRightPaneToggleButton && hasEnoughRightSpace && (
                    <div className="absolute bottom-0 right-2">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRightPaneToggle}
                              className="h-8 w-8 p-0"
                            >
                              {shouldShowRightPane ? (
                                <PanelRightClose className="h-4 w-4" />
                              ) : (
                                <PanelRightOpen className="h-4 w-4" />
                              )}
                            </Button>
                          }
                        />
                        <TooltipContent>
                          <p>{shouldShowRightPane ? "Hide Side Panel" : "Show Side Panel"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                {shouldShowRightPane && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: rightPaneFadeMs / 1000, ease: "easeInOut" }}
                    className="w-px bg-border"
                  />
                )}

                {/* Right Pane */}
                {shouldShowRightPane && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: rightPaneFadeMs / 1000, ease: "easeInOut" }}
                    className="min-w-0 overflow-hidden pointer-events-auto"
                  >
                    <div className="flex flex-col gap-6 p-6 md:p-8">{rightPaneContent}</div>
                  </motion.div>
                )}
                </motion.div>

            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {showSettings && Boolean(resolvedSettingsContent) && (
              <motion.div
                key="settings-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="absolute inset-0 z-10 flex flex-col bg-background/95 p-4"
              >
                <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl">
                  <SettingsMenuLayout
                    title={title ? `${title} Settings` : "Settings"}
                    className="rounded-none border-0 bg-transparent p-0"
                    sections={
                      hasSettingsSections
                        ? settingsSections?.map((section) => ({ key: section.key, label: section.label }))
                        : undefined
                    }
                    selectedSectionKey={selectedSettingsSectionKey}
                    onSectionSelect={
                      hasSettingsSections
                        ? (key) => {
                            setSelectedSettingsSectionKey(key);
                          }
                        : undefined
                    }
                    action={
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowSettings(false);
                              }}
                              className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <TooltipContent>
                          <p>Close Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    }
                  >
                    {resolvedSettingsContent}
                  </SettingsMenuLayout>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
