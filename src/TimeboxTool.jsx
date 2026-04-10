import React, { useState, useEffect } from 'react';
import { ArrowUp, Plus, X, LogOut, Cloud, CloudOff, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupabaseSync } from './hooks/useSupabaseSync';

const TimeboxTool = ({ userCode, onSignOut }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const { isLoading, isSaving, lastSyncError } = useSupabaseSync({
    userCode, data, setData, selectedDate, setSelectedDate
  });

  const getCurrentData = () => {
    return data[selectedDate] || {
      priorities: [],
      brainDump: ['', '', '', '', '', ''],
      timeBlocks: { morning: [], afternoon1: [], afternoon2: [] }
    };
  };

  const updateData = (field, value) => {
    setData(prev => ({
      ...prev,
      [selectedDate]: { ...getCurrentData(), [field]: value }
    }));
  };

  const addBrainDumpItem = () => {
    const currentData = getCurrentData();
    updateData('brainDump', [...currentData.brainDump, '']);
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
          if (nextInput) { nextInput.focus(); nextInput.setSelectionRange(0, 0); }
        } else {
          addBrainDumpItem();
          setTimeout(() => {
            const newInput = document.querySelector(`input[data-braindump-index="${nextIndex}"]`);
            if (newInput) { newInput.focus(); newInput.setSelectionRange(0, 0); }
          }, 10);
        }
      }, 10);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < currentData.brainDump.length) {
        const nextInput = document.querySelector(`input[data-braindump-index="${nextIndex}"]`);
        if (nextInput) { nextInput.focus(); setTimeout(() => nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length), 0); }
      } else if (nextIndex === currentData.brainDump.length) {
        addBrainDumpItem();
        setTimeout(() => { const newInput = document.querySelector(`input[data-braindump-index="${nextIndex}"]`); if (newInput) newInput.focus(); }, 10);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        const prevInput = document.querySelector(`input[data-braindump-index="${prevIndex}"]`);
        if (prevInput) { prevInput.focus(); setTimeout(() => prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length), 0); }
      }
    } else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      const item = currentData.brainDump[index];
      if (item.trim() && currentData.priorities.length < 3) {
        const newPriorities = [...currentData.priorities, item.trim()];
        const newBrainDump = currentData.brainDump.filter((_, i) => i !== index);
        setData(prev => ({ ...prev, [selectedDate]: { ...currentData, priorities: newPriorities, brainDump: newBrainDump } }));
        setTimeout(() => {
          let nextFocusIndex = Math.min(index, newBrainDump.length - 1);
          const nextInput = document.querySelector(`input[data-braindump-index="${Math.max(0, nextFocusIndex)}"]`);
          if (nextInput) nextInput.focus();
        }, 10);
      }
    }
  };

  const updateBrainDumpItem = (index, value) => {
    const currentData = getCurrentData();
    const newBrainDump = [...currentData.brainDump];
    newBrainDump[index] = value;
    updateData('brainDump', newBrainDump);
  };

  const removeBrainDumpItem = (index) => {
    const currentData = getCurrentData();
    updateData('brainDump', currentData.brainDump.filter((_, i) => i !== index));
  };

  const moveToPriority = (brainDumpIndex) => {
    const currentData = getCurrentData();
    const item = currentData.brainDump[brainDumpIndex];
    if (item.trim() && currentData.priorities.length < 3) {
      const newPriorities = [...currentData.priorities, item.trim()];
      const newBrainDump = currentData.brainDump.filter((_, i) => i !== brainDumpIndex);
      setData(prev => ({ ...prev, [selectedDate]: { ...currentData, priorities: newPriorities, brainDump: newBrainDump } }));
    }
  };

  const updatePriority = (index, value) => {
    const currentData = getCurrentData();
    const newPriorities = [...currentData.priorities];
    newPriorities[index] = value;
    updateData('priorities', newPriorities);
  };

  const removePriority = (index) => {
    const currentData = getCurrentData();
    updateData('priorities', currentData.priorities.filter((_, i) => i !== index));
  };

  const handlePriorityDragStart = (index) => {
    const currentData = getCurrentData();
    setDraggedIndex(index);
    setDraggedItem({ type: 'priority', index, content: currentData.priorities[index] });
  };

  const handlePriorityDragOver = (e) => e.preventDefault();

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
    setDraggedItem({ type: 'timeblock', timeBlock, index, content: currentData.timeBlocks[timeBlock][index] });
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
    setData(prev => ({ ...prev, [selectedDate]: { ...currentData, timeBlocks: newTimeBlocks } }));
  };

  const handleTimeBlockDragOver = (e) => e.preventDefault();

  const handleTimeBlockDrop = (targetTimeBlock, dropIndex = null) => {
    if (!draggedItem) return;
    const currentData = getCurrentData();
    let newData = { ...currentData };
    if (draggedItem.type === 'priority') {
      if (newData.timeBlocks[targetTimeBlock].length < 3) {
        newData.timeBlocks[targetTimeBlock] = [...newData.timeBlocks[targetTimeBlock], { text: draggedItem.content, done: false }];
        newData.priorities = newData.priorities.filter((_, i) => i !== draggedItem.index);
      }
    } else if (draggedItem.type === 'timeblock') {
      if (targetTimeBlock !== draggedItem.timeBlock && newData.timeBlocks[targetTimeBlock].length < 3) {
        newData.timeBlocks[draggedItem.timeBlock] = newData.timeBlocks[draggedItem.timeBlock].filter((_, i) => i !== draggedItem.index);
        newData.timeBlocks[targetTimeBlock] = [...newData.timeBlocks[targetTimeBlock], draggedItem.content];
      } else if (targetTimeBlock === draggedItem.timeBlock && dropIndex !== null) {
        const items = [...newData.timeBlocks[targetTimeBlock]];
        const draggedContent = items[draggedItem.index];
        items.splice(draggedItem.index, 1);
        items.splice(dropIndex, 0, draggedContent);
        newData.timeBlocks[targetTimeBlock] = items;
      }
    }
    setData(prev => ({ ...prev, [selectedDate]: newData }));
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => { setDraggedItem(null); setDraggedIndex(null); };

  const removeFromTimeBlock = (timeBlock, index) => {
    const currentData = getCurrentData();
    updateData('timeBlocks', { ...currentData.timeBlocks, [timeBlock]: currentData.timeBlocks[timeBlock].filter((_, i) => i !== index) });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };

  const navigateDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const currentData = getCurrentData();

  const TimeBlockSection = ({ title, timeRange, blockKey }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-gray-300">{timeRange}</span>
        <span className="text-xs text-gray-300 ml-auto">{currentData.timeBlocks[blockKey].length}/3</span>
      </div>
      <div
        className={`min-h-[48px] rounded-md transition-colors duration-150 ${
          draggedItem && (draggedItem.type === 'priority' || (draggedItem.type === 'timeblock' && draggedItem.timeBlock !== blockKey))
          && currentData.timeBlocks[blockKey].length < 3
            ? 'bg-violet-50 ring-1 ring-violet-200'
            : ''
        }`}
        onDragOver={handleTimeBlockDragOver}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleTimeBlockDrop(blockKey); }}
      >
        {currentData.timeBlocks[blockKey].map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleTimeBlockDragStart(blockKey, index)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-md cursor-move transition-all hover:bg-gray-50 ${
              draggedItem?.type === 'timeblock' && draggedItem.timeBlock === blockKey && draggedItem.index === index ? 'opacity-30' : ''
            } ${(item.done || false) ? 'opacity-60' : ''}`}
          >
            <input
              type="checkbox"
              checked={item.done || false}
              onChange={() => toggleTaskDone(blockKey, index)}
            />
            <span className={`flex-1 text-sm ${(item.done || false) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.text || item}
            </span>
            <button
              onClick={() => removeFromTimeBlock(blockKey, index)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {currentData.timeBlocks[blockKey].length === 0 && (
          <div className="text-center text-gray-300 py-4 text-xs">
            드래그하여 배치
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto min-h-screen flex items-center justify-center">
        <Loader className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Timebox</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => navigateDate(-1)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
            />
            <button onClick={() => navigateDate(1)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center" title={lastSyncError || ''}>
            {isSaving ? (
              <Loader className="w-3.5 h-3.5 text-gray-400 animate-spin" />
            ) : lastSyncError ? (
              <CloudOff className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-gray-300" />
            )}
          </div>
          <button onClick={onSignOut} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors" title="나가기">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-6">{formatDate(selectedDate)}</p>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priorities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Priorities</h2>
              <span className="text-xs text-gray-300">{currentData.priorities.length}/3</span>
            </div>
            <div className="space-y-1">
              {currentData.priorities.map((priority, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handlePriorityDragStart(index)}
                  onDragOver={handlePriorityDragOver}
                  onDrop={() => handlePriorityDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-md cursor-move transition-all hover:bg-gray-50 ${
                    draggedItem?.type === 'priority' && draggedItem.index === index ? 'opacity-30' : ''
                  }`}
                >
                  <span className="text-xs text-gray-300 font-mono w-4 flex-shrink-0">{index + 1}</span>
                  <input
                    value={priority}
                    onChange={(e) => updatePriority(index, e.target.value)}
                    className="flex-1 text-sm text-gray-700 bg-transparent border-none focus:outline-none"
                    placeholder="..."
                  />
                  <button
                    onClick={() => removePriority(index)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {currentData.priorities.length === 0 && (
                <p className="text-xs text-gray-300 px-3 py-4 text-center">Brain Dump에서 추가</p>
              )}
            </div>
          </div>

          {/* Brain Dump */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Brain Dump</h2>
              <button onClick={addBrainDumpItem} className="text-gray-300 hover:text-gray-500 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
              {currentData.brainDump.map((item, index) => (
                <div key={index} className="group flex items-center gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateBrainDumpItem(index, e.target.value)}
                    onKeyDown={(e) => handleBrainDumpKeyDown(index, e)}
                    data-braindump-index={index}
                    placeholder="..."
                    className="flex-1 px-3 py-2 text-sm text-gray-700 bg-transparent border-none focus:outline-none placeholder-gray-300"
                  />
                  <button
                    onClick={() => moveToPriority(index)}
                    disabled={!item.trim() || currentData.priorities.length >= 3}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-violet-500 disabled:hover:text-gray-300 disabled:cursor-not-allowed transition-all"
                    title="우선순위로"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeBrainDumpItem(index)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-300 mt-2 px-3">Cmd+P: 우선순위로 이동</p>
          </div>
        </div>

        {/* Right Column - Time Blocks */}
        <div className="lg:col-span-7">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Schedule</h2>
          <TimeBlockSection title="Morning" timeRange="10:00 - 13:00" blockKey="morning" />
          <TimeBlockSection title="Afternoon 1" timeRange="14:00 - 16:30" blockKey="afternoon1" />
          <TimeBlockSection title="Afternoon 2" timeRange="16:30 - 19:00" blockKey="afternoon2" />
        </div>
      </div>

      {/* History */}
      {Object.keys(data).length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">History</h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {Object.keys(data)
              .sort((a, b) => new Date(b) - new Date(a))
              .slice(0, 10)
              .map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                    date === selectedDate
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </button>
              ))}
          </div>

          {(() => {
            const selectedData = data[selectedDate];
            if (!selectedData) return null;
            const allTasks = [
              ...(selectedData.timeBlocks?.morning || []),
              ...(selectedData.timeBlocks?.afternoon1 || []),
              ...(selectedData.timeBlocks?.afternoon2 || [])
            ].filter(task => task && (task.text || task));
            if (allTasks.length === 0) return null;
            const completedTasks = allTasks.filter(task => task.done);
            const pendingTasks = allTasks.filter(task => !task.done);

            return (
              <div className="flex gap-6 text-xs text-gray-400">
                <span>{completedTasks.length} completed</span>
                <span>{pendingTasks.length} remaining</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TimeboxTool;
