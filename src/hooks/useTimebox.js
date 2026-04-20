import { useState } from 'react';
import { useSupabaseSync } from './useSupabaseSync';

const EMPTY_DAY = {
  priorities: [],
  brainDump: ['', '', '', '', '', ''],
  timeBlocks: {
    morning: [],
    afternoon1: [],
    afternoon2: [],
  },
};

const getPriorityText = (p) => (typeof p === 'string' ? p : p?.text ?? '');
const getPriorityPlacedIn = (p) => (typeof p === 'string' ? null : p?.placedIn ?? null);
const getItemText = (item) => (typeof item === 'string' ? item : item?.text ?? '');

export function useTimebox({ userCode }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const { isLoading, isSaving, lastSyncError, profile, updateProfile } = useSupabaseSync({
    userCode,
    data,
    setData,
    selectedDate,
    setSelectedDate,
  });

  const getCurrentData = () => data[selectedDate] || EMPTY_DAY;

  const updateData = (field, value) => {
    setData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...getCurrentData(),
        [field]: value,
      },
    }));
  };

  const addBrainDumpItem = () => {
    const currentData = getCurrentData();
    updateData('brainDump', [...currentData.brainDump, '']);
  };

  const updateBrainDumpItem = (index, value) => {
    const currentData = getCurrentData();
    const newBrainDump = [...currentData.brainDump];
    newBrainDump[index] = value;
    updateData('brainDump', newBrainDump);
  };

  const removeBrainDumpItem = (index) => {
    const currentData = getCurrentData();
    const newBrainDump = currentData.brainDump.filter((_, i) => i !== index);
    updateData('brainDump', newBrainDump);
  };

  const moveToPriority = (brainDumpIndex) => {
    const currentData = getCurrentData();
    const item = currentData.brainDump[brainDumpIndex];
    if (item.trim() && currentData.priorities.length < 3) {
      const newPriorities = [...currentData.priorities, item.trim()];
      const newBrainDump = currentData.brainDump.filter((_, i) => i !== brainDumpIndex);
      setData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...currentData,
          priorities: newPriorities,
          brainDump: newBrainDump,
        },
      }));
    }
  };

  const updatePriority = (index, value) => {
    const currentData = getCurrentData();
    const priority = currentData.priorities[index];
    const placedIn = getPriorityPlacedIn(priority);
    const oldText = getPriorityText(priority);

    const newPriorities = [...currentData.priorities];
    newPriorities[index] = placedIn ? { text: value, placedIn } : value;

    let newTimeBlocks = currentData.timeBlocks;
    if (placedIn) {
      newTimeBlocks = {
        ...currentData.timeBlocks,
        [placedIn]: currentData.timeBlocks[placedIn].map((item) => {
          if (getItemText(item) !== oldText) return item;
          return typeof item === 'string'
            ? { text: value, done: false }
            : { ...item, text: value };
        }),
      };
    }

    setData((prev) => ({
      ...prev,
      [selectedDate]: { ...currentData, priorities: newPriorities, timeBlocks: newTimeBlocks },
    }));
  };

  const removePriority = (index) => {
    const currentData = getCurrentData();
    const priority = currentData.priorities[index];
    const placedIn = getPriorityPlacedIn(priority);
    const text = getPriorityText(priority);

    const newPriorities = currentData.priorities.filter((_, i) => i !== index);
    let newTimeBlocks = currentData.timeBlocks;
    if (placedIn) {
      newTimeBlocks = {
        ...currentData.timeBlocks,
        [placedIn]: currentData.timeBlocks[placedIn].filter((item) => getItemText(item) !== text),
      };
    }

    setData((prev) => ({
      ...prev,
      [selectedDate]: { ...currentData, priorities: newPriorities, timeBlocks: newTimeBlocks },
    }));
  };

  const movePriorityToBlock = (priorityIndex, targetBlock) => {
    const currentData = getCurrentData();
    const priority = currentData.priorities[priorityIndex];
    const text = getPriorityText(priority);
    const currentPlacedIn = getPriorityPlacedIn(priority);

    if (!text.trim()) return;

    // Toggle off: same block clicked → un-place
    if (currentPlacedIn === targetBlock) {
      const newPriorities = [...currentData.priorities];
      newPriorities[priorityIndex] = { text, placedIn: null };
      setData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...currentData,
          priorities: newPriorities,
          timeBlocks: {
            ...currentData.timeBlocks,
            [targetBlock]: currentData.timeBlocks[targetBlock].filter(
              (item) => getItemText(item) !== text
            ),
          },
        },
      }));
      return;
    }

    if (currentData.timeBlocks[targetBlock].length >= 3) return;

    const newTimeBlocks = { ...currentData.timeBlocks };
    if (currentPlacedIn) {
      newTimeBlocks[currentPlacedIn] = newTimeBlocks[currentPlacedIn].filter(
        (item) => getItemText(item) !== text
      );
    }
    newTimeBlocks[targetBlock] = [...newTimeBlocks[targetBlock], { text, done: false }];

    const newPriorities = [...currentData.priorities];
    newPriorities[priorityIndex] = { text, placedIn: targetBlock };

    setData((prev) => ({
      ...prev,
      [selectedDate]: { ...currentData, priorities: newPriorities, timeBlocks: newTimeBlocks },
    }));
  };

  const handleBrainDumpKeyDown = (index, e) => {
    const currentData = getCurrentData();

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex < currentData.brainDump.length) {
          const nextInput = document.querySelector(`input[data-braindump-index="${nextIndex}"]`);
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(0, 0);
          }
        } else {
          addBrainDumpItem();
          setTimeout(() => {
            const newInput = document.querySelector(`input[data-braindump-index="${nextIndex}"]`);
            if (newInput) {
              newInput.focus();
              newInput.setSelectionRange(0, 0);
            }
          }, 10);
        }
      }, 10);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < currentData.brainDump.length) {
        const nextInput = document.querySelector(`input[data-braindump-index="${nextIndex}"]`);
        if (nextInput) {
          nextInput.focus();
          setTimeout(() => {
            nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
          }, 0);
        }
      } else if (nextIndex === currentData.brainDump.length) {
        addBrainDumpItem();
        setTimeout(() => {
          const newInput = document.querySelector(`input[data-braindump-index="${nextIndex}"]`);
          if (newInput) newInput.focus();
        }, 10);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        const prevInput = document.querySelector(`input[data-braindump-index="${prevIndex}"]`);
        if (prevInput) {
          prevInput.focus();
          setTimeout(() => {
            prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
          }, 0);
        }
      }
    } else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      const item = currentData.brainDump[index];
      if (item.trim() && currentData.priorities.length < 3) {
        const newPriorities = [...currentData.priorities, item.trim()];
        const newBrainDump = currentData.brainDump.filter((_, i) => i !== index);
        setData((prev) => ({
          ...prev,
          [selectedDate]: {
            ...currentData,
            priorities: newPriorities,
            brainDump: newBrainDump,
          },
        }));
        setTimeout(() => {
          let nextFocusIndex = index;
          if (nextFocusIndex >= newBrainDump.length) {
            nextFocusIndex = Math.max(0, newBrainDump.length - 1);
          }
          const nextInput = document.querySelector(`input[data-braindump-index="${nextFocusIndex}"]`);
          if (nextInput) nextInput.focus();
        }, 10);
      }
    }
  };

  const handlePriorityDragStart = (index) => {
    const currentData = getCurrentData();
    setDraggedIndex(index);
    setDraggedItem({
      type: 'priority',
      index,
      content: getPriorityText(currentData.priorities[index]),
    });
  };

  const handlePriorityDragOver = (e) => {
    e.preventDefault();
  };

  const handlePriorityDrop = (dropIndex) => {
    if (draggedIndex === null || draggedItem?.type !== 'priority') return;
    const currentData = getCurrentData();
    const newPriorities = [...currentData.priorities];
    const draggedContent = newPriorities[draggedIndex];
    newPriorities.splice(draggedIndex, 1);
    newPriorities.splice(dropIndex, 0, draggedContent);
    updateData('priorities', newPriorities);
    setDraggedIndex(null);
    setDraggedItem(null);
  };

  const handleTimeBlockDragStart = (timeBlock, index) => {
    const currentData = getCurrentData();
    setDraggedItem({
      type: 'timeblock',
      timeBlock,
      index,
      content: currentData.timeBlocks[timeBlock][index],
    });
  };

  const toggleTaskDone = (timeBlock, index) => {
    const currentData = getCurrentData();
    const newTimeBlocks = { ...currentData.timeBlocks };
    const item = newTimeBlocks[timeBlock][index];
    if (typeof item === 'string') {
      newTimeBlocks[timeBlock][index] = { text: item, done: true };
    } else {
      newTimeBlocks[timeBlock][index] = { ...item, done: !item.done };
    }
    setData((prev) => ({
      ...prev,
      [selectedDate]: { ...currentData, timeBlocks: newTimeBlocks },
    }));
  };

  const handleTimeBlockDragOver = (e) => {
    e.preventDefault();
  };

  const handleTimeBlockDrop = (targetTimeBlock, dropIndex = null) => {
    if (!draggedItem) return;
    const currentData = getCurrentData();
    const newData = { ...currentData };

    if (draggedItem.type === 'priority') {
      const priority = newData.priorities[draggedItem.index];
      const text = getPriorityText(priority);
      const currentPlacedIn = getPriorityPlacedIn(priority);

      if (currentPlacedIn !== targetTimeBlock && newData.timeBlocks[targetTimeBlock].length < 3) {
        newData.timeBlocks = { ...newData.timeBlocks };
        if (currentPlacedIn) {
          newData.timeBlocks[currentPlacedIn] = newData.timeBlocks[currentPlacedIn].filter(
            (item) => getItemText(item) !== text
          );
        }
        newData.timeBlocks[targetTimeBlock] = [
          ...newData.timeBlocks[targetTimeBlock],
          { text, done: false },
        ];
        newData.priorities = [...newData.priorities];
        newData.priorities[draggedItem.index] = { text, placedIn: targetTimeBlock };
      }
    } else if (draggedItem.type === 'timeblock') {
      if (
        targetTimeBlock !== draggedItem.timeBlock &&
        newData.timeBlocks[targetTimeBlock].length < 3
      ) {
        const content = draggedItem.content;
        newData.timeBlocks[draggedItem.timeBlock] = newData.timeBlocks[
          draggedItem.timeBlock
        ].filter((_, i) => i !== draggedItem.index);
        newData.timeBlocks[targetTimeBlock] = [...newData.timeBlocks[targetTimeBlock], content];
      } else if (targetTimeBlock === draggedItem.timeBlock && dropIndex !== null) {
        const items = [...newData.timeBlocks[targetTimeBlock]];
        const draggedContent = items[draggedItem.index];
        items.splice(draggedItem.index, 1);
        items.splice(dropIndex, 0, draggedContent);
        newData.timeBlocks[targetTimeBlock] = items;
      }
    }

    setData((prev) => ({
      ...prev,
      [selectedDate]: newData,
    }));
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  const removeFromTimeBlock = (timeBlock, index) => {
    const currentData = getCurrentData();
    const removedText = getItemText(currentData.timeBlocks[timeBlock][index]);

    const newTimeBlocks = {
      ...currentData.timeBlocks,
      [timeBlock]: currentData.timeBlocks[timeBlock].filter((_, i) => i !== index),
    };

    const newPriorities = currentData.priorities.map((p) => {
      if (getPriorityPlacedIn(p) === timeBlock && getPriorityText(p) === removedText) {
        return { text: getPriorityText(p), placedIn: null };
      }
      return p;
    });

    setData((prev) => ({
      ...prev,
      [selectedDate]: { ...currentData, timeBlocks: newTimeBlocks, priorities: newPriorities },
    }));
  };

  const navigateDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return {
    data,
    selectedDate,
    setSelectedDate,
    currentData: getCurrentData(),
    draggedItem,
    isLoading,
    isSaving,
    lastSyncError,
    profile,
    updateProfile,
    addBrainDumpItem,
    updateBrainDumpItem,
    removeBrainDumpItem,
    moveToPriority,
    updatePriority,
    removePriority,
    movePriorityToBlock,
    handleBrainDumpKeyDown,
    handlePriorityDragStart,
    handlePriorityDragOver,
    handlePriorityDrop,
    handleTimeBlockDragStart,
    handleTimeBlockDragOver,
    handleTimeBlockDrop,
    handleDragEnd,
    toggleTaskDone,
    removeFromTimeBlock,
    navigateDate,
  };
}
