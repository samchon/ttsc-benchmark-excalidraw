import { Footer } from "@excalidraw/excalidraw/index";
import {
  getCommonBounds,
  getSelectedElements,
  getVisibleSceneBounds,
} from "@excalidraw/element";
import React, { useCallback, useState } from "react";

import type {
  ExcalidrawImperativeAPI,
  ScrollConstraints,
} from "@excalidraw/excalidraw/types";

import { isExcalidrawPlusSignedUser } from "../app_constants";

import { DebugFooter, isVisualDebuggerEnabled } from "./DebugCanvas";
import { EncryptedIcon } from "./EncryptedIcon";

const ScrollConstraintsDebugFooter = ({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}) => {
  const [activeLock, setActiveLock] = useState<ScrollConstraints | null>(null);
  const [tolerance, setTolerance] = useState(0);

  const setLock = useCallback(
    (nextLock: ScrollConstraints) => {
      excalidrawAPI?.setScrollConstraints(nextLock);
      setActiveLock(nextLock);
    },
    [excalidrawAPI],
  );

  const toggleScrollLock = useCallback(() => {
    if (!excalidrawAPI) {
      return;
    }

    if (activeLock) {
      excalidrawAPI.setScrollConstraints(null);
      setActiveLock(null);
      return;
    }

    const selectedElements = getSelectedElements(
      excalidrawAPI.getSceneElements(),
      excalidrawAPI.getAppState(),
      {
        includeBoundTextElement: true,
        includeElementsInFrames: true,
      },
    );
    const [x1, y1, x2, y2] = selectedElements.length
      ? getCommonBounds(
          selectedElements,
          excalidrawAPI.getSceneElementsMapIncludingDeleted(),
        )
      : getVisibleSceneBounds(excalidrawAPI.getAppState());

    setLock({
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
      tolerance,
    });
  }, [activeLock, excalidrawAPI, setLock, tolerance]);

  const updateTolerance = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextTolerance = Number(event.target.value) || 0;
      setTolerance(nextTolerance);

      if (activeLock) {
        setLock({ ...activeLock, tolerance: nextTolerance });
      }
    },
    [activeLock, setLock],
  );

  return (
    <div
      style={{
        display: "flex",
        gap: ".35rem",
        alignItems: "center",
        padding: "0 .35rem",
        fontSize: 12,
      }}
    >
      <button
        className="ToolIcon_type_button"
        type="button"
        onClick={toggleScrollLock}
      >
        {activeLock ? "disable scroll lock" : "lock scroll"}
      </button>
      <label
        style={{
          display: "flex",
          gap: ".25rem",
          alignItems: "center",
        }}
      >
        tolerance
        <input
          type="number"
          min={0}
          step={1}
          value={tolerance}
          onChange={updateTolerance}
          style={{ width: 56 }}
        />
      </label>
    </div>
  );
};

export const AppFooter = React.memo(
  ({
    excalidrawAPI,
    onChange,
  }: {
    excalidrawAPI: ExcalidrawImperativeAPI | null;
    onChange: () => void;
  }) => {
    return (
      <Footer>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
          }}
        >
          <ScrollConstraintsDebugFooter excalidrawAPI={excalidrawAPI} />
          {isVisualDebuggerEnabled() && <DebugFooter onChange={onChange} />}
          {!isExcalidrawPlusSignedUser && <EncryptedIcon />}
        </div>
      </Footer>
    );
  },
);
